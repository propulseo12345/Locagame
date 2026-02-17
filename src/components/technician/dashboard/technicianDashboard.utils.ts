import {
  CheckCircle2,
  Play,
  Clock,
  Ban,
  AlertCircle,
  Truck,
  Package,
} from 'lucide-react';
import type { DeliveryTask } from '../../../types';

export type StatusConfig = {
  color: string;
  icon: typeof CheckCircle2;
  label: string;
  dot: string;
};

export type TypeConfig = {
  color: string;
  icon: typeof Truck;
  label: string;
  accent: string;
};

export function getStatusConfig(status: DeliveryTask['status']): StatusConfig {
  switch (status) {
    case 'completed':
      return {
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
        label: 'Termin\u00e9',
        dot: 'bg-emerald-500',
      };
    case 'in_progress':
      return {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Play,
        label: 'En cours',
        dot: 'bg-blue-500',
      };
    case 'scheduled':
      return {
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock,
        label: 'Planifi\u00e9',
        dot: 'bg-amber-500',
      };
    case 'cancelled':
      return {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: Ban,
        label: 'Annul\u00e9',
        dot: 'bg-red-500',
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: AlertCircle,
        label: status,
        dot: 'bg-gray-500',
      };
  }
}

export function getTypeConfig(type: 'delivery' | 'pickup'): TypeConfig {
  return type === 'delivery'
    ? {
        color: 'bg-[#33ffcc] text-[#000033]',
        icon: Truck,
        label: 'Livraison',
        accent: '#33ffcc',
      }
    : {
        color: 'bg-orange-500 text-white',
        icon: Package,
        label: 'Retrait',
        accent: '#f97316',
      };
}

export function formatDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getGoogleMapsUrl(address: DeliveryTask['address']): string {
  const query = encodeURIComponent(
    `${address.street}, ${address.postalCode} ${address.city}, ${address.country}`
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}
