import { supabase } from '../lib/supabase';

export class CheckoutPaymentsService {
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
