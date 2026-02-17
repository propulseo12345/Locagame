import { Search, X } from 'lucide-react';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function TaskFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  hasActiveFilters,
  onClearFilters,
}: TaskFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Recherche */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville, commande..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtres select */}
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] bg-white min-w-[150px]"
          >
            <option value="all">Tous les statuts</option>
            <option value="scheduled">Planifie</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Termine</option>
            <option value="cancelled">Annule</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] bg-white min-w-[150px]"
          >
            <option value="all">Tous les types</option>
            <option value="delivery">Livraison</option>
            <option value="pickup">Retrait</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Reinitialiser</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
