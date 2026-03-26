import { SlidersHorizontal, X } from 'lucide-react';
import { Category, FilterOptions } from '../../types';

interface CategoryWithCount extends Category {
  productCount: number;
}

interface CatalogFilterSidebarProps {
  categoriesWithCount: CategoryWithCount[];
  selectedCategory: string | null;
  onCategoryClick: (id: string) => void;
  filters: FilterOptions;
  handleFilterChange: (key: keyof FilterOptions, value: any) => void;
  clearAllFilters: () => void;
  activeFiltersCount: number;
}

const SORT_OPTIONS = [
  { value: '', label: 'Pertinence' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'popularity', label: 'Popularite' },
  { value: 'newest', label: 'Nouveautes' },
] as const;

export function CatalogFilterSidebar({
  categoriesWithCount,
  selectedCategory,
  onCategoryClick,
  filters,
  handleFilterChange,
  clearAllFilters,
  activeFiltersCount,
}: CatalogFilterSidebarProps) {
  return (
    <div className="sticky top-[calc(var(--header-height)+1rem)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <SlidersHorizontal className="w-4 h-4 text-[#33ffcc]" />
          <span className="text-sm font-bold uppercase tracking-wider">Filtres</span>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#33ffcc] transition-colors"
          >
            <X className="w-3 h-3" />
            Reinitialiser
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
        <div className="space-y-1">
          {categoriesWithCount
            .filter(cat => cat.productCount > 0)
            .map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryClick(cat.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#33ffcc]/15 text-[#33ffcc] font-semibold'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-base shrink-0">{cat.icon}</span>
                <span className="truncate flex-1">{cat.name}</span>
                <span className={`text-xs tabular-nums ${
                  selectedCategory === cat.id ? 'text-[#33ffcc]/70' : 'text-gray-500'
                }`}>
                  {cat.productCount}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Trier par</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange('sort_by', opt.value || undefined)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                (filters.sort_by || '') === opt.value
                  ? 'bg-[#33ffcc]/15 text-[#33ffcc] font-semibold'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
