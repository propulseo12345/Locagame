import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { logger } from '../lib/logger';

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
      logger.error('Error updating reservation status', error);
      throw error;
    }

    return data as Order;
  }

  /**
   * Annule une réservation
   */
  static async cancelReservation(id: string): Promise<Order> {
    // Valider que la réservation peut être annulée
    // @ts-expect-error — RPC restore_stock not in database.types.ts
    const { error: validateError } = await supabase.rpc('restore_stock', {
      p_reservation_id: id
    });

    if (validateError) {
      logger.error('Error validating cancellation', validateError);
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
    // @ts-expect-error — RPC refund_deposit not in database.types.ts
    const { error } = await supabase.rpc('refund_deposit', {
      p_reservation_id: reservationId
    });

    if (error) {
      logger.error('Error refunding deposit', error);
      throw error;
    }
  }

  /**
   * Récupère les réservations non assignées
   * = réservations livraison sans delivery_task assignée (pas de task, ou task sans technicien)
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
      logger.error('Error fetching reservations', reservationsError);
      throw reservationsError;
    }

    if (!reservations || reservations.length === 0) {
      return [];
    }

    // Récupérer TOUTES les delivery_tasks pour ces réservations
    const reservationIds = reservations.map(r => r.id);
    const { data: allTasks, error: tasksError } = await supabase
      .from('delivery_tasks')
      .select('reservation_id, id, technician_id, status')
      .in('reservation_id', reservationIds);

    if (tasksError) {
      logger.error('Error fetching delivery tasks', tasksError);
      throw tasksError;
    }

    // Map: reservation_id → tâche non assignée (technician_id null)
    const unassignedTaskMap = new Map<string, string>();
    // Set: reservations qui ont au moins une tâche avec technicien
    const assignedReservationIds = new Set<string>();

    for (const task of allTasks || []) {
      if (!task.reservation_id) continue;
      if (task.technician_id) {
        assignedReservationIds.add(task.reservation_id);
      } else {
        // Task sans technicien — candidat pour assignation
        unassignedTaskMap.set(task.reservation_id, task.id);
      }
    }

    // Une réservation est "non assignée" si:
    // - elle n'a aucune tâche avec technicien
    const unassigned = reservations
      .filter(res => !assignedReservationIds.has(res.id))
      .map(res => ({
        ...res,
        delivery_task_id: unassignedTaskMap.get(res.id) || undefined,
      }));

    return unassigned as unknown as Array<Order & { delivery_task_id?: string }>;
  }
}
