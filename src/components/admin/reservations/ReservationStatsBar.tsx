import {
  BarChart3,
  CreditCard,
  Clock,
  CheckCircle,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReservationStats } from './types';

interface StatCardConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  ringColor: string;
  getValue: (stats: ReservationStats) => number;
  pulse?: boolean;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    key: 'all',
    label: 'Total',
    icon: BarChart3,
    color: 'text-gray-900',
    borderColor: 'border-l-gray-900',
    ringColor: 'ring-gray-400 ring-offset-1',
    getValue: (s) => s.total,
  },
  {
    key: 'pending_payment',
    label: 'Paiement',
    icon: CreditCard,
    color: 'text-orange-600',
    borderColor: 'border-l-orange-500',
    ringColor: 'ring-orange-400 ring-offset-1',
    getValue: (s) => s.pending_payment,
  },
  {
    key: 'pending',
    label: 'En attente',
    icon: Clock,
    color: 'text-amber-600',
    borderColor: 'border-l-amber-500',
    ringColor: 'ring-amber-400 ring-offset-1',
    getValue: (s) => s.pending,
  },
  {
    key: 'confirmed',
    label: 'Confirmées',
    icon: CheckCircle,
    color: 'text-blue-600',
    borderColor: 'border-l-blue-500',
    ringColor: 'ring-blue-400 ring-offset-1',
    getValue: (s) => s.confirmed,
  },
  {
    key: 'preparing',
    label: 'Préparation',
    icon: Package,
    color: 'text-violet-600',
    borderColor: 'border-l-violet-500',
    ringColor: 'ring-violet-400 ring-offset-1',
    getValue: (s) => s.preparing,
  },
  {
    key: 'delivered',
    label: 'Livrées',
    icon: Truck,
    color: 'text-cyan-600',
    borderColor: 'border-l-cyan-500',
    ringColor: 'ring-cyan-400 ring-offset-1',
    getValue: (s) => s.delivered,
  },
  {
    key: 'completed',
    label: 'Terminées',
    icon: CheckCircle2,
    color: 'text-green-600',
    borderColor: 'border-l-green-500',
    ringColor: 'ring-green-400 ring-offset-1',
    getValue: (s) => s.completed,
  },
  {
    key: 'unassigned',
    label: 'Non assignées',
    icon: AlertTriangle,
    color: 'text-red-600',
    borderColor: 'border-l-red-500',
    ringColor: 'ring-red-400 ring-offset-1',
    getValue: (s) => s.unassigned,
    pulse: true,
  },
];

interface ReservationStatsBarProps {
  stats: ReservationStats;
  activeFilter: string;
  onFilterClick: (status: string) => void;
}

export default function ReservationStatsBar({ stats, activeFilter, onFilterClick }: ReservationStatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-9 gap-3">
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;
        const value = card.getValue(stats);
        const isActive = activeFilter === card.key;
        const isTotal = card.key === 'all';
        const shouldPulse = card.pulse && value > 0;

        return (
          <button
            key={card.key}
            onClick={() => onFilterClick(card.key === 'all' ? 'all' : card.key)}
            className={`
              relative bg-white rounded-lg p-3 border border-gray-200 border-l-4 ${card.borderColor}
              cursor-pointer hover:shadow-md transition-all text-left
              ${isTotal ? 'md:col-span-2' : ''}
              ${isActive ? `ring-2 ${card.ringColor}` : ''}
              ${value === 0 && !isTotal ? 'opacity-60' : ''}
            `}
          >
            <Icon className={`w-4 h-4 ${card.color} absolute top-3 right-3`} />
            {shouldPulse && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
            <div className="text-xs text-gray-500 font-medium">{card.label}</div>
            <div className={`text-2xl font-bold tabular-nums mt-0.5 ${card.color}`}>
              {value}
            </div>
          </button>
        );
      })}
    </div>
  );
}
