import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHero } from '../hooks/useHero';
import { animations } from './hero/constants';
import { HeroBackground } from './hero/HeroBackground';
import { HeroTitle } from './hero/HeroTitle';
import { HeroSearchBar } from './hero/HeroSearchBar';
import { HeroCategories } from './hero/HeroCategories';
import { HeroStats } from './hero/HeroStats';
import { DropdownPortal } from './hero/DropdownPortal';

export function Hero() {
  const {
    searchQuery, setSearchQuery,
    startDate, endDate,
    categories,
    showSuggestions, setShowSuggestions,
    currentImageIndex,
    isSearchFocused, setIsSearchFocused,
    isDesktop, isSearching, suggestions,
    durationDays, getTodayString,
    handleStartDateChange, handleEndDateChange,
    handleSearch, handleSelectProduct, handleCategoryClick,
    searchContainerRef, searchInputDesktopRef,
    searchInputMobileRef, dropdownPortalRef,
  } = useHero();

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
      <HeroBackground currentImageIndex={currentImageIndex} />

      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <motion.div
          variants={animations.container}
          initial="hidden"
          animate="visible"
          className="space-y-8 md:space-y-10"
        >
          <HeroTitle />

          <HeroSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            durationDays={durationDays}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
            setShowSuggestions={setShowSuggestions}
            isSearching={isSearching}
            isLoading={false}
            getTodayString={getTodayString}
            onSubmit={handleSearch}
            searchContainerRef={searchContainerRef}
            searchInputDesktopRef={searchInputDesktopRef}
            searchInputMobileRef={searchInputMobileRef}
          />

          <HeroCategories
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />

          <HeroStats />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-white/30 cursor-pointer hover:text-white/50 transition-colors"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-xs uppercase tracking-widest">Découvrir</span>
          <ArrowRight className="w-4 h-4 rotate-90" />
        </motion.div>
      </motion.div>

      {/* Dropdown Portal */}
      <DropdownPortal
        suggestions={suggestions}
        onSelect={handleSelectProduct}
        anchorRef={isDesktop ? searchInputDesktopRef : searchInputMobileRef}
        isVisible={showSuggestions}
        dropdownRef={dropdownPortalRef}
      />
    </section>
  );
}
