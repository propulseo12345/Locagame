import { supabase } from '../lib/supabase';
import { Product } from '../types';

export class ProductsAdmin {
  /**
   * Crée un nouveau produit (admin)
   */
  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return data as Product;
  }

  /**
   * Met à jour un produit (admin)
   */
  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return data as Product;
  }

  /**
   * Supprime un produit (admin)
   */
  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Récupère les disponibilités d'un produit (admin)
   */
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

  /**
   * Crée une disponibilité manuelle (maintenance ou blocked) (admin)
   */
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
        reservation_id: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating availability:', error);
      throw error;
    }

    return data;
  }

  /**
   * Supprime une disponibilité (admin)
   */
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
}
