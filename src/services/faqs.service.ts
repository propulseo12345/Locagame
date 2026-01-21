import { supabase } from '../lib/supabase';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export class FaqsService {
  /**
   * Récupère toutes les FAQs actives
   */
  static async getFaqs(): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }

    return data as FAQ[];
  }

  /**
   * Récupère les FAQs par catégorie
   */
  static async getFaqsByCategory(category: string): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs by category:', error);
      throw error;
    }

    return data as FAQ[];
  }

  /**
   * Récupère toutes les FAQs (admin)
   */
  static async getAllFaqs(): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching all FAQs:', error);
      throw error;
    }

    return data as FAQ[];
  }

  /**
   * Récupère une FAQ par ID
   */
  static async getFaqById(id: string): Promise<FAQ | null> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching FAQ:', error);
      throw error;
    }

    return data as FAQ;
  }

  /**
   * Crée une nouvelle FAQ (admin)
   */
  static async createFaq(faq: Omit<FAQ, 'id' | 'created_at'>): Promise<FAQ> {
    const { data, error } = await supabase
      .from('faqs')
      .insert(faq)
      .select()
      .single();

    if (error) {
      console.error('Error creating FAQ:', error);
      throw error;
    }

    return data as FAQ;
  }

  /**
   * Met à jour une FAQ (admin)
   */
  static async updateFaq(id: string, updates: Partial<FAQ>): Promise<FAQ> {
    const { data, error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating FAQ:', error);
      throw error;
    }

    return data as FAQ;
  }

  /**
   * Supprime une FAQ (admin)
   */
  static async deleteFaq(id: string): Promise<void> {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting FAQ:', error);
      throw error;
    }
  }
}
