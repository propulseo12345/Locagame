import { supabase } from '../lib/supabase';
import { DeliveryTask, DeliveryZone } from '../types';
import type { Database } from '../lib/database.types';

type DeliveryTaskRow = Database['public']['Tables']['delivery_tasks']['Row'];

/** Map database row to DeliveryTask type */
function mapRowToDeliveryTask(task: DeliveryTaskRow): DeliveryTask {
  return {
    id: task.id,
    reservationId: task.reservation_id || '',
    orderNumber: task.order_number || '',
    type: task.type as 'delivery' | 'pickup',
    scheduledDate: task.scheduled_date,
    scheduledTime: task.scheduled_time,
    vehicleId: task.vehicle_id || '',
    technicianId: task.technician_id || '',
    status: task.status as DeliveryTask['status'],
    customer: task.customer_data as DeliveryTask['customer'],
    address: task.address_data as DeliveryTask['address'],
    products: task.products_data as DeliveryTask['products'],
    accessConstraints: task.access_constraints as DeliveryTask['accessConstraints'],
    notes: task.notes || undefined,
    startedAt: task.started_at || undefined,
    completedAt: task.completed_at || undefined,
  };
}

export class DeliveryService {
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
   * Récupère toutes les tâches de livraison pour un technicien
   */
  static async getTechnicianTasks(technicianId: string): Promise<DeliveryTask[]> {
    const { data, error } = await supabase
      .from('delivery_tasks')
      .select('*')
      .eq('technician_id', technicianId)
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error fetching technician tasks:', error);
      throw error;
    }

    return (data || []).map(mapRowToDeliveryTask);
  }

  /**
   * Récupère une tâche de livraison par ID
   */
  static async getTaskById(taskId: string): Promise<DeliveryTask | null> {
    const { data, error } = await supabase
      .from('delivery_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      throw error;
    }

    if (!data) return null;

    return mapRowToDeliveryTask(data);
  }

  /**
   * Met à jour le statut d'une tâche
   */
  static async updateTaskStatus(
    taskId: string,
    status: DeliveryTask['status']
  ): Promise<DeliveryTask> {
    const updates: Record<string, string | null> = { status };

    if (status === 'in_progress') {
      updates.started_at = new Date().toISOString();
    }

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('delivery_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task status:', error);
      throw error;
    }

    return mapRowToDeliveryTask(data);
  }

  /**
   * Crée une nouvelle tâche de livraison
   */
  static async createDeliveryTask(
    task: Omit<DeliveryTask, 'id'>
  ): Promise<DeliveryTask> {
    // Mapper les champs camelCase vers snake_case pour la DB
    const { data, error } = await supabase
      .from('delivery_tasks')
      .insert({
        reservation_id: task.reservationId,
        order_number: task.orderNumber,
        type: task.type,
        scheduled_date: task.scheduledDate,
        scheduled_time: task.scheduledTime,
        vehicle_id: task.vehicleId,
        technician_id: task.technicianId,
        status: task.status,
        customer_data: task.customer,
        address_data: task.address,
        products_data: task.products,
        access_constraints: task.accessConstraints,
        notes: task.notes,
        started_at: task.startedAt,
        completed_at: task.completedAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating delivery task:', error);
      throw error;
    }

    return mapRowToDeliveryTask(data);
  }

  /**
   * Récupère toutes les tâches pour une date donnée (admin)
   */
  static async getTasksByDate(date: string): Promise<DeliveryTask[]> {
    const { data, error } = await supabase
      .from('delivery_tasks')
      .select('*')
      .eq('scheduled_date', date)
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error fetching tasks by date:', error);
      throw error;
    }

    return (data || []).map(mapRowToDeliveryTask);
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

  /**
   * Assigne un technicien et un véhicule à une tâche
   */
  static async assignTask(
    taskId: string,
    technicianId: string,
    vehicleId: string
  ): Promise<DeliveryTask> {
    const { data, error } = await supabase
      .from('delivery_tasks')
      .update({
        technician_id: technicianId,
        vehicle_id: vehicleId,
        status: 'scheduled',
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning task:', error);
      throw error;
    }

    return mapRowToDeliveryTask(data);
  }
}
