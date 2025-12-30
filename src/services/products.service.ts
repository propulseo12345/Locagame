import { supabase } from '../lib/supabase';
import { Product, FilterOptions } from '../types';

export class ProductsService {
  /**
   * Récupère tous les produits avec filtres optionnels
   */
  static async getProducts(filters?: FilterOptions): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true);

    // Filtres
    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.price_min) {
      query = query.gte('pricing->oneDay', filters.price_min);
    }

    if (filters?.price_max) {
      query = query.lte('pricing->oneDay', filters.price_max);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // Tri
    switch (filters?.sort_by) {
      case 'price_asc':
        query = query.order('pricing->oneDay', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('pricing->oneDay', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('name', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data as Product[];
  }

  /**
   * Récupère un produit par son ID
   */
  static async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return data as Product;
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
   * Récupère tous les produits avec leurs stocks disponibles en temps réel
   */
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
