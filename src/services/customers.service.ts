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
      // PGRST116 = no row found → customer doesn't exist yet (expected in checkout)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching customer:', error);
      throw error;
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

  /**
   * Supprime un client de force en supprimant d'abord toutes les données liées (admin)
   */
  static async forceDeleteCustomer(id: string): Promise<void> {
    // 1. Supprimer les favoris du client
    await supabase.from('customer_favorites').delete().eq('customer_id', id);

    // 2. Récupérer les réservations du client pour supprimer les données liées
    const { data: reservations } = await supabase
      .from('reservations')
      .select('id')
      .eq('customer_id', id);

    if (reservations && reservations.length > 0) {
      const reservationIds = reservations.map(r => r.id);

      // 3. Supprimer les items de réservation
      await supabase.from('reservation_items').delete().in('reservation_id', reservationIds);

      // 4. Supprimer les disponibilités produits liées aux réservations
      await supabase.from('product_availability').delete().in('reservation_id', reservationIds);

      // 5. Supprimer les tâches de livraison
      await supabase.from('delivery_tasks').delete().in('reservation_id', reservationIds);

      // 6. Supprimer les réservations
      await supabase.from('reservations').delete().eq('customer_id', id);
    }

    // 7. Supprimer les adresses du client
    await supabase.from('addresses').delete().eq('customer_id', id);

    // 8. Enfin, supprimer le client
    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) {
      console.error('Error force deleting customer:', error);
      throw error;
    }
  }
}
