import { Search, X } from 'lucide-react';

interface CatalogSearchBarProps {
  searchTerm: string;
  startDate: string;
  endDate: string;
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearDates: () => void;
}

export function CatalogSearchBar({
  searchTerm,
  startDate,
  endDate,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onClearDates
}: CatalogSearchBarProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Barre de recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un jeu..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#33ffcc] focus:bg-white/10 focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dates groupées */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-gray-500 text-sm hidden sm:inline">Du</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              min={today}
              className="w-[130px] bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
            />
            <span className="text-gray-500 text-sm">au</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate || today}
              disabled={!startDate}
              className="w-[130px] bg-transparent text-white text-sm focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed [color-scheme:dark]"
            />
            {startDate && (
              <button
                onClick={onClearDates}
                className="p-1 text-gray-400 hover:text-[#33ffcc] transition-colors"
                title="Effacer les dates"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
