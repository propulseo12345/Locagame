import { supabase } from '../lib/supabase';
import { DeliveryTask } from '../types';
import { mapRowToDeliveryTask } from './delivery.mappers';

export class DeliveryTasksService {
  /**
   * Recupere toutes les taches de livraison pour un technicien
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
   * Recupere une tache de livraison par ID
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
   * Met a jour le statut d'une tache
   */
  static async updateTaskStatus(
    taskId: string,
    status: DeliveryTask['status']
  ): Promise<DeliveryTask> {
    const updates: Record<string, string | null> = { status };

    if (status === 'en_route') {
      updates.started_at = new Date().toISOString();
    }

    if (status === 'delivered') {
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
   * Cree une nouvelle tache de livraison
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
   * Recupere toutes les taches pour une date donnee (admin)
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
   * Assigne un technicien et un vehicule a une tache
   */
  static async assignTask(
    taskId: string,
    technicianId: string,
    vehicleId?: string
  ): Promise<DeliveryTask> {
    const updates: Record<string, string | null> = {
      technician_id: technicianId,
      status: 'assigned',
    };
    if (vehicleId) {
      updates.vehicle_id = vehicleId;
    }

    const { data, error } = await supabase
      .from('delivery_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning task:', error);
      throw error;
    }

    return mapRowToDeliveryTask(data);
  }

  /**
   * Recupere toutes les taches de livraison avec filtres (admin)
   */
  static async getAllTasks(filters?: {
    unassignedOnly?: boolean;
    assignedOnly?: boolean;
    fromDate?: string;
    toDate?: string;
    excludeCompleted?: boolean;
  }): Promise<DeliveryTask[]> {
    let query = supabase
      .from('delivery_tasks')
      .select('*')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (filters?.unassignedOnly) {
      query = query.is('technician_id', null);
    }
    if (filters?.assignedOnly) {
      query = query.not('technician_id', 'is', null);
    }
    if (filters?.fromDate) {
      query = query.gte('scheduled_date', filters.fromDate);
    }
    if (filters?.toDate) {
      query = query.lte('scheduled_date', filters.toDate);
    }
    if (filters?.excludeCompleted) {
      query = query.not('status', 'in', '("completed","cancelled")');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all tasks:', error);
      throw error;
    }

    return (data || []).map(mapRowToDeliveryTask);
  }

  /**
   * Desassigne un technicien d'une tache (remet technician_id a null)
   */
  static async unassignTask(taskId: string): Promise<DeliveryTask> {
    const { data, error } = await supabase
      .from('delivery_tasks')
      .update({
        technician_id: null,
        vehicle_id: null,
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error unassigning task:', error);
      throw error;
    }

    return mapRowToDeliveryTask(data);
  }

  /**
   * Supprime une tache de livraison (admin)
   */
  static async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('delivery_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}
