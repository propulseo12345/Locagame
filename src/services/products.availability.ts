import { supabase } from '../lib/supabase';

export class ProductsAvailability {
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
      console.error('Error checking availability:', error);
      throw error;
    }

    return data as boolean;
  }

  /**
   * Récupère le stock disponible en temps réel pour un produit
   */
  static async getAvailableStock(productId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_available_stock', {
      p_product_id: productId,
    });

    if (error) {
      console.error('Error getting available stock:', error);
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
      console.error('Error fetching product:', productError);
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
      console.error('Error fetching availabilities:', availError);
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
      console.error('Error creating reservation availability:', error);
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
      console.error('Error releasing reservation availability:', error);
      throw error;
    }
  }
}
