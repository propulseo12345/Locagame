import { DeliveryTask } from '../../../types';
import { Technician, Vehicle } from '../../../services/technicians.service';

// Type pour les reservations non assignees (donnees brutes Supabase)
export interface UnassignedReservation {
  id: string;
  start_date: string;
  end_date: string;
  delivery_time?: string;
  delivery_type: string;
  delivery_address_id?: string;
  status: string;
  total: number;
  notes?: string;
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  reservation_items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    product?: { name: string };
  }>;
  delivery_address?: {
    address_line1: string;
    address_line2?: string;
    city: string;
    postal_code: string;
  };
  delivery_task_id?: string;
}

export type AssignFilter = 'all' | 'unassigned' | 'assigned';

export interface VehicleFormData {
  name: string;
  type: string;
  capacity: string;
  licensePlate: string;
  isActive: boolean;
}

export const DEFAULT_VEHICLE_FORM: VehicleFormData = {
  name: '',
  type: 'truck',
  capacity: '',
  licensePlate: '',
  isActive: true,
};

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed': return 'Termin\u00e9';
    case 'in_progress': return 'En cours';
    case 'scheduled': return 'Planifi\u00e9';
    case 'cancelled': return 'Annul\u00e9';
    default: return status;
  }
}

export function getTypeLabel(type: string): string {
  switch (type) {
    case 'delivery': return 'Livraison';
    case 'pickup': return 'Retrait';
    case 'client_pickup': return 'Retrait client';
    case 'client_return': return 'Retour client';
    default: return type;
  }
}

// Re-export for convenience
export type { DeliveryTask };
export type { Technician, Vehicle };
