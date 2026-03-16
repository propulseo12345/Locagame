import { supabase } from '../lib/supabase';
import { DeliveryTask } from '../types';
import { mapRowToDeliveryTask } from './delivery.mappers';
import type { Json } from '../lib/database.types';
import { logger } from '../lib/logger';

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
      logger.error('Error fetching technician tasks', error);
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
      logger.error('Error fetching task', error);
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
      logger.error('Error updating task status', error);
      throw error;
    }

    return mapRowToDeliveryTask(data);
  }

  /**
   * Cree ou met a jour une tache de livraison pour une reservation.
   * Si une task existe deja pour cette reservation, elle est mise a jour (upsert).
   */
  static async createDeliveryTask(
    task: Omit<DeliveryTask, 'id'>
  ): Promise<DeliveryTask> {
    // Verifier s'il existe deja une task pour cette reservation
    if (task.reservationId) {
      const { data: existing } = await supabase
        .from('delivery_tasks')
        .select('id')
        .eq('reservation_id', task.reservationId)
        .maybeSingle();

      if (existing) {
        // Mettre a jour la task existante au lieu d'en creer une nouvelle
        const { data, error } = await supabase
          .from('delivery_tasks')
          .update({
            technician_id: task.technicianId || null,
            vehicle_id: task.vehicleId || null,
            status: task.status,
            scheduled_date: task.scheduledDate,
            scheduled_time: task.scheduledTime,
            customer_data: task.customer as unknown as Json,
            address_data: task.address as unknown as Json,
            products_data: task.products as unknown as Json,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          logger.error('Error updating existing delivery task', error);
          throw error;
        }
        return mapRowToDeliveryTask(data);
      }
    }

    // Pas de task existante → creer
    const { data, error } = await supabase
      .from('delivery_tasks')
      .insert({
        reservation_id: task.reservationId,
        order_number: task.orderNumber,
        type: task.type,
        scheduled_date: task.scheduledDate,
        scheduled_time: task.scheduledTime,
        vehicle_id: task.vehicleId || null,
        technician_id: task.technicianId || null,
        status: task.status,
        customer_data: task.customer as unknown as Json,
        address_data: task.address as unknown as Json,
        products_data: task.products as unknown as Json,
        access_constraints: (task.accessConstraints as unknown as Json) || null,
        notes: task.notes || null,
        started_at: task.startedAt || null,
        completed_at: task.completedAt || null,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating delivery task', error);
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
      logger.error('Error fetching tasks by date', error);
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
      logger.error('Error assigning task', error);
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
      logger.error('Error fetching all tasks', error);
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
      logger.error('Error unassigning task', error);
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
      logger.error('Error deleting task', error);
      throw error;
    }
  }
}
