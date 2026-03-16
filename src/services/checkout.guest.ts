import { supabase } from '../lib/supabase';
import type { Json } from '../lib/database.types';
import type { CheckoutPayload, CheckoutResult } from './checkout.types';
import { logger } from '../lib/logger';

export class CheckoutGuest {
  /**
   * Crée une réservation pour un visiteur non connecté (guest)
   * Utilise la RPC create_guest_checkout() - atomique et sécurisé
   */
  static async createGuestCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
    try {
      const { data, error } = await supabase.rpc('create_guest_checkout', {
        payload: payload as unknown as Json
      });

      if (error) {
        logger.error('[CheckoutService] RPC error', error);
        return {
          success: false,
          error: error.message || 'Erreur lors de la création de la réservation'
        };
      }

      // La RPC retourne un JSONB avec les infos de la réservation
      const result = data as unknown as CheckoutResult;

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Erreur lors de la création de la réservation'
        };
      }

      return result;
    } catch (error) {
      logger.error('[CheckoutService] Exception', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      };
    }
  }
}
