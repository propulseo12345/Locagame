import { supabase } from '../lib/supabase';

export interface EventType {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export class EventTypesService {
  /**
   * Récupère tous les types d'événements actifs
   */
  static async getEventTypes(): Promise<EventType[]> {
    const { data, error } = await supabase
      .from('event_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching event types:', error);
      throw error;
    }

    return data as EventType[];
  }

  /**
   * Récupère tous les types d'événements (admin)
   */
  static async getAllEventTypes(): Promise<EventType[]> {
    const { data, error } = await supabase
      .from('event_types')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching all event types:', error);
      throw error;
    }

    return data as EventType[];
  }

  /**
   * Récupère un type d'événement par ID
   */
  static async getEventTypeById(id: string): Promise<EventType | null> {
    const { data, error } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching event type:', error);
      throw error;
    }

    return data as EventType;
  }

  /**
   * Crée un nouveau type d'événement (admin)
   */
  static async createEventType(eventType: Omit<EventType, 'id' | 'created_at'>): Promise<EventType> {
    const { data, error } = await supabase
      .from('event_types')
      .insert(eventType)
      .select()
      .single();

    if (error) {
      console.error('Error creating event type:', error);
      throw error;
    }

    return data as EventType;
  }

  /**
   * Met à jour un type d'événement (admin)
   */
  static async updateEventType(id: string, updates: Partial<EventType>): Promise<EventType> {
    const { data, error } = await supabase
      .from('event_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event type:', error);
      throw error;
    }

    return data as EventType;
  }

  /**
   * Supprime un type d'événement (admin)
   */
  static async deleteEventType(id: string): Promise<void> {
    const { error } = await supabase
      .from('event_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event type:', error);
      throw error;
    }
  }
}
