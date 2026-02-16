/**
 * Service de gestion des zones de livraison LOCAGAME
 */

import { supabase } from '../lib/supabase';
import { DeliveryZone } from '../types';

export class DeliveryZonesService {
  /**
   * Récupère toutes les zones de livraison
   */
  static async getDeliveryZones(): Promise<DeliveryZone[]> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching delivery zones:', error);
      throw error;
    }

    return data as DeliveryZone[];
  }

  /**
   * Trouve la zone de livraison pour un code postal
   */
  static async findZoneByPostalCode(postalCode: string): Promise<DeliveryZone | null> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .contains('postal_codes', [postalCode])
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Aucune zone trouvée
        return null;
      }
      console.error('Error finding zone by postal code:', error);
      throw error;
    }

    return data as DeliveryZone;
  }

  /**
   * Crée une nouvelle zone de livraison (admin)
   */
  static async createZone(zone: Omit<DeliveryZone, 'id' | 'created_at'>): Promise<DeliveryZone> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .insert(zone)
      .select()
      .single();

    if (error) {
      console.error('Error creating delivery zone:', error);
      throw error;
    }

    return data as DeliveryZone;
  }

  /**
   * Met à jour une zone de livraison (admin)
   */
  static async updateZone(id: string, updates: Partial<DeliveryZone>): Promise<DeliveryZone> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating delivery zone:', error);
      throw error;
    }

    return data as DeliveryZone;
  }

  /**
   * Supprime une zone de livraison (admin)
   */
  static async deleteZone(id: string): Promise<void> {
    const { error } = await supabase
      .from('delivery_zones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting delivery zone:', error);
      throw error;
    }
  }
}
