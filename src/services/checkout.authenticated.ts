import { ReservationsService } from './reservations.service';
import { CustomersService } from './customers.service';
import { AddressesService } from './addresses.service';
import { ProductsService } from './products.service';
import { checkAvailability } from '../utils/availability';
import type { CheckoutPayload, CheckoutResult } from './checkout.types';

export class CheckoutAuthenticated {
  /**
   * Crée une réservation pour un utilisateur connecté
   * Utilise les services existants avec les policies RLS
   */
  static async createAuthenticatedCheckout(
    userId: string,
    payload: CheckoutPayload
  ): Promise<CheckoutResult> {
    let customerId = userId;
    let deliveryAddressId: string | undefined;

    try {
      // 0. SÉCURITÉ: Vérifier la disponibilité de TOUS les produits AVANT toute opération
      for (const item of payload.items) {
        const availability = await checkAvailability(
          item.product_id,
          payload.start_date,
          payload.end_date,
          item.quantity
        );

        // Si erreur de vérification OU indisponible -> bloquer la commande
        if (!availability.available) {
          const errorMsg = availability.error
            ? availability.error
            : 'Un ou plusieurs produits ne sont plus disponibles pour les dates sélectionnées';
          return {
            success: false,
            error: errorMsg
          };
        }
      }

      // 1. Vérifier/créer le customer
      const existingCustomer = await CustomersService.getCustomerById(userId);

      if (!existingCustomer) {
        // Créer le profil customer pour cet utilisateur
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
        customerId = newCustomer.id;
      } else {
        // Mettre à jour si nécessaire
        await CustomersService.updateCustomer(userId, {
          first_name: payload.first_name,
          last_name: payload.last_name,
          phone: payload.phone,
          customer_type: payload.customer_type,
          company_name: payload.company_name,
          siret: payload.siret,
        });
      }

      // 2. Créer l'adresse de livraison (si livraison)
      if (payload.delivery_type === 'delivery' && payload.address) {
        const addressData = await AddressesService.createAddress(customerId, {
          address_line1: payload.address.address_line1,
          address_line2: payload.address.address_line2,
          city: payload.address.city,
          postal_code: payload.address.postal_code,
          is_default: false,
        });
        deliveryAddressId = addressData.id;
      }

      // 3. Calculer la caution
      const depositAmount = Math.max(Math.ceil(payload.subtotal * 0.20), 50);

      // 4. Créer la réservation
      const reservation = await ReservationsService.createReservation({
        customer_id: customerId,
        start_date: payload.start_date,
        end_date: payload.end_date,
        start_slot: payload.start_slot,
        end_slot: payload.end_slot,
        delivery_type: payload.delivery_type,
        delivery_address_id: deliveryAddressId,
        delivery_time: payload.delivery_time,
        pickup_time: payload.pickup_time,
        return_time: payload.return_time,
        event_type: payload.event_type,
        event_details: payload.event_details,
        recipient_data: payload.recipient_data,
        notes: payload.notes,
        items: payload.items,
        subtotal: payload.subtotal,
        delivery_fee: payload.delivery_fee,
        discount: payload.discount || 0,
        total: payload.total,
        deposit_amount: depositAmount,
        cgv_accepted: payload.cgv_accepted,
        newsletter_accepted: payload.newsletter_accepted || false,
        is_business: payload.is_business || false,
        billing_company_name: payload.billing_company_name,
        billing_vat_number: payload.billing_vat_number,
        billing_address_line1: payload.billing_address_line1,
        billing_address_line2: payload.billing_address_line2,
        billing_postal_code: payload.billing_postal_code,
        billing_city: payload.billing_city,
        billing_country: payload.billing_country,
        delivery_is_mandatory: payload.delivery_is_mandatory || false,
        pickup_is_mandatory: payload.pickup_is_mandatory || false,
        pricing_breakdown: payload.pricing_breakdown,
      });

      // 5. Bloquer le stock pour chaque produit
      for (const item of payload.items) {
        await ProductsService.createReservationAvailability({
          product_id: item.product_id,
          start_date: payload.start_date,
          end_date: payload.end_date,
          quantity: item.quantity,
          reservation_id: reservation.id,
        });
      }

      return {
        success: true,
        reservation_id: reservation.id,
        customer_id: customerId,
        customer_email: payload.email,
        total: payload.total,
        deposit_amount: depositAmount,
        status: 'pending_payment'
      };

    } catch (error) {
      console.error('[CheckoutService] Authenticated checkout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la réservation'
      };
    }
  }
}
