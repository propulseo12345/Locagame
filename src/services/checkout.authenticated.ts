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
  deposit?: number;
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
        deliveryAddressId = addressData.id;
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
          p_zone_id: zoneId,
          p_metadata: rpcMetadata as unknown as Json,
          // Sous-total + majorations (SANS livraison) pour la validation anti-manipulation
          p_client_total: (payload.subtotal || 0) + (payload.surcharges_total || 0),
          p_delivery_is_mandatory: payload.delivery_is_mandatory ?? false,
          p_pickup_is_mandatory: payload.pickup_is_mandatory ?? false,
          // p_delivery_fee SUPPRIMÉ — le serveur calcule depuis delivery_zones
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

      // 4. Créer les tâches de livraison (non-bloquant)
      try {
        await this.createDeliveryTasks(
          result.reservation_id!,
          customerId,
          deliveryAddressId,
          payload
        );
      } catch (taskError) {
        logger.error('[CheckoutService] Erreur création tâches (non-bloquant)', taskError);
      }

      return {
        success: true,
        reservation_id: result.reservation_id,
        customer_id: customerId,
        customer_email: payload.email,
        total: result.total,
        deposit_amount: result.deposit,
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

  /**
   * Crée les delivery_tasks après la réservation (non-bloquant).
   * Reprend la logique de ReservationsCreation.createReservation §3.
   */
  private static async createDeliveryTasks(
    reservationId: string,
    customerId: string,
    deliveryAddressId: string | undefined,
    payload: CheckoutPayload
  ): Promise<void> {
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', payload.items.map((i) => i.product_id));

    if (payload.delivery_type === 'delivery' && deliveryAddressId) {
      const { data: address } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', deliveryAddressId)
        .single();

      // Tâche LIVRAISON (start_date)
      await supabase.from('delivery_tasks').insert({
        reservation_id: reservationId,
        order_number: `ORD-${reservationId.substring(0, 8)}-DELIVERY`,
        type: 'delivery',
        scheduled_date: payload.start_date,
        scheduled_time: payload.delivery_time || '09:00',
        status: 'scheduled',
        customer_data: customer as unknown as Json,
        address_data: address as unknown as Json,
        products_data: products as unknown as Json,
      });

      // Tâche RETOUR (end_date)
      await supabase.from('delivery_tasks').insert({
        reservation_id: reservationId,
        order_number: `ORD-${reservationId.substring(0, 8)}-PICKUP`,
        type: 'pickup',
        scheduled_date: payload.end_date,
        scheduled_time: payload.delivery_time || '09:00',
        status: 'scheduled',
        customer_data: customer as unknown as Json,
        address_data: address as unknown as Json,
        products_data: products as unknown as Json,
      });
    } else if (payload.delivery_type === 'pickup') {
      const warehouseAddress = {
        name: 'Entrepôt LOCAGAME',
        street: 'Zone Industrielle des Paluds',
        city: '13400 Aubagne',
      };

      // Tâche RETRAIT CLIENT (start_date)
      await supabase.from('delivery_tasks').insert({
        reservation_id: reservationId,
        order_number: `ORD-${reservationId.substring(0, 8)}-CLIENT-PICKUP`,
        type: 'client_pickup',
        scheduled_date: payload.start_date,
        scheduled_time: payload.pickup_time || '09:00',
        status: 'scheduled',
        customer_data: customer as unknown as Json,
        address_data: warehouseAddress as unknown as Json,
        products_data: products as unknown as Json,
        notes: "Retrait client à l'entrepôt",
      });

      // Tâche RETOUR CLIENT (end_date)
      await supabase.from('delivery_tasks').insert({
        reservation_id: reservationId,
        order_number: `ORD-${reservationId.substring(0, 8)}-CLIENT-RETURN`,
        type: 'client_return',
        scheduled_date: payload.end_date,
        scheduled_time: payload.return_time || '09:00',
        status: 'scheduled',
        customer_data: customer as unknown as Json,
        address_data: warehouseAddress as unknown as Json,
        products_data: products as unknown as Json,
        notes: "Retour client à l'entrepôt",
      });
    }
  }
}
