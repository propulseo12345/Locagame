import { supabase } from '../lib/supabase';

export interface TimeSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  slot_type: 'delivery' | 'pickup' | 'both';
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export class TimeSlotsService {
  /**
   * Récupère tous les créneaux horaires actifs
   */
  static async getTimeSlots(slotType?: 'delivery' | 'pickup' | 'both'): Promise<TimeSlot[]> {
    let query = supabase
      .from('time_slots')
      .select('*')
      .eq('is_active', true);

    if (slotType && slotType !== 'both') {
      query = query.or(`slot_type.eq.${slotType},slot_type.eq.both`);
    }

    const { data, error } = await query.order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }

    return data as TimeSlot[];
  }

  /**
   * Récupère tous les créneaux horaires (admin)
   */
  static async getAllTimeSlots(): Promise<TimeSlot[]> {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching all time slots:', error);
      throw error;
    }

    return data as TimeSlot[];
  }

  /**
   * Récupère un créneau horaire par ID
   */
  static async getTimeSlotById(id: string): Promise<TimeSlot | null> {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching time slot:', error);
      throw error;
    }

    return data as TimeSlot;
  }

  /**
   * Crée un nouveau créneau horaire (admin)
   */
  static async createTimeSlot(timeSlot: Omit<TimeSlot, 'id' | 'created_at'>): Promise<TimeSlot> {
    const { data, error } = await supabase
      .from('time_slots')
      .insert(timeSlot)
      .select()
      .single();

    if (error) {
      console.error('Error creating time slot:', error);
      throw error;
    }

    return data as TimeSlot;
  }

  /**
   * Met à jour un créneau horaire (admin)
   */
  static async updateTimeSlot(id: string, updates: Partial<TimeSlot>): Promise<TimeSlot> {
    const { data, error } = await supabase
      .from('time_slots')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating time slot:', error);
      throw error;
    }

    return data as TimeSlot;
  }

  /**
   * Supprime un créneau horaire (admin)
   */
  static async deleteTimeSlot(id: string): Promise<void> {
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting time slot:', error);
      throw error;
    }
  }
}
