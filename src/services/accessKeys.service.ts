import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export interface AccessKey {
  id: string;
  customer_id: string;
  platform: 'pro' | 'particulier' | 'technicien';
  access_key: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
  last_used_at: string | null;
  usage_count: number;
}

export interface AccessKeyVerification {
  customer_id: string;
  is_valid: boolean;
  platform: string;
  expires_at: string | null;
}

export class AccessKeysService {
  /**
   * Vérifie une clé d'accès pour une plateforme donnée
   */
  static async verifyKey(
    key: string,
    platform: 'pro' | 'particulier' | 'technicien'
  ): Promise<AccessKeyVerification | null> {
    // @ts-expect-error — RPC not yet in database.types.ts
    const { data, error } = await supabase.rpc('verify_access_key', {
      key_to_verify: key,
      platform_to_check: platform,
    });

    if (error) {
      logger.error('Error verifying access key', error);
      throw error;
    }

    const results = data as AccessKeyVerification[] | null;
    if (!results || results.length === 0) {
      return null;
    }

    return results[0];
  }

  /**
   * Crée une nouvelle clé d'accès pour un client
   */
  static async createKey(
    customerId: string,
    platform: 'pro' | 'particulier' | 'technicien',
    expiresAt?: Date
  ): Promise<string | null> {
    // @ts-expect-error — RPC not yet in database.types.ts
    const { data, error } = await supabase.rpc('create_access_key', {
      p_customer_id: customerId,
      p_platform: platform,
      p_expires_at: expiresAt?.toISOString() || null,
    });

    if (error) {
      logger.error('Error creating access key', error);
      throw error;
    }

    return data as string;
  }

  /**
   * Récupère toutes les clés d'un client
   */
  static async getCustomerKeys(customerId: string): Promise<AccessKey[]> {
    const { data, error } = await supabase
      // @ts-expect-error — table access_keys not yet in database.types.ts
      .from('access_keys')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching customer keys', error);
      throw error;
    }

    return (data || []) as unknown as AccessKey[];
  }

  /**
   * Récupère toutes les clés (admin seulement)
   */
  static async getAllKeys(): Promise<AccessKey[]> {
    const { data, error } = await supabase
      // @ts-expect-error — table access_keys not yet in database.types.ts
      .from('access_keys')
      .select('*, customers:customer_id(email, first_name, last_name)')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching all keys', error);
      throw error;
    }

    return (data || []) as unknown as AccessKey[];
  }

  /**
   * Désactive une clé
   */
  static async deactivateKey(keyId: string): Promise<boolean> {
    const { error } = await supabase
      // @ts-expect-error — table access_keys not yet in database.types.ts
      .from('access_keys')
      .update({ is_active: false })
      .eq('id', keyId);

    if (error) {
      logger.error('Error deactivating key', error);
      throw error;
    }

    return true;
  }

  /**
   * Supprime une clé
   */
  static async deleteKey(keyId: string): Promise<boolean> {
    const { error } = await supabase
      // @ts-expect-error — table access_keys not yet in database.types.ts
      .from('access_keys')
      .delete()
      .eq('id', keyId);

    if (error) {
      logger.error('Error deleting key', error);
      throw error;
    }

    return true;
  }
}
