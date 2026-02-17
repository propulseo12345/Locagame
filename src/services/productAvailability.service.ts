import { supabase } from '../lib/supabase';

export class ProductAvailabilityService {
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

  static async getProductsWithStock(): Promise<any[]> {
    const { data, error } = await supabase
      .from('products_with_available_stock')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products with stock:', error);
      throw error;
    }

    return data || [];
  }

  static async getProductAvailability(productId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('product_availability')
      .select('*')
      .eq('product_id', productId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching product availability:', error);
      throw error;
    }

    return data || [];
  }

  static async createAvailability(availability: {
    product_id: string;
    start_date: string;
    end_date: string;
    quantity: number;
    status: 'maintenance' | 'blocked';
    buffer_hours?: number;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('product_availability')
      .insert({
        product_id: availability.product_id,
        start_date: availability.start_date,
        end_date: availability.end_date,
        quantity: availability.quantity,
        status: availability.status,
        buffer_hours: availability.buffer_hours || 24,
        reservation_id: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating availability:', error);
      throw error;
    }

    return data;
  }

  static async deleteAvailability(availabilityId: string): Promise<void> {
    const { error } = await supabase
      .from('product_availability')
      .delete()
      .eq('id', availabilityId);

    if (error) {
      console.error('Error deleting availability:', error);
      throw error;
    }
  }

  static async getAvailableStockForDates(
    productId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
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

    const totalBlocked = (availabilities || []).reduce(
      (sum, a) => sum + (a.quantity || 0),
      0
    );

    return Math.max(0, totalStock - totalBlocked);
  }

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
