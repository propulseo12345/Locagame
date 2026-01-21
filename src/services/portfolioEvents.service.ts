import { supabase } from '../lib/supabase';

export interface PortfolioEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  guest_count: number | null;
  event_type_id: string | null;
  images: string[];
  featured_image: string | null;
  products_used: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  // Joined data
  event_type?: {
    id: string;
    name: string;
  } | null;
}

export class PortfolioEventsService {
  /**
   * Récupère tous les événements portfolio actifs
   */
  static async getPortfolioEvents(): Promise<PortfolioEvent[]> {
    const { data, error } = await supabase
      .from('portfolio_events')
      .select(`
        *,
        event_type:event_types(id, name)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching portfolio events:', error);
      throw error;
    }

    return data as PortfolioEvent[];
  }

  /**
   * Récupère les événements portfolio mis en avant
   */
  static async getFeaturedPortfolioEvents(): Promise<PortfolioEvent[]> {
    const { data, error } = await supabase
      .from('portfolio_events')
      .select(`
        *,
        event_type:event_types(id, name)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching featured portfolio events:', error);
      throw error;
    }

    return data as PortfolioEvent[];
  }

  /**
   * Récupère les événements portfolio par type
   */
  static async getPortfolioEventsByType(eventTypeId: string): Promise<PortfolioEvent[]> {
    const { data, error } = await supabase
      .from('portfolio_events')
      .select(`
        *,
        event_type:event_types(id, name)
      `)
      .eq('is_active', true)
      .eq('event_type_id', eventTypeId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching portfolio events by type:', error);
      throw error;
    }

    return data as PortfolioEvent[];
  }

  /**
   * Récupère tous les événements portfolio (admin)
   */
  static async getAllPortfolioEvents(): Promise<PortfolioEvent[]> {
    const { data, error } = await supabase
      .from('portfolio_events')
      .select(`
        *,
        event_type:event_types(id, name)
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching all portfolio events:', error);
      throw error;
    }

    return data as PortfolioEvent[];
  }

  /**
   * Récupère un événement portfolio par ID
   */
  static async getPortfolioEventById(id: string): Promise<PortfolioEvent | null> {
    const { data, error } = await supabase
      .from('portfolio_events')
      .select(`
        *,
        event_type:event_types(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching portfolio event:', error);
      throw error;
    }

    return data as PortfolioEvent;
  }

  /**
   * Crée un nouvel événement portfolio (admin)
   */
  static async createPortfolioEvent(event: Omit<PortfolioEvent, 'id' | 'created_at' | 'event_type'>): Promise<PortfolioEvent> {
    const { data, error } = await supabase
      .from('portfolio_events')
      .insert(event)
      .select(`
        *,
        event_type:event_types(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating portfolio event:', error);
      throw error;
    }

    return data as PortfolioEvent;
  }

  /**
   * Met à jour un événement portfolio (admin)
   */
  static async updatePortfolioEvent(id: string, updates: Partial<PortfolioEvent>): Promise<PortfolioEvent> {
    // Remove joined data from updates
    const { event_type, ...updateData } = updates;

    const { data, error } = await supabase
      .from('portfolio_events')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        event_type:event_types(id, name)
      `)
      .single();

    if (error) {
      console.error('Error updating portfolio event:', error);
      throw error;
    }

    return data as PortfolioEvent;
  }

  /**
   * Supprime un événement portfolio (admin)
   */
  static async deletePortfolioEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('portfolio_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting portfolio event:', error);
      throw error;
    }
  }
}
