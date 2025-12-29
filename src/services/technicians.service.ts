import { supabase } from '../lib/supabase';

export interface Technician {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  vehicle_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'van';
  capacity: number; // m³
  license_plate: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class TechniciansService {
  /**
   * Récupère un technicien par son user_id (auth)
   */
  static async getTechnicianByUserId(userId: string): Promise<Technician | null> {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching technician:', error);
      throw error;
    }

    return data as Technician;
  }

  /**
   * Récupère un technicien par son ID
   */
  static async getTechnicianById(id: string): Promise<Technician | null> {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching technician:', error);
      throw error;
    }

    return data as Technician;
  }

  /**
   * Récupère tous les techniciens (admin)
   */
  static async getAllTechnicians(): Promise<Technician[]> {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('is_active', true)
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }

    return data as Technician[];
  }

  /**
   * Met à jour un technicien
   */
  static async updateTechnician(
    id: string,
    updates: Partial<Technician>
  ): Promise<Technician> {
    const { data, error } = await supabase
      .from('technicians')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating technician:', error);
      throw error;
    }

    return data as Technician;
  }

  /**
   * Récupère tous les véhicules
   */
  static async getAllVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }

    return data as Vehicle[];
  }

  /**
   * Récupère un véhicule par son ID
   */
  static async getVehicleById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching vehicle:', error);
      throw error;
    }

    return data as Vehicle;
  }

  /**
   * Assigne un véhicule à un technicien
   */
  static async assignVehicle(technicianId: string, vehicleId: string): Promise<Technician> {
    return this.updateTechnician(technicianId, { vehicle_id: vehicleId });
  }
}
