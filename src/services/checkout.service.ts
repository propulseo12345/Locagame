/**
 * Service de checkout sécurisé
 *
 * Pour les guests: utilise la RPC create_guest_checkout() - atomique et sécurisé
 * Pour les connectés: utilise les services existants avec les policies RLS
 */

import { supabase } from '../lib/supabase';
import { ReservationsService, CustomersService, AddressesService, ProductsService } from './index';
import { checkAvailability } from '../utils/availability';

export interface CheckoutPayload {
  // Client
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  customer_type: 'individual' | 'professional';
  company_name?: string;
  siret?: string;

  // Adresse (si livraison)
  address?: {
    address_line1: string;
    address_line2?: string;
    city: string;
    postal_code: string;
  };

  // Réservation
  start_date: string;
  end_date: string;
  start_slot?: string;
  end_slot?: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_time?: string;
  pickup_time?: string;
  return_time?: string;
  event_type?: string;
  event_details?: Record<string, unknown>;
  recipient_data?: Record<string, unknown>;
  notes?: string;

  // Pricing
  subtotal: number;
  delivery_fee: number;
  discount?: number;
  total: number;
  pricing_breakdown?: Record<string, unknown>;

  // Items
  items: Array<{
    product_id: string;
    quantity: number;
    duration_days: number;
    unit_price: number;
    subtotal: number;
  }>;

  // Flags
  cgv_accepted: boolean;
  newsletter_accepted?: boolean;
  is_business?: boolean;
  delivery_is_mandatory?: boolean;
  pickup_is_mandatory?: boolean;

  // Facturation (si professionnel)
  billing_company_name?: string;
  billing_vat_number?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_postal_code?: string;
  billing_city?: string;
  billing_country?: string;
}

export interface CheckoutResult {
  success: boolean;
  reservation_id?: string;
  order_number?: string;
  customer_id?: string;
  customer_email?: string;
  total?: number;
  deposit_amount?: number;
  status?: string;
  error?: string;
}

export class CheckoutService {
  /**
   * Crée une réservation pour un visiteur non connecté (guest)
   * Utilise la RPC create_guest_checkout() - atomique et sécurisé
   */
  static async createGuestCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
    try {
      const { data, error } = await supabase.rpc('create_guest_checkout', {
        payload: payload as unknown as Record<string, unknown>
      });

      if (error) {
        console.error('[CheckoutService] RPC error:', error);
        return {
          success: false,
          error: error.message || 'Erreur lors de la création de la réservation'
        };
      }

      // La RPC retourne un JSONB avec les infos de la réservation
      const result = data as CheckoutResult;

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Erreur lors de la création de la réservation'
        };
      }

      return result;
    } catch (error) {
      console.error('[CheckoutService] Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      };
    }
  }

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

  /**
   * Point d'entrée principal - détermine automatiquement le mode
   */
  static async checkout(
    userId: string | null,
    payload: CheckoutPayload
  ): Promise<CheckoutResult> {
    if (userId) {
      // Utilisateur connecté - utilise les services classiques avec RLS
      return this.createAuthenticatedCheckout(userId, payload);
    } else {
      // Guest - utilise la RPC atomique
      return this.createGuestCheckout(payload);
    }
  }

  /**
   * Crée une session Stripe Checkout pour une réservation en attente de paiement
   */
  static async createStripeCheckoutSession(
    reservationId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ session_url: string; session_id: string }> {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        reservation_id: reservationId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
    });

    if (error) {
      console.error('[CheckoutService] Stripe session error:', error);
      // Extraire le message d'erreur du body de la réponse si possible
      let errorMessage = 'Erreur lors de la création de la session de paiement';
      try {
        if (error.context && typeof error.context.json === 'function') {
          const body = await error.context.json();
          errorMessage = body?.error || errorMessage;
        }
      } catch {
        // ignore
      }
      throw new Error(errorMessage);
    }

    if (!data?.session_url) {
      throw new Error(data?.error || 'URL de paiement non reçue');
    }

    return { session_url: data.session_url, session_id: data.session_id };
  }

  /**
   * Vérifie si un email est déjà utilisé par un client enregistré
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_email_exists', {
        email_to_check: email
      });

      if (error) {
        console.error('[CheckoutService] check_email_exists error:', error);
        // En cas d'erreur, on autorise (fail open pour UX)
        // La RPC gérera le cas si nécessaire
        return false;
      }

      return data === true;
    } catch {
      return false;
    }
  }
}
