import { supabase } from '../lib/supabase';

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_location: string | null;
  rating: number;
  content: string;
  event_date: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export class TestimonialsService {
  /**
   * Récupère les témoignages actifs (pour la page d'accueil)
   */
  static async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }

    return data as Testimonial[];
  }

  /**
   * Récupère les témoignages mis en avant
   */
  static async getFeaturedTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching featured testimonials:', error);
      throw error;
    }

    return data as Testimonial[];
  }

  /**
   * Récupère tous les témoignages (admin)
   */
  static async getAllTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching all testimonials:', error);
      throw error;
    }

    return data as Testimonial[];
  }

  /**
   * Récupère un témoignage par ID
   */
  static async getTestimonialById(id: string): Promise<Testimonial | null> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching testimonial:', error);
      throw error;
    }

    return data as Testimonial;
  }

  /**
   * Crée un nouveau témoignage (admin)
   */
  static async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at'>): Promise<Testimonial> {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonial)
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }

    return data as Testimonial;
  }

  /**
   * Met à jour un témoignage (admin)
   */
  static async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }

    return data as Testimonial;
  }

  /**
   * Supprime un témoignage (admin)
   */
  static async deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }
}
