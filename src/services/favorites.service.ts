import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { logger } from '../lib/logger';

export class FavoritesService {
  /**
   * Récupère tous les favoris d'un client
   */
  static async getFavorites(customerId: string): Promise<Product[]> {
    // D'abord récupérer les IDs des favoris
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('customer_favorites')
      .select('product_id')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (favoritesError) {
      logger.error('Error fetching favorites', favoritesError);
      throw favoritesError;
    }

    if (!favoritesData || favoritesData.length === 0) {
      return [];
    }

    // Ensuite récupérer les produits complets
    const productIds = favoritesData.map(f => f.product_id);
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories!products_category_id_fkey(
          id,
          name,
          slug,
          description
        )
      `)
      .in('id', productIds)
      .eq('is_active', true);

    if (productsError) {
      logger.error('Error fetching products for favorites', productsError);
      throw productsError;
    }

    if (!productsData || productsData.length === 0) {
      return [];
    }

    // Normaliser les produits via normalizeProduct (réutilise la même logique)
    const { normalizeProduct } = await import('./products.normalizers');

    return productsData
      .filter((product) => product !== null)
      .map((product) => normalizeProduct(product as unknown as Parameters<typeof normalizeProduct>[0]));
  }

  /**
   * Vérifie si un produit est dans les favoris
   */
  static async isFavorite(customerId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('customer_favorites')
      .select('id')
      .eq('customer_id', customerId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      // PGRST116 = No rows found (pas en favoris)
      if (error.code === 'PGRST116') {
        return false;
      }
      logger.error('Error checking favorite', error);
      throw error;
    }

    return !!data;
  }

  /**
   * Ajoute un produit aux favoris
   */
  static async addFavorite(customerId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('customer_favorites')
      .insert({
        customer_id: customerId,
        product_id: productId,
      });

    if (error) {
      // Ignorer l'erreur si déjà en favoris (contrainte unique)
      if (error.code !== '23505') {
        logger.error('Error adding favorite', error);
        throw error;
      }
    }
  }

  /**
   * Retire un produit des favoris
   */
  static async removeFavorite(customerId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('customer_favorites')
      .delete()
      .eq('customer_id', customerId)
      .eq('product_id', productId);

    if (error) {
      logger.error('Error removing favorite', error);
      throw error;
    }
  }

  /**
   * Toggle un favori (ajoute si absent, retire si présent)
   */
  static async toggleFavorite(customerId: string, productId: string): Promise<boolean> {
    const isFav = await this.isFavorite(customerId, productId);

    if (isFav) {
      await this.removeFavorite(customerId, productId);
      return false; // Retiré des favoris
    } else {
      await this.addFavorite(customerId, productId);
      return true; // Ajouté aux favoris
    }
  }

  /**
   * Compte le nombre de favoris d'un client
   */
  static async getFavoritesCount(customerId: string): Promise<number> {
    const { count, error } = await supabase
      .from('customer_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId);

    if (error) {
      logger.error('Error counting favorites', error);
      throw error;
    }

    return count || 0;
  }
}
