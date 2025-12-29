import { supabase } from '../lib/supabase';
import { Order } from '../types';

export class ReservationsService {
  /**
   * Crée une nouvelle réservation complète avec items et tâche de livraison
   */
  static async createReservation(orderData: {
    customer_id: string;
    start_date: string;
    end_date: string;
    delivery_time?: string;
    delivery_type: 'delivery' | 'pickup';
    delivery_address_id?: string;
    zone_id?: string;
    event_type?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      duration_days: number;
      unit_price: number;
      subtotal: number;
    }>;
    subtotal: number;
    delivery_fee: number;
    discount: number;
    deposit?: number;
    total: number;
    notes?: string;
    payment_method?: string;
  }): Promise<any> {
    try {
      // 1. Créer la réservation principale
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          customer_id: orderData.customer_id,
          start_date: orderData.start_date,
          end_date: orderData.end_date,
          delivery_time: orderData.delivery_time,
          delivery_type: orderData.delivery_type,
          delivery_address_id: orderData.delivery_address_id,
          zone_id: orderData.zone_id,
          event_type: orderData.event_type,
          notes: orderData.notes,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.delivery_fee,
          discount: orderData.discount,
          deposit: orderData.deposit || 0,
          total: orderData.total,
          payment_method: orderData.payment_method,
          status: 'pending',
          payment_status: 'pending',
        })
        .select('*')
        .single();

      if (reservationError) {
        console.error('Error creating reservation:', reservationError);
        throw reservationError;
      }

      // 2. Créer les items de réservation
      const itemsToInsert = orderData.items.map(item => ({
        reservation_id: reservation.id,
        product_id: item.product_id,
        quantity: item.quantity,
        duration_days: item.duration_days,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('reservation_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error creating reservation items:', itemsError);
        // Rollback: supprimer la réservation si les items échouent
        await supabase.from('reservations').delete().eq('id', reservation.id);
        throw itemsError;
      }

      // 2.5. Les stocks sont validés automatiquement via le trigger "validate_stock_before_reservation"

      // 3. Si livraison, créer automatiquement les tâches de livraison ET de retour
      if (orderData.delivery_type === 'delivery' && orderData.delivery_address_id) {
        try {
          // Récupérer les infos complètes pour la tâche
          const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('id', orderData.customer_id)
            .single();

          const { data: address } = await supabase
            .from('addresses')
            .select('*')
            .eq('id', orderData.delivery_address_id)
            .single();

          const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', orderData.items.map(i => i.product_id));

          // Créer la tâche de LIVRAISON (start_date)
          await supabase.from('delivery_tasks').insert({
            reservation_id: reservation.id,
            order_number: `ORD-${reservation.id.substring(0, 8)}-DELIVERY`,
            type: 'delivery',
            scheduled_date: orderData.start_date,
            scheduled_time: orderData.delivery_time || '09:00',
            status: 'scheduled',
            customer_data: customer,
            address_data: address,
            products_data: products,
          });

          // Créer la tâche de RETOUR/RÉCUPÉRATION (end_date)
          await supabase.from('delivery_tasks').insert({
            reservation_id: reservation.id,
            order_number: `ORD-${reservation.id.substring(0, 8)}-PICKUP`,
            type: 'pickup',
            scheduled_date: orderData.end_date,
            scheduled_time: orderData.delivery_time || '09:00',
            status: 'scheduled',
            customer_data: customer,
            address_data: address,
            products_data: products,
          });
        } catch (taskError) {
          console.error('⚠️ Erreur création tâche (non-bloquant):', taskError);
          // Non-bloquant: la réservation est déjà créée
        }
      }

      // 4. Retourner la réservation complète avec items
      const { data: fullReservation } = await supabase
        .from('reservations')
        .select('*, customer:customers(*), reservation_items:reservation_items(*)')
        .eq('id', reservation.id)
        .single();

      return fullReservation;

    } catch (error) {
      console.error('Error in createReservation:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les réservations d'un client
   */
  static async getCustomerReservations(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, customer:customers(*), reservation_items:reservation_items(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer reservations:', error);
      throw error;
    }

    return data as Order[];
  }

  /**
   * Récupère une réservation par ID
   */
  static async getReservationById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, customer:customers(*), reservation_items:reservation_items(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching reservation:', error);
      throw error;
    }

    return data as Order;
  }

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
    return await this.updateReservationStatus(id, 'cancelled');
  }

  /**
   * Récupère toutes les réservations (admin)
   */
  static async getAllReservations(
    filters?: {
      status?: Order['status'];
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<Order[]> {
    let query = supabase
      .from('reservations')
      .select('*, customer:customers(*), reservation_items:reservation_items(*)')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte('start_date', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('end_date', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all reservations:', error);
      throw error;
    }

    return data as Order[];
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
    // Récupérer toutes les réservations avec delivery_type = 'delivery'
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*, customer:customers(*), reservation_items:reservation_items(*)')
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
