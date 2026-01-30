import { supabase } from '../lib/supabase';

export interface Address {
  id: string;
  customer_id: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postal_code: string;
  zone_id?: string | null;
  is_default: boolean;
  created_at: string;
}

export interface AddressInput {
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code: string;
  zone_id?: string | null;
  is_default?: boolean;
}

export class AddressesService {
  /**
   * Récupère toutes les adresses d'un client
   */
  static async getCustomerAddresses(customerId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }

    return data as Address[];
  }

  /**
   * Crée une nouvelle adresse
   */
  static async createAddress(customerId: string, address: AddressInput): Promise<Address> {
    // Si c'est la première adresse ou si is_default est true, désactiver les autres
    if (address.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', customerId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        customer_id: customerId,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || null,
        city: address.city,
        postal_code: address.postal_code,
        zone_id: address.zone_id || null,
        is_default: address.is_default || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating address:', error);
      throw error;
    }

    return data as Address;
  }

  /**
   * Met à jour une adresse
   */
  static async updateAddress(
    addressId: string,
    updates: Partial<AddressInput>
  ): Promise<Address> {
    // Si on définit cette adresse comme défaut, désactiver les autres
    if (updates.is_default) {
      const { data: address } = await supabase
        .from('addresses')
        .select('customer_id')
        .eq('id', addressId)
        .single();

      if (address) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('customer_id', address.customer_id)
          .neq('id', addressId);
      }
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', addressId)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      throw error;
    }

    return data as Address;
  }

  /**
   * Supprime une adresse
   */
  static async deleteAddress(addressId: string): Promise<void> {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  /**
   * Définit une adresse comme défaut
   */
  static async setDefaultAddress(customerId: string, addressId: string): Promise<Address> {
    // Désactiver toutes les autres adresses par défaut
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('customer_id', customerId)
      .neq('id', addressId);

    // Définir cette adresse comme défaut
    return this.updateAddress(addressId, { is_default: true });
  }
}

