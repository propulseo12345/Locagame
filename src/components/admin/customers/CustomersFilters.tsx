import { Search, X } from 'lucide-react';

interface CustomersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function CustomersFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  hasActiveFilters,
  onClearFilters,
  totalCount,
  filteredCount,
}: CustomersFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Nom, email, entreprise..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-11 pl-9 pr-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        className="h-11 w-44 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
      >
        <option value="all">Tous les types</option>
        <option value="individual">Particulier</option>
        <option value="professional">Professionnel</option>
      </select>
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="h-11 flex items-center gap-1.5 px-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Effacer
        </button>
      )}
      <span className="text-sm text-gray-500 ml-auto">
        {filteredCount} · {totalCount} clients
      </span>
    </div>
  );
}
