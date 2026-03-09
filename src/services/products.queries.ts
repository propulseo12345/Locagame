import { supabase } from '../lib/supabase';
import { Product, FilterOptions } from '../types';
import { normalizeProduct } from './products.normalizers';

export class ProductsQueries {
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

    return (data || []).map(normalizeProduct);
  }

  /**
   * Récupère les produits mis en avant (limité, léger)
   * Priorité : produits marqués featured, sinon produits avec prix > 0
   */
  static async getFeaturedProducts(limit = 4): Promise<Product[]> {
    // 1. Essayer les produits marqués "featured"
    const { data: featured, error: featuredError } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (featuredError) {
      console.error('Error fetching featured products:', featuredError);
      throw featuredError;
    }

    if (featured && featured.length >= limit) {
      return featured.map(normalizeProduct);
    }

    // 2. Fallback : produits avec prix > 0, triés par prix décroissant
    const remaining = limit - (featured?.length || 0);
    const excludeIds = (featured || []).map((p: any) => p.id);

    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .gt('pricing->oneDay', 0);

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data: fallback, error: fallbackError } = await query
      .order('pricing->oneDay', { ascending: false })
      .limit(remaining);

    if (fallbackError) {
      console.error('Error fetching fallback featured products:', fallbackError);
      throw fallbackError;
    }

    return [...(featured || []), ...(fallback || [])].map(normalizeProduct);
  }

  /**
   * Recherche de produits par texte (pour autocomplete)
   */
  static async searchProducts(query: string, limit = 8): Promise<Product[]> {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('products')
      .select('id, name, images, pricing, category:categories(name)')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    return (data || []).map(normalizeProduct);
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

    return data ? normalizeProduct(data) : null;
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
   * Récupère le nombre de produits par catégorie (requête légère)
   */
  static async getProductCountsByCategory(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('products')
      .select('category_id')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching product counts:', error);
      throw error;
    }

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      counts[row.category_id] = (counts[row.category_id] || 0) + 1;
    }
    return counts;
  }
}
