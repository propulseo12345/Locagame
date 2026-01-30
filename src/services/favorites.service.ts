import { supabase } from '../lib/supabase';
import { Product } from '../types';

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
      console.error('Error fetching favorites:', favoritesError);
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
        category:categories(
          id,
          name,
          slug,
          description
        )
      `)
      .in('id', productIds)
      .eq('is_active', true);

    if (productsError) {
      console.error('Error fetching products for favorites:', productsError);
      throw productsError;
    }

    if (!productsData || productsData.length === 0) {
      return [];
    }

    // Normaliser les produits
    return productsData
      .map((product: any) => {
        if (!product) return null;

        // Normaliser le pricing
        let pricing = { oneDay: 0, weekend: 0, week: 0, custom: 0 };
        if (product.pricing) {
          if (typeof product.pricing === 'object') {
            pricing = {
              oneDay: product.pricing.oneDay || product.pricing.one_day || 0,
              weekend: product.pricing.weekend || 0,
              week: product.pricing.week || 0,
              custom: product.pricing.custom || 0
            };
          }
        }

        // Normaliser les specifications
        let specifications = {
          dimensions: '',
          weight: 0,
          players: { min: 1, max: 10 },
          electricity: false,
          setup_time: 0
        };
        if (product.specifications) {
          if (typeof product.specifications === 'object') {
            specifications = {
              dimensions: product.specifications.dimensions || '',
              weight: product.specifications.weight || 0,
              players: product.specifications.players || { min: 1, max: 10 },
              electricity: product.specifications.electricity || false,
              setup_time: product.specifications.setup_time || product.specifications.setupTime || 0
            };
          }
        }

        return {
          ...product,
          pricing,
          specifications,
          images: Array.isArray(product.images) ? product.images : [],
          total_stock: product.total_stock || 0,
          is_active: product.is_active !== undefined ? product.is_active : true,
          description: product.description || '',
          category: product.category || null,
          // Propriétés optionnelles avec valeurs par défaut
          tags: product.tags || [],
          rating: product.rating || undefined,
          totalReservations: product.totalReservations || product.total_reservations || 0
        };
      })
      .filter((product: any) => product !== null) as Product[];
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
      console.error('Error checking favorite:', error);
      return false; // Retourner false en cas d'erreur plutôt que de throw
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
        console.error('Error adding favorite:', error);
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
      console.error('Error removing favorite:', error);
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
      console.error('Error counting favorites:', error);
      throw error;
    }

    return count || 0;
  }
}
