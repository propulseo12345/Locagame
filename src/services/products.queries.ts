import { supabase } from '../lib/supabase';
import { Product, FilterOptions } from '../types';
import { normalizeProduct } from './products.normalizers';
import { logger } from '../lib/logger';

const PRODUCT_SELECT = '*, category:categories!products_category_id_fkey(*), product_categories(category_id, categories(id, name, slug))';
const PRODUCT_SELECT_CATEGORY_FILTER = '*, category:categories!products_category_id_fkey(*), product_categories!inner(category_id, categories(id, name, slug))';

export class ProductsQueries {
  /**
   * Récupère tous les produits avec filtres optionnels
   */
  static async getProducts(filters?: FilterOptions): Promise<Product[]> {
    const hasCategory = !!filters?.category;
    let query = supabase
      .from('products')
      .select(hasCategory ? PRODUCT_SELECT_CATEGORY_FILTER : PRODUCT_SELECT)
      .eq('is_active', true);

    // Filtre catégorie via product_categories (many-to-many)
    if (hasCategory) {
      query = query.eq('product_categories.category_id', filters!.category!);
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
      logger.error('Error fetching products', error);
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
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .eq('featured', true)
      .gt('total_stock', 0)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (featuredError) {
      logger.error('Error fetching featured products', featuredError);
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
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .gt('pricing->oneDay', 0)
      .gt('total_stock', 0);

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data: fallback, error: fallbackError } = await query
      .order('pricing->oneDay', { ascending: false })
      .limit(remaining);

    if (fallbackError) {
      logger.error('Error fetching fallback featured products', fallbackError);
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
      .select('id, name, images, pricing, category:categories!products_category_id_fkey(name), product_categories(category_id, categories(id, name, slug))')
      .eq('is_active', true)
      .gt('total_stock', 0)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      logger.error('Error searching products', error);
      throw error;
    }

    return (data || []).map(normalizeProduct);
  }

  /**
   * Récupère un produit par son ID
   */
  static async getProductById(id: string, includeInactive = false): Promise<Product | null> {
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id);

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.single();

    if (error) {
      logger.error('Error fetching product', error);
      throw error;
    }

    return data ? normalizeProduct(data) : null;
  }

  /**
   * Récupère tous les produits avec leurs stocks disponibles en temps réel
   */
  static async getProductsWithStock(): Promise<unknown[]> {
    const { data, error } = await supabase
      // @ts-expect-error — view products_with_available_stock not in database.types.ts
      .from('products_with_available_stock')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching products with stock', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Récupère tous les produits (actifs + inactifs) pour l'export Excel admin
   */
  static async getAllProductsForExport(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching products for export', error);
      throw error;
    }

    return (data || []).map(normalizeProduct);
  }

  /**
   * Récupère le nombre de produits par catégorie via la table de liaison
   * Un produit multi-catégories compte pour chaque catégorie
   */
  static async getProductCountsByCategory(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('products')
      .select('id, is_active, total_stock, product_categories(category_id)')
      .eq('is_active', true)
      .gt('total_stock', 0);

    if (error) {
      logger.error('Error fetching product counts', error);
      throw error;
    }

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      for (const pc of (row as any).product_categories || []) {
        if (pc.category_id) {
          counts[pc.category_id] = (counts[pc.category_id] || 0) + 1;
        }
      }
    }
    return counts;
  }
}
