import { supabase } from '../lib/supabase';
import { Customer } from '../types';

export class CustomersService {
  /**
   * Récupère un client par son ID
   */
  static async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching customer:', error);
      return null;
    }

    return data as Customer;
  }

  /**
   * Récupère un client par son email
   */
  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching customer by email:', error);
      throw error;
    }

    return data as Customer;
  }

  /**
   * Crée un nouveau client (appelé après inscription auth)
   */
  static async createCustomer(customer: {
    id: string; // ID de auth.users ou UUID généré pour invité
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    customer_type?: 'individual' | 'professional';
    company_name?: string;
    siret?: string; // Nouveau champ SIRET pour professionnels
  }): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        customer_type: customer.customer_type || 'individual',
        company_name: customer.company_name,
        siret: customer.siret,
        loyalty_points: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    return data as Customer;
  }

  /**
   * Met à jour le profil d'un client
   */
  static async updateCustomer(
    id: string,
    updates: Partial<Customer>
  ): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }

    return data as Customer;
  }

  /**
   * Récupère tous les clients (admin)
   */
  static async getAllCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all customers:', error);
      throw error;
    }

    return data as Customer[];
  }

  /**
   * Ajoute des points de fidélité
   */
  static async addLoyaltyPoints(id: string, points: number): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .select('loyalty_points')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching customer points:', error);
      throw error;
    }

    const currentPoints = data.loyalty_points || 0;
    const newPoints = currentPoints + points;

    return this.updateCustomer(id, { loyalty_points: newPoints });
  }

  /**
   * Supprime un client (admin)
   */
  static async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }
}
