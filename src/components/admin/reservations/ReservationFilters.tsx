import { Search, Truck, Store, X } from 'lucide-react';
import type { DeliveryModeFilter, ReservationTechnician } from './types';

interface ReservationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  deliveryModeFilter: DeliveryModeFilter;
  onDeliveryModeChange: (mode: DeliveryModeFilter) => void;
  technicianFilter: string;
  onTechnicianChange: (id: string) => void;
  technicians: ReservationTechnician[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'confirmed', label: 'Confirmée', dot: 'bg-green-500' },
  { value: 'preparing', label: 'En préparation', dot: 'bg-violet-500' },
  { value: 'delivered', label: 'Livré', dot: 'bg-cyan-500' },
  { value: 'completed', label: 'Terminée', dot: 'bg-gray-500' },
  { value: 'cancelled', label: 'Annulé', dot: 'bg-red-500' },
];

const DELIVERY_MODES: { value: DeliveryModeFilter; label: string; icon?: typeof Truck }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'delivery', label: 'Livraison', icon: Truck },
  { value: 'pickup', label: 'Pick-up', icon: Store },
];

export default function ReservationFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  deliveryModeFilter,
  onDeliveryModeChange,
  technicianFilter,
  onTechnicianChange,
  technicians,
  hasActiveFilters,
  onClearFilters,
  totalCount,
  filteredCount,
}: ReservationFiltersProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par n°, nom, email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Rechercher une réservation"
            className="h-11 w-full pl-10 pr-4 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Status select */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filtrer par statut"
          className="h-11 w-48 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Delivery mode toggle */}
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          {DELIVERY_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = deliveryModeFilter === mode.value;
            return (
              <button
                key={mode.value}
                onClick={() => onDeliveryModeChange(mode.value)}
                className={`h-11 px-3 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Technician select */}
        <select
          value={technicianFilter}
          onChange={(e) => onTechnicianChange(e.target.value)}
          aria-label="Filtrer par livreur"
          className="h-11 w-48 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
        >
          <option value="all">Tous les livreurs</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.first_name} {tech.last_name}
            </option>
          ))}
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="h-11 px-3 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Counter */}
      {totalCount !== filteredCount && (
        <p className="text-sm text-gray-500">
          {totalCount} réservations &middot; {filteredCount} résultats
        </p>
      )}
    </div>
  );
}
