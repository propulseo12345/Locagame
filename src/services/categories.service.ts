import { supabase } from '../lib/supabase';

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
      console.error('Error fetching categories:', error);
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
      console.error('Error fetching category:', error);
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
      console.error('Error fetching category:', error);
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
      console.error('Error creating category:', error);
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
      console.error('Error updating category:', error);
      throw error;
    }

    return data as Category;
  }

  /**
   * Supprime une catégorie (admin)
   */
  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}
