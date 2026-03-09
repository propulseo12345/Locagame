import { Calendar, Grid, List } from 'lucide-react';
import { FilterOptions } from '../../types';

interface CatalogResultsBarProps {
  filteredCount: number;
  startDate: string;
  endDate: string;
  searchTerm: string;
  unavailableCount: number;
  activeFiltersCount: number;
  filters: FilterOptions;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  handleFilterChange: (key: keyof FilterOptions, value: any) => void;
  clearAllFilters: () => void;
}

export function CatalogResultsBar({
  filteredCount,
  startDate,
  endDate,
  searchTerm,
  unavailableCount,
  activeFiltersCount,
  filters,
  viewMode,
  setViewMode,
  handleFilterChange,
  clearAllFilters,
}: CatalogResultsBarProps) {
  return (
    <div className="sticky top-[var(--header-height)] z-30 bg-[#000033]/90 backdrop-blur-md py-3 mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-white/5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-white font-medium whitespace-nowrap">
            {filteredCount} résultat{filteredCount > 1 ? 's' : ''}
          </span>

          {startDate && endDate && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-full text-xs text-[#33ffcc]">
              <Calendar className="w-3 h-3" />
              Dispo {new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              {unavailableCount > 0 && (
                <span className="ml-1 text-gray-400">
                  ({unavailableCount} indispo)
                </span>
              )}
            </span>
          )}

          {activeFiltersCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
              {(startDate || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-400 hover:text-[#33ffcc] whitespace-nowrap transition-colors"
                >
                  Effacer filtres
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.sort_by || 'relevance'}
            onChange={(e) => handleFilterChange('sort_by', e.target.value as FilterOptions['sort_by'])}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:border-[#33ffcc] focus:outline-none cursor-pointer"
          >
            <option value="relevance" className="bg-[#000033]">Pertinence</option>
            <option value="price_asc" className="bg-[#000033]">Prix ↑</option>
            <option value="price_desc" className="bg-[#000033]">Prix ↓</option>
            <option value="newest" className="bg-[#000033]">Nouveautés</option>
          </select>

          <div className="flex bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-[#33ffcc] text-[#000033]' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-[#33ffcc] text-[#000033]' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
