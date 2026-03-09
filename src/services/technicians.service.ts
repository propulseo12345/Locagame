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
  static async getAllTechnicians(includeInactive = false): Promise<Technician[]> {
    let query = supabase
      .from('technicians')
      .select('*')
      .order('first_name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

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

  /**
   * Crée un technicien via Edge Function (crée aussi le compte auth)
   */
  static async createTechnician(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    vehicleId?: string;
  }): Promise<Technician> {
    const { data, error } = await supabase.functions.invoke(
      'admin-create-technician',
      { body: params }
    );
    if (error) throw new Error(error.message || 'Erreur lors de la cr\u00e9ation');
    if (data?.error) throw new Error(data.error);
    return data.technician as Technician;
  }

  /**
   * Supprime ou désactive un technicien via Edge Function
   */
  static async deleteTechnician(technicianId: string): Promise<{ mode: 'deleted' | 'deactivated' }> {
    const { data, error } = await supabase.functions.invoke(
      'admin-delete-technician',
      { body: { technicianId } }
    );
    if (error) throw new Error(error.message || 'Erreur lors de la suppression');
    if (data?.error) throw new Error(data.error);
    return { mode: data.mode };
  }

  /**
   * Réinitialise le mot de passe d'un technicien via Edge Function
   */
  static async resetPassword(technicianId: string, newPassword: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke(
      'admin-reset-technician-password',
      { body: { technicianId, newPassword } }
    );
    if (error) throw new Error(error.message || 'Erreur lors du reset');
    if (data?.error) throw new Error(data.error);
  }
}
