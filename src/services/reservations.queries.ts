import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { logger } from '../lib/logger';

export class ReservationsQueries {
  /**
   * Récupère toutes les réservations d'un client
   */
  static async getCustomerReservations(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, customer:customers(*), delivery_address:addresses!delivery_address_id(*), reservation_items:reservation_items(*, product:products(name, images))')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching customer reservations', error);
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
      .select('*, customer:customers(*), delivery_address:addresses!delivery_address_id(*), reservation_items:reservation_items(*, product:products(name, images))')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching reservation', error);
      throw error;
    }

    return data as Order;
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
      .select('*, customer:customers(*), delivery_address:addresses!delivery_address_id(*), reservation_items:reservation_items(*, product:products(name))')
      .not('status', 'in', '("pending_payment","expired")')
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
      logger.error('Error fetching all reservations', error);
      throw error;
    }

    return data as Order[];
  }
}
