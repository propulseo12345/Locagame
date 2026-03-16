import { Search, X } from 'lucide-react';

interface TechniciansFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void;
  totalCount?: number;
  filteredCount?: number;
}

export default function TechniciansFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount = 0,
  filteredCount = 0,
}: TechniciansFiltersProps) {
  const hasFilters = searchTerm !== '' || statusFilter !== 'all';

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm bg-white"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
        className="h-11 w-44 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm bg-white"
      >
        <option value="all">Tous les statuts</option>
        <option value="active">Actifs uniquement</option>
        <option value="inactive">Inactifs uniquement</option>
      </select>
      {hasFilters && (
        <button
          onClick={() => { onSearchChange(''); onStatusFilterChange('all'); }}
          className="h-11 flex items-center gap-1.5 px-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Réinitialiser
        </button>
      )}
      {totalCount > 0 && (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {filteredCount} · {totalCount} techniciens
        </span>
      )}
    </div>
  );
}
