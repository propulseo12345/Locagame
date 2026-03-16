import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  icon: string;
  created_at: string;
}

export class CategoriesService {
  /**
   * Récupère toutes les catégories
   */
  static async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      logger.error('Error fetching categories', error);
      throw error;
    }

    return data as Category[];
  }

  /**
   * Récupère une catégorie par son slug
   */
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching category', error);
      throw error;
    }

    return data as Category;
  }

  /**
   * Récupère une catégorie par son ID
   */
  static async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching category', error);
      throw error;
    }

    return data as Category;
  }

  /**
   * Crée une nouvelle catégorie (admin)
   */
  static async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      logger.error('Error creating category', error);
      throw error;
    }

    return data as Category;
  }

  /**
   * Met à jour une catégorie (admin)
   */
  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating category', error);
      throw error;
    }

    return data as Category;
  }

  /**
   * Retourne un objet permettant de résoudre un nom/slug de catégorie en UUID
   * et de lister les slugs valides (pour la validation à l'import)
   */
  static async getCategoriesMap(): Promise<{
    resolve: (nameOrSlug: string) => string | null;
    slugs: string[];
  }> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug');

    if (error) {
      logger.error('Error fetching categories map', error);
      throw error;
    }

    const categories = data as Array<{ id: string; name: string; slug: string }>;
    const byName = new Map<string, string>();
    const bySlug = new Map<string, string>();

    for (const cat of categories) {
      byName.set(cat.name.toLowerCase(), cat.id);
      bySlug.set(cat.slug.toLowerCase(), cat.id);
    }

    return {
      resolve: (nameOrSlug: string) => {
        const key = nameOrSlug.toLowerCase();
        return byName.get(key) ?? bySlug.get(key) ?? null;
      },
      slugs: categories.map(c => c.slug),
    };
  }

  /**
   * Supprime une catégorie (admin)
   */
  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      logger.error('Error deleting category', error);
      throw error;
    }
  }
}
