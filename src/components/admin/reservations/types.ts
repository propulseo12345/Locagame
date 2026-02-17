import { Order } from '../../../types';

export interface ReservationTechnician {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  vehicle_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReservationVehicle {
  id: string;
  name: string;
  type: 'truck' | 'van';
  capacity: number;
  license_plate: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnassignedReservation extends Order {
  delivery_task_id?: string;
}

export interface ReservationStats {
  total: number;
  pending_payment: number;
  pending: number;
  confirmed: number;
  preparing: number;
  delivered: number;
  completed: number;
  unassigned: number;
}
