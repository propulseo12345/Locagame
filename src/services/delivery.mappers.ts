import { DeliveryTask } from '../types';
import type { Database } from '../lib/database.types';

export type DeliveryTaskRow = Database['public']['Tables']['delivery_tasks']['Row'];

/** Map database row to DeliveryTask type */
export function mapRowToDeliveryTask(task: DeliveryTaskRow): DeliveryTask {
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
