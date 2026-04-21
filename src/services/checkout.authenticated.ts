import { supabase } from '../lib/supabase';
import { CustomersService } from './customers.service';
import { AddressesService } from './addresses.service';
import type { Json } from '../lib/database.types';
import type { CheckoutPayload, CheckoutResult } from './checkout.types';
import { logger } from '../lib/logger';

/** Shape returned by the validate_and_create_reservation RPC */
interface RpcResult {
  success?: boolean;
  error?: string;
  reservation_id?: string;
  subtotal?: number;
  delivery_fee?: number;
  surcharges?: number;
  total?: number;
  pricing_breakdown?: Record<string, unknown>;
  items?: Array<Record<string, unknown>>;
}

export class CheckoutAuthenticated {
  /**
   * Crée une réservation pour un utilisateur connecté.
   * Les prix sont RECALCULÉS côté serveur par la RPC validate_and_create_reservation.
   * Le client envoie uniquement product_id + quantity ; le serveur fait foi.
   */
  static async createAuthenticatedCheckout(
    userId: string,
    payload: CheckoutPayload
  ): Promise<CheckoutResult> {
    let customerId = userId;
    let deliveryAddressId: string | undefined;
    let zoneId: string | null = null;

    try {
      // 1. Vérifier/créer le customer
      const existingCustomer = await CustomersService.getCustomerById(userId);

      if (!existingCustomer) {
        try {
          const newCustomer = await CustomersService.createCustomer({
            id: userId,
            email: payload.email,
            first_name: payload.first_name,
            last_name: payload.last_name,
            phone: payload.phone,
            customer_type: payload.customer_type,
            company_name: payload.company_name,
            siret: payload.siret,
          });
          customerId = newCustomer.id || userId;
        } catch (createErr: unknown) {
          // Un guest customer avec le même email peut déjà exister.
          // Réutiliser le customer existant et mettre à jour ses infos.
          const errMsg = (createErr as Record<string, unknown>)?.message as string
            || (createErr instanceof Error ? createErr.message : String(createErr));
          if (errMsg.includes('customers_email_key') || errMsg.includes('duplicate key')) {
            logger.log('[CheckoutService] Customer with same email exists, reusing');
            const { data: existingRow } = await supabase
              .from('customers')
              .select('id')
              .eq('email', payload.email)
              .single();

            if (existingRow) {
              customerId = existingRow.id;
              await CustomersService.updateCustomer(customerId, {
                first_name: payload.first_name,
                last_name: payload.last_name,
                phone: payload.phone,
                customer_type: payload.customer_type,
                company_name: payload.company_name,
                siret: payload.siret,
              });
            } else {
              throw createErr;
            }
          } else {
            throw createErr;
          }
        }
      } else {
        await CustomersService.updateCustomer(userId, {
          first_name: payload.first_name,
          last_name: payload.last_name,
          phone: payload.phone,
          customer_type: payload.customer_type,
          company_name: payload.company_name,
          siret: payload.siret,
        });
      }

      // 2. Résoudre la zone de livraison depuis le code postal
      if (payload.delivery_type === 'delivery' && payload.address?.postal_code) {
        const { data: zones } = await supabase
          .from('delivery_zones')
          .select('id')
          .contains('postal_codes', [payload.address.postal_code])
          .eq('is_active', true)
          .limit(1);

        if (zones && zones.length > 0) {
          zoneId = zones[0].id;
        }
      }

      // 3. Créer l'adresse de livraison (si livraison) — avec zone_id
      if (payload.delivery_type === 'delivery' && payload.address) {
        const addressData = await AddressesService.createAddress(customerId, {
          address_line1: payload.address.address_line1,
          address_line2: payload.address.address_line2,
          city: payload.address.city,
          postal_code: payload.address.postal_code,
          zone_id: zoneId,
          is_default: false,
        });
        deliveryAddressId = addressData.id ?? undefined;
      }

      // 4. Appel RPC — le serveur recalcule TOUT (prix, dispo, stock, frais livraison)
      const rpcItems = payload.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        delivery_people_count: item.delivery_people_count ?? 1,
        pickup_people_count: item.pickup_people_count ?? 1,
      }));

      const rpcMetadata: Record<string, unknown> = {
        delivery_address_id: deliveryAddressId ?? null,
        delivery_time: payload.delivery_time ?? null,
        pickup_time: payload.pickup_time ?? null,
        return_time: payload.return_time ?? null,
        start_slot: payload.start_slot ?? 'AM',
        end_slot: payload.end_slot ?? 'AM',
        event_type: payload.event_type ?? null,
        notes: payload.notes ?? null,
        recipient_data: payload.recipient_data ?? null,
        event_details: payload.event_details ?? null,
        cgv_accepted: payload.cgv_accepted ?? false,
        newsletter_accepted: payload.newsletter_accepted ?? false,
        is_business: payload.is_business ?? false,
        billing_company_name: payload.billing_company_name ?? null,
        billing_vat_number: payload.billing_vat_number ?? null,
        billing_address_line1: payload.billing_address_line1 ?? null,
        billing_address_line2: payload.billing_address_line2 ?? null,
        billing_postal_code: payload.billing_postal_code ?? null,
        billing_city: payload.billing_city ?? null,
        billing_country: payload.billing_country ?? 'FR',
      };

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'validate_and_create_reservation',
        {
          p_items: rpcItems as unknown as Json,
          p_start_date: payload.start_date,
          p_end_date: payload.end_date,
          p_delivery_type: payload.delivery_type,
          p_customer_id: customerId,
          p_zone_id: zoneId ?? undefined,
          p_metadata: rpcMetadata as unknown as Json,
          // Sous-total + majorations (SANS livraison) pour la validation anti-manipulation
          p_client_total: (payload.subtotal || 0) + (payload.surcharges_total || 0),
          p_delivery_is_mandatory: payload.delivery_is_mandatory ?? false,
          p_pickup_is_mandatory: payload.pickup_is_mandatory ?? false,
          // Tarif ORS (distance routière réelle × 0,80€/km)
          p_delivery_fee: payload.delivery_fee ?? undefined,
          p_delivery_distance_km: payload.delivery_distance_km ?? undefined,
          // Code promo (validé côté serveur par la RPC)
          p_promo_code: payload.promo_code ?? undefined,
        }
      );

      if (rpcError) {
        logger.error('[CheckoutService] RPC error', rpcError);
        return {
          success: false,
          error: rpcError.message || 'Erreur lors de la création de la réservation',
        };
      }

      const result = rpcData as unknown as RpcResult;

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Erreur lors de la validation des prix',
        };
      }

      return {
        success: true,
        reservation_id: result.reservation_id,
        customer_id: customerId,
        customer_email: payload.email,
        total: result.total,
        status: 'pending_payment',
      };
    } catch (error) {
      logger.error('[CheckoutService] Authenticated checkout error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la réservation',
      };
    }
  }

}
