import { supabase } from '../lib/supabase';
import { DeliveryZone } from '../types';
import { logger } from '../lib/logger';

export class DeliveryZonesService {
  /**
   * Recupere toutes les zones de livraison
   */
  static async getDeliveryZones(): Promise<DeliveryZone[]> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching delivery zones', error);
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
        // Aucune zone trouvee
        return null;
      }
      logger.error('Error finding zone by postal code', error);
      throw error;
    }

    return data as DeliveryZone;
  }

  /**
   * Cree une nouvelle zone de livraison (admin)
   */
  static async createZone(zone: Omit<DeliveryZone, 'id' | 'created_at'>): Promise<DeliveryZone> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .insert(zone)
      .select()
      .single();

    if (error) {
      logger.error('Error creating delivery zone', error);
      throw error;
    }

    return data as DeliveryZone;
  }

  /**
   * Met a jour une zone de livraison (admin)
   */
  static async updateZone(id: string, updates: Partial<DeliveryZone>): Promise<DeliveryZone> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating delivery zone', error);
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
      logger.error('Error deleting delivery zone', error);
      throw error;
    }
  }
}
