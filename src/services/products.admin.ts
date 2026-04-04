import { supabase } from '../lib/supabase';
import { Product } from '../types';
import type { Database } from '../lib/database.types';
import { logger } from '../lib/logger';

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type ProductAvailabilityRow = Database['public']['Tables']['product_availability']['Row'];

export class ProductsAdmin {
  /**
   * Crée un nouveau produit (admin)
   */
  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product as unknown as ProductInsert)
      .select()
      .single();

    if (error) {
      logger.error('Error creating product', error);
      throw error;
    }

    return data as unknown as Product;
  }

  /**
   * Met à jour un produit (admin)
   */
  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates as unknown as ProductUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating product', error);
      throw error;
    }

    return data as unknown as Product;
  }

  /**
   * Supprime un produit (admin)
   */
  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      logger.error('Error deleting product', error);
      throw error;
    }
  }

  /**
   * Récupère les disponibilités d'un produit (admin)
   */
  static async getProductAvailability(productId: string): Promise<ProductAvailabilityRow[]> {
    const { data, error } = await supabase
      .from('product_availability')
      .select('*')
      .eq('product_id', productId)
      .order('start_date', { ascending: true });

    if (error) {
      logger.error('Error fetching product availability', error);
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
  }): Promise<ProductAvailabilityRow> {
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
      logger.error('Error creating availability', error);
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
      logger.error('Error deleting availability', error);
      throw error;
    }
  }

  /**
   * Upsert un lot de produits (onConflict: slug) — utilisé par l'import Excel/CSV
   * Retourne le nombre de succès et la liste des erreurs par index
   */
  static async upsertProductsBatch(
    products: Array<{
      name: string;
      slug: string;
      category_id: string;
      description: string;
      pricing: { oneDay: number; weekend: number; week: number; custom: number };
      total_stock: number;
      is_active: boolean;
    }>
  ): Promise<{ success: number; errors: Array<{ index: number; error: string }> }> {
    const inserts = products.map(p => ({
      name: p.name,
      slug: p.slug,
      category_id: p.category_id,
      description: p.description,
      pricing: p.pricing as unknown as ProductInsert['pricing'],
      total_stock: p.total_stock,
      is_active: p.is_active,
    }));

    const { error } = await supabase
      .from('products')
      .upsert(inserts, { onConflict: 'slug' });

    if (error) {
      logger.error('Error upserting products batch', error);
      throw error;
    }

    return { success: products.length, errors: [] };
  }

  /**
   * Remplace toutes les catégories d'un produit (delete + insert)
   */
  static async setProductCategories(productId: string, categoryIds: string[]): Promise<void> {
    const { error: deleteError } = await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      logger.error('Error clearing product categories', deleteError);
      throw deleteError;
    }

    if (categoryIds.length > 0) {
      const { error: insertError } = await supabase
        .from('product_categories')
        .insert(categoryIds.map(cid => ({ product_id: productId, category_id: cid })));

      if (insertError) {
        logger.error('Error inserting product categories', insertError);
        throw insertError;
      }
    }
  }
}
