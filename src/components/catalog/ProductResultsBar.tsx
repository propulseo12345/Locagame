import { Grid, List, Calendar } from 'lucide-react';
import { FilterOptions } from '../../types';

interface ProductResultsBarProps {
  totalResults: number;
  activeFiltersCount: number;
  sortBy: FilterOptions['sort_by'];
  viewMode: 'grid' | 'list';
  onSortChange: (value: FilterOptions['sort_by']) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onClearFilters: () => void;
  hasDateOrSearch: boolean;
  startDate?: string;
  endDate?: string;
  unavailableCount?: number;
}

export function ProductResultsBar({
  totalResults,
  activeFiltersCount,
  sortBy,
  viewMode,
  onSortChange,
  onViewModeChange,
  onClearFilters,
  hasDateOrSearch,
  startDate,
  endDate,
  unavailableCount,
}: ProductResultsBarProps) {
  return (
    <div className="sticky top-[var(--header-height)] z-30 bg-[#000033]/90 backdrop-blur-md py-3 mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-white/5">
      <div className="flex items-center justify-between gap-4">
        {/* Compteur et filtres actifs */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-white font-medium whitespace-nowrap">
            {totalResults} resultat{totalResults > 1 ? 's' : ''}
          </span>

          {/* Date availability badge */}
          {startDate && endDate && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-full text-xs text-[#33ffcc]">
              <Calendar className="w-3 h-3" />
              Dispo {new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              {unavailableCount != null && unavailableCount > 0 && (
                <span className="ml-1 text-gray-400">
                  ({unavailableCount} indispo)
                </span>
              )}
            </span>
          )}

          {activeFiltersCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
              {hasDateOrSearch && (
                <button
                  onClick={onClearFilters}
                  className="text-xs text-gray-400 hover:text-[#33ffcc] whitespace-nowrap transition-colors"
                >
                  Effacer filtres
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Tri rapide */}
          <select
            value={sortBy || 'relevance'}
            onChange={(e) => onSortChange(e.target.value as FilterOptions['sort_by'])}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:border-[#33ffcc] focus:outline-none cursor-pointer"
          >
            <option value="relevance" className="bg-[#000033]">Pertinence</option>
            <option value="price_asc" className="bg-[#000033]">Prix ↑</option>
            <option value="price_desc" className="bg-[#000033]">Prix ↓</option>
            <option value="newest" className="bg-[#000033]">Nouveautés</option>
          </select>

          {/* Vue grille/liste */}
          <div className="flex bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-[#33ffcc] text-[#000033]' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
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
