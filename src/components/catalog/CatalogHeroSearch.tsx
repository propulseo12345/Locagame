import { FormEvent } from 'react';
import { Search, X, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateDurationDaysInclusive } from '../../utils/availability';

interface CatalogHeroSearchProps {
  productsCount: number;
  searchTerm: string;
  startDate: string;
  endDate: string;
  checkingAvailability: boolean;
  availabilityError: string | null;
  getTodayString: () => string;
  onSearchTermChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearDates: () => void;
  onClearSearch: () => void;
  onSearchSubmit: (e?: FormEvent) => void;
}

export function CatalogHeroSearch({
  productsCount,
  searchTerm,
  startDate,
  endDate,
  checkingAvailability,
  availabilityError,
  getTodayString,
  onSearchTermChange,
  onStartDateChange,
  onEndDateChange,
  onClearDates,
  onClearSearch,
  onSearchSubmit,
}: CatalogHeroSearchProps) {
  return (
    <div className="relative z-10 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
          Notre <span className="gradient-text">Catalogue</span>
        </h1>
        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          {productsCount}+ jeux disponibles pour vos evenements
        </p>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={onSearchSubmit}>
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un jeu..."
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#33ffcc] focus:bg-white/10 focus:outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Date pickers */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                  <Calendar className="w-4 h-4 text-[#33ffcc] hidden sm:block" />
                  <span className="text-gray-500 text-sm hidden sm:inline">Du</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    min={getTodayString()}
                    className="w-[130px] bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                  />
                  <span className="text-gray-500 text-sm">au</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    min={startDate || getTodayString()}
                    className="w-[130px] bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                  />
                  {startDate && endDate && (
                    <span className="text-[#33ffcc] text-sm font-medium whitespace-nowrap">
                      {calculateDurationDaysInclusive(startDate, endDate)} jour
                      {calculateDurationDaysInclusive(startDate, endDate) > 1 ? 's' : ''}
                    </span>
                  )}
                  {checkingAvailability && (
                    <Loader2 className="w-4 h-4 text-[#33ffcc] animate-spin" />
                  )}
                  {startDate && (
                    <button
                      type="button"
                      onClick={onClearDates}
                      className="p-1 text-gray-400 hover:text-[#33ffcc] transition-colors"
                      title="Effacer les dates"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#33ffcc] hover:bg-[#4dffdd] text-[#000033] font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(51,255,204,0.3)] active:scale-[0.98]"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Rechercher</span>
                <ArrowRight className="w-4 h-4 sm:hidden" />
              </button>
            </div>
          </form>

          {/* Availability error */}
          {availabilityError && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">
                {availabilityError}{' '}
                <Link to="/contact" className="underline hover:text-red-300">
                  Contactez-nous
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
