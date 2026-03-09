import { supabase } from '../lib/supabase';
import { Order } from '../types';

export class ReservationsAdmin {
  /**
   * Met à jour le statut d'une réservation
   */
  static async updateReservationStatus(
    id: string,
    status: Order['status']
  ): Promise<Order> {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select('*, customer:customers(*), reservation_items:reservation_items(*)')
      .single();

    if (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }

    return data as Order;
  }

  /**
   * Annule une réservation
   */
  static async cancelReservation(id: string): Promise<Order> {
    // Valider que la réservation peut être annulée
    const { error: validateError } = await supabase.rpc('restore_stock', {
      p_reservation_id: id
    });

    if (validateError) {
      console.error('Error validating cancellation:', validateError);
      throw validateError;
    }

    // Mettre à jour le statut (le stock sera automatiquement restauré car le calcul
    // de stock disponible exclut les réservations avec status 'cancelled')
    return await ReservationsAdmin.updateReservationStatus(id, 'cancelled');
  }

  /**
   * Rembourse le dépôt de garantie après vérification du matériel
   */
  static async refundDeposit(reservationId: string): Promise<void> {
    const { error } = await supabase.rpc('refund_deposit', {
      p_reservation_id: reservationId
    });

    if (error) {
      console.error('Error refunding deposit:', error);
      throw error;
    }
  }

  /**
   * Récupère les réservations non assignées (avec delivery_task mais sans technician_id)
   */
  static async getUnassignedReservations(): Promise<Array<Order & { delivery_task_id?: string }>> {
    // Récupérer toutes les réservations avec delivery_type = 'delivery' + adresse
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*, customer:customers(*), reservation_items:reservation_items(*, product:products(name)), delivery_address:addresses!delivery_address_id(*)')
      .eq('delivery_type', 'delivery')
      .in('status', ['pending', 'confirmed', 'preparing'])
      .order('created_at', { ascending: false });

    if (reservationsError) {
      console.error('Error fetching reservations:', reservationsError);
      throw reservationsError;
    }

    // Récupérer toutes les tâches de livraison non assignées
    const { data: unassignedTasks, error: tasksError } = await supabase
      .from('delivery_tasks')
      .select('reservation_id, id')
      .is('technician_id', null)
      .eq('status', 'scheduled');

    if (tasksError) {
      console.error('Error fetching unassigned tasks:', tasksError);
      throw tasksError;
    }

    // Créer un Set des reservation_id non assignées
    const unassignedReservationIds = new Set(
      (unassignedTasks || []).map(task => task.reservation_id)
    );
    const taskIdMap = new Map(
      (unassignedTasks || []).map(task => [task.reservation_id, task.id])
    );

    // Filtrer les réservations qui ont une tâche non assignée
    const unassigned = (reservations || [])
      .filter(res => unassignedReservationIds.has(res.id))
      .map(res => ({
        ...res,
        delivery_task_id: taskIdMap.get(res.id),
      }));

    return unassigned as Array<Order & { delivery_task_id?: string }>;
  }
}
