import { DeliveryTask } from '../../../types';

export function getStatusColor(status: DeliveryTask['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusLabel(status: DeliveryTask['status']): string {
  switch (status) {
    case 'completed':
      return 'Termin\u00e9';
    case 'in_progress':
      return 'En cours';
    case 'scheduled':
      return 'Planifi\u00e9';
    case 'cancelled':
      return 'Annul\u00e9';
    default:
      return status;
  }
}

export function getTypeLabel(type: 'delivery' | 'pickup'): string {
  return type === 'delivery' ? 'Livraison' : 'Retrait';
}

export function getTypeColor(type: 'delivery' | 'pickup'): string {
  return type === 'delivery'
    ? 'bg-[#33ffcc] text-[#000033]'
    : 'bg-orange-500 text-white';
}
