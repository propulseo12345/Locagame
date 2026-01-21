import { supabase } from '../lib/supabase';

export interface AccessDifficultyType {
  id: string;
  value: string;
  label: string;
  description: string | null;
  surcharge_percent: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export class AccessDifficultyService {
  /**
   * Récupère tous les types de difficultés d'accès actifs
   */
  static async getAccessDifficulties(): Promise<AccessDifficultyType[]> {
    const { data, error } = await supabase
      .from('access_difficulty_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching access difficulties:', error);
      throw error;
    }

    return data as AccessDifficultyType[];
  }

  /**
   * Récupère tous les types de difficultés (admin)
   */
  static async getAllAccessDifficulties(): Promise<AccessDifficultyType[]> {
    const { data, error } = await supabase
      .from('access_difficulty_types')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching all access difficulties:', error);
      throw error;
    }

    return data as AccessDifficultyType[];
  }

  /**
   * Récupère un type de difficulté par ID
   */
  static async getAccessDifficultyById(id: string): Promise<AccessDifficultyType | null> {
    const { data, error } = await supabase
      .from('access_difficulty_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching access difficulty:', error);
      throw error;
    }

    return data as AccessDifficultyType;
  }

  /**
   * Crée un nouveau type de difficulté (admin)
   */
  static async createAccessDifficulty(accessDifficulty: Omit<AccessDifficultyType, 'id' | 'created_at'>): Promise<AccessDifficultyType> {
    const { data, error } = await supabase
      .from('access_difficulty_types')
      .insert(accessDifficulty)
      .select()
      .single();

    if (error) {
      console.error('Error creating access difficulty:', error);
      throw error;
    }

    return data as AccessDifficultyType;
  }

  /**
   * Met à jour un type de difficulté (admin)
   */
  static async updateAccessDifficulty(id: string, updates: Partial<AccessDifficultyType>): Promise<AccessDifficultyType> {
    const { data, error } = await supabase
      .from('access_difficulty_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating access difficulty:', error);
      throw error;
    }

    return data as AccessDifficultyType;
  }

  /**
   * Supprime un type de difficulté (admin)
   */
  static async deleteAccessDifficulty(id: string): Promise<void> {
    const { error } = await supabase
      .from('access_difficulty_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting access difficulty:', error);
      throw error;
    }
  }
}
