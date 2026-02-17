import { Search, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { animations } from './constants';

interface HeroSearchBarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  durationDays: number;
  isSearchFocused: boolean;
  setIsSearchFocused: (v: boolean) => void;
  setShowSuggestions: (v: boolean) => void;
  isSearching: boolean;
  isLoading: boolean;
  getTodayString: () => string;
  onSubmit: (e: React.FormEvent) => void;
  searchContainerRef: React.RefObject<HTMLDivElement>;
  searchInputDesktopRef: React.RefObject<HTMLDivElement>;
  searchInputMobileRef: React.RefObject<HTMLDivElement>;
}

export function HeroSearchBar({
  searchQuery,
  setSearchQuery,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  durationDays,
  isSearchFocused,
  setIsSearchFocused,
  setShowSuggestions,
  isSearching,
  isLoading,
  getTodayString,
  onSubmit,
  searchContainerRef,
  searchInputDesktopRef,
  searchInputMobileRef,
}: HeroSearchBarProps) {
  return (
    <motion.div variants={animations.searchBar} className="max-w-4xl mx-auto" ref={searchContainerRef}>
      <form onSubmit={onSubmit}>
        <div className={`
          relative bg-white/[0.07] backdrop-blur-xl rounded-2xl border transition-all duration-300
          ${isSearchFocused ? 'border-[#33ffcc]/40 shadow-[0_0_40px_rgba(51,255,204,0.15)]' : 'border-white/10'}
        `}>
          {/* Desktop layout */}
          <div className="hidden lg:flex items-stretch">
            {/* Recherche */}
            <div className="flex-1 border-r border-white/10" ref={searchInputDesktopRef}>
              <div className="flex items-center h-full px-5 py-4">
                <Search className="w-5 h-5 text-white/40 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchQuery.length >= 1) setShowSuggestions(true);
                  }}
                  placeholder="Quel jeu recherchez-vous ?"
                  className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none text-base"
                  autoComplete="off"
                />
                {(isSearching || isLoading) && searchQuery.length > 0 && (
                  <Loader2 className="w-5 h-5 text-[#33ffcc] animate-spin ml-2" />
                )}
              </div>
            </div>

            {/* Dates groupees */}
            <div className="flex items-center gap-1 px-4 py-4 border-r border-white/10">
              <Calendar className="w-5 h-5 text-[#33ffcc] flex-shrink-0 mr-2" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                min={getTodayString()}
                className="w-[130px] bg-transparent text-white focus:outline-none text-sm [color-scheme:dark] cursor-pointer"
              />
              <span className="text-white/30 mx-1">{'\u2192'}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={startDate || getTodayString()}
                className="w-[130px] bg-transparent text-white focus:outline-none text-sm [color-scheme:dark] cursor-pointer"
              />
              {durationDays > 0 && (
                <span className="ml-2 px-2 py-1 bg-[#33ffcc]/20 text-[#33ffcc] rounded-md text-sm font-semibold">
                  {durationDays}j
                </span>
              )}
            </div>

            {/* Bouton recherche */}
            <button
              type="submit"
              className="px-8 bg-[#33ffcc] hover:bg-[#4dffdd] text-[#000033] font-bold rounded-r-2xl flex items-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(51,255,204,0.4)] active:scale-[0.98]"
            >
              <Search className="w-5 h-5" />
              <span>Rechercher</span>
            </button>
          </div>

          {/* Mobile/Tablet layout */}
          <div className="lg:hidden p-4 space-y-3">
            <div ref={searchInputMobileRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchQuery.length >= 1) setShowSuggestions(true);
                  }}
                  placeholder="Quel jeu recherchez-vous ?"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#33ffcc]/50"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#33ffcc]" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  min={getTodayString()}
                  className="w-full pl-10 pr-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#33ffcc]/50 [color-scheme:dark]"
                />
              </div>
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#33ffcc]" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  min={startDate || getTodayString()}
                  className="w-full pl-10 pr-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#33ffcc]/50 [color-scheme:dark]"
                />
              </div>
              {durationDays > 0 && (
                <div className="flex items-center px-3 bg-[#33ffcc]/20 text-[#33ffcc] rounded-xl text-sm font-semibold">
                  {durationDays}j
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#33ffcc] hover:bg-[#4dffdd] text-[#000033] font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Search className="w-5 h-5" />
              <span>Rechercher</span>
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
