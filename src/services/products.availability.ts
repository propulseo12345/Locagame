import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export class ProductsAvailability {
  /**
   * Vérifie quels product IDs sont encore actifs en base.
   * Retourne le Set des IDs actifs.
   */
  static async getActiveProductIds(productIds: string[]): Promise<Set<string>> {
    if (productIds.length === 0) return new Set();

    const { data, error } = await supabase
      .from('products')
      .select('id')
      .in('id', productIds)
      .eq('is_active', true);

    if (error) {
      logger.error('Error validating active products', error);
      throw error;
    }

    return new Set((data || []).map((p) => p.id));
  }

  /**
   * Vérifie la disponibilité d'un produit pour une période donnée
   */
  static async checkAvailability(
    productId: string,
    startDate: string,
    endDate: string,
    quantity: number
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_product_availability_for_dates', {
      p_product_id: productId,
      p_quantity: quantity,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      logger.error('Error checking availability', error);
      throw error;
    }

    return data as boolean;
  }

  /**
   * Récupère le stock disponible en temps réel pour un produit
   */
  static async getAvailableStock(productId: string): Promise<number> {
    const { data, error } = await (supabase as any).rpc('get_available_stock', {
      p_product_id: productId,
    });

    if (error) {
      logger.error('Error getting available stock', error);
      throw error;
    }

    return data as number;
  }

  /**
   * Récupère le stock disponible pour un produit sur une période donnée
   */
  static async getAvailableStockForDates(
    productId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    // 1. Récupérer le produit pour connaître le stock total
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('total_stock')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      logger.error('Error fetching product', productError);
      throw new Error('Produit non trouvé');
    }

    const totalStock = product.total_stock || 1;

    // 2. Récupérer toutes les réservations qui chevauchent la période
    // Chevauchement: start_date <= endDate AND end_date >= startDate
    const { data: availabilities, error: availError } = await supabase
      .from('product_availability')
      .select('quantity, status')
      .eq('product_id', productId)
      .lte('start_date', endDate)
      .gte('end_date', startDate)
      .in('status', ['reserved', 'blocked', 'maintenance']);

    if (availError) {
      logger.error('Error fetching availabilities', availError);
      throw availError;
    }

    // 3. Calculer le stock bloqué
    const totalBlocked = (availabilities || []).reduce(
      (sum, a) => sum + (a.quantity || 0),
      0
    );

    return Math.max(0, totalStock - totalBlocked);
  }

  /**
   * Crée un blocage de stock pour une réservation
   */
  static async createReservationAvailability(data: {
    product_id: string;
    start_date: string;
    end_date: string;
    quantity: number;
    reservation_id: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('product_availability')
      .insert({
        product_id: data.product_id,
        start_date: data.start_date,
        end_date: data.end_date,
        quantity: data.quantity,
        reservation_id: data.reservation_id,
        status: 'reserved',
        buffer_hours: 24,
      });

    if (error) {
      logger.error('Error creating reservation availability', error);
      throw error;
    }
  }

  /**
   * Libère le stock d'une réservation annulée
   */
  static async releaseReservationAvailability(reservationId: string): Promise<void> {
    const { error } = await supabase
      .from('product_availability')
      .delete()
      .eq('reservation_id', reservationId);

    if (error) {
      logger.error('Error releasing reservation availability', error);
      throw error;
    }
  }
}
