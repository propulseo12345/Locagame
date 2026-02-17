import React from 'react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  delivered: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  returned: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  preparing: 'En preparation',
  delivered: 'Livree',
  completed: 'Terminee',
  returned: 'Retournee',
  cancelled: 'Annulee',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-4 py-2 text-sm font-medium rounded-full ${STATUS_STYLES[status] || 'bg-gray-100'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

const TASK_TYPE_STYLES: Record<string, string> = {
  delivery: 'bg-blue-100 text-blue-800',
  pickup: 'bg-orange-100 text-orange-800',
  client_pickup: 'bg-green-100 text-green-800',
  client_return: 'bg-purple-100 text-purple-800',
};

const TASK_TYPE_LABELS: Record<string, string> = {
  delivery: 'Livraison',
  pickup: 'Recuperation',
  client_pickup: 'Retrait client',
  client_return: 'Retour client',
};

export function TaskTypeBadge({ type }: { type: string }) {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${TASK_TYPE_STYLES[type] || 'bg-gray-100'}`}>
      {TASK_TYPE_LABELS[type] || type}
    </span>
  );
}
