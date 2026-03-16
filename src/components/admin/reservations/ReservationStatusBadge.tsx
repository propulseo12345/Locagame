import {
  CreditCard,
  Clock,
  CheckCircle,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatusConfig {
  icon: LucideIcon;
  label: string;
  classes: string;
  pulse?: boolean;
  lineThrough?: boolean;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending_payment: {
    icon: CreditCard,
    label: 'Paiement en attente',
    classes: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    pulse: true,
  },
  pending: {
    icon: Clock,
    label: 'En attente',
    classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
  confirmed: {
    icon: CheckCircle,
    label: 'Confirmé',
    classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  },
  preparing: {
    icon: Package,
    label: 'En préparation',
    classes: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  },
  delivered: {
    icon: Truck,
    label: 'Livré',
    classes: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Terminé',
    classes: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  },
  cancelled: {
    icon: XCircle,
    label: 'Annulé',
    classes: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    lineThrough: true,
  },
  rejected: {
    icon: XCircle,
    label: 'Refusé',
    classes: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    lineThrough: true,
  },
};

interface ReservationStatusBadgeProps {
  status: string;
}

export default function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-600 ring-1 ring-gray-200">
        {status}
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${config.classes} ${config.lineThrough ? 'line-through' : ''}`}
    >
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
        </span>
      )}
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
