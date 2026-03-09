import { supabase } from '../lib/supabase';
import { Order } from '../types';

export class ReservationsPayments {
  /**
   * Met à jour le statut de paiement
   */
  static async updatePaymentStatus(
    id: string,
    paymentStatus: Order['payment_status']
  ): Promise<Order> {
    const { data, error } = await supabase
      .from('reservations')
      .update({ payment_status: paymentStatus })
      .eq('id', id)
      .select('*, customer:customers(*), reservation_items:reservation_items(*)')
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }

    return data as Order;
  }

  /**
   * Synchronise le statut de paiement avec Stripe (admin only)
   */
  static async syncPaymentWithStripe(reservationId: string): Promise<{
    status: string;
    payment_confirmed: boolean;
    reservation_status?: string;
    payment_status?: string;
    message?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('sync-reservation-payment', {
      body: { reservation_id: reservationId },
    });

    if (error) {
      console.error('[ReservationsService] Sync payment error:', error);
      let errorMessage = 'Erreur de synchronisation';
      try {
        if (error.context && typeof error.context.json === 'function') {
          const body = await error.context.json();
          errorMessage = body?.error || errorMessage;
        }
      } catch { /* ignore */ }
      throw new Error(errorMessage);
    }

    return data;
  }
}
