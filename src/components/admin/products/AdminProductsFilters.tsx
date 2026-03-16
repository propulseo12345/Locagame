import { Search, X } from 'lucide-react';

interface AdminProductsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: Array<{ id: string; name: string }>;
  totalCount?: number;
  filteredCount?: number;
}

export default function AdminProductsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
  totalCount = 0,
  filteredCount = 0,
}: AdminProductsFiltersProps) {
  const hasFilters = searchTerm !== '' || statusFilter !== 'all' || categoryFilter !== 'all';

  const handleClear = () => {
    onSearchChange('');
    onStatusChange('all');
    onCategoryChange('all');
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Nom, description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm bg-white"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-11 w-40 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm bg-white"
      >
        <option value="all">Tous statuts</option>
        <option value="active">Actif</option>
        <option value="inactive">Inactif</option>
        <option value="maintenance">Maintenance</option>
      </select>
      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="h-11 w-44 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent text-sm bg-white"
      >
        <option value="all">Toutes catégories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      {hasFilters && (
        <button
          onClick={handleClear}
          className="h-11 flex items-center gap-1.5 px-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Réinitialiser
        </button>
      )}
      {totalCount > 0 && (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {filteredCount} · {totalCount} produits
        </span>
      )}
    </div>
  );
}
