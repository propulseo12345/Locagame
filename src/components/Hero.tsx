import { Search, Calendar, ArrowRight, Gamepad2, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductsService, CategoriesService } from '../services';
import { Product, Category } from '../types';
import { useCart } from '../contexts/CartContext';

// Animations orchestrées
const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  },
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  },
  searchBar: {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }
    }
  },
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
};

// Images de fond
const heroImages = [
  'https://images.pexels.com/photos/4691567/pexels-photo-4691567.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/163888/pexels-photo-163888.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg?auto=compress&cs=tinysrgb&w=1920',
];

// Icônes catégories avec images
const categoryVisuals: Record<string, { gradient: string; emoji: string }> = {
  'Casino & Poker': { gradient: 'from-red-500 to-orange-600', emoji: '🎰' },
  'Jeux de Bar': { gradient: 'from-amber-500 to-yellow-600', emoji: '🎱' },
  'Jeux Vidéo': { gradient: 'from-purple-500 to-pink-600', emoji: '🎮' },
  'Jeux en Bois': { gradient: 'from-orange-600 to-amber-700', emoji: '🪵' },
  'Kermesse': { gradient: 'from-green-500 to-emerald-600', emoji: '🎪' },
  'Jeux Sportifs': { gradient: 'from-blue-500 to-cyan-600', emoji: '⚽' },
  'Loto & Bingo': { gradient: 'from-pink-500 to-rose-600', emoji: '🎯' },
  'Décoration': { gradient: 'from-violet-500 to-purple-600', emoji: '✨' },
  'Son & Lumière': { gradient: 'from-cyan-500 to-blue-600', emoji: '🔊' },
};

// Hook debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Calcul durée
function calculateDays(from: string, to: string): number {
  const start = new Date(from);
  const end = new Date(to);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function Hero() {
  const navigate = useNavigate();
  const { rentalDateRange, setRentalDateRange } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(rentalDateRange?.from || '');
  const [endDate, setEndDate] = useState(rentalDateRange?.to || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 150);
  const isSearching = searchQuery !== debouncedQuery;

  const getTodayString = useCallback(() => new Date().toISOString().split('T')[0], []);

  // Diaporama
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Chargement données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          ProductsService.getProducts(),
          CategoriesService.getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Suggestions
  const suggestions = useMemo(() => {
    if (debouncedQuery.length < 1 || products.length === 0) return [];
    const query = debouncedQuery.toLowerCase().trim();
    return products
      .filter(p => p.name?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query))
      .sort((a, b) => {
        const aStarts = a.name?.toLowerCase().startsWith(query);
        const bStarts = b.name?.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      })
      .slice(0, 5);
  }, [debouncedQuery, products]);

  useEffect(() => {
    setShowSuggestions(debouncedQuery.length >= 1 && isSearchFocused);
  }, [debouncedQuery, isSearchFocused]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (value && endDate && endDate < value) setEndDate(value);
  };

  const handleEndDateChange = (value: string) => {
    if (!startDate && value) setStartDate(value);
    setEndDate(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (startDate && endDate) setRentalDateRange({ from: startDate, to: endDate });

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (startDate) params.set('from', startDate);
    if (endDate) params.set('to', endDate);
    navigate(`/catalogue${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleSelectProduct = (productId: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/produit/${productId}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    if (startDate && endDate) setRentalDateRange({ from: startDate, to: endDate });
    const params = new URLSearchParams();
    params.set('category', categorySlug);
    if (startDate) params.set('from', startDate);
    if (endDate) params.set('to', endDate);
    navigate(`/catalogue?${params.toString()}`);
  };

  const getCategorySlug = (name: string): string => {
    const slugMap: Record<string, string> = {
      'Casino & Poker': 'casino-poker',
      'Jeux de Bar': 'jeux-bar',
      'Jeux Vidéo': 'jeux-video',
      'Jeux en Bois': 'jeux-bois',
      'Kermesse': 'kermesse',
      'Jeux Sportifs': 'jeux-sportifs',
      'Loto & Bingo': 'loto-bingo',
      'Décoration': 'decoration',
      'Son & Lumière': 'son-lumiere'
    };
    return slugMap[name] || name.toLowerCase().replace(/\s+/g, '-');
  };

  const durationDays = startDate && endDate ? calculateDays(startDate, endDate) : 0;

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
      {/* Background avec parallax subtil */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${image}')` }}
            initial={false}
            animate={{
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.1
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        ))}

        {/* Overlay complexe pour profondeur */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#000033]/90 via-[#000033]/75 to-[#000033]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,#000033_70%)]" />

        {/* Noise texture subtil */}
        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />

        {/* Accent lumineux */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#33ffcc]/5 blur-[150px] rounded-full" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <motion.div
          variants={animations.container}
          initial="hidden"
          animate="visible"
          className="space-y-8 md:space-y-10"
        >
          {/* Badge de confiance */}
          <motion.div variants={animations.fadeUp} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#33ffcc]" />
              <span className="text-sm text-white/80">
                <span className="text-[#33ffcc] font-semibold">+2000</span> événements réussis en PACA
              </span>
            </div>
          </motion.div>

          {/* Titre */}
          <motion.div variants={animations.fadeUp} className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Louez vos jeux,
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#33ffcc] via-[#66ffdd] to-[#33ffcc] bg-clip-text text-transparent">
                  créez la fête
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-[#33ffcc]/20 rounded-full -skew-x-3"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light">
              Baby-foot, poker, bornes arcade, jeux en bois... Tout pour animer vos événements en région PACA
            </p>
          </motion.div>

          {/* Barre de recherche premium */}
          <motion.div variants={animations.searchBar} className="max-w-4xl mx-auto" ref={searchContainerRef}>
            <form onSubmit={handleSearch}>
              <div className={`
                relative bg-white/[0.07] backdrop-blur-xl rounded-2xl border transition-all duration-300
                ${isSearchFocused ? 'border-[#33ffcc]/40 shadow-[0_0_40px_rgba(51,255,204,0.15)]' : 'border-white/10'}
              `}>
                {/* Desktop layout */}
                <div className="hidden lg:flex items-stretch">
                  {/* Recherche */}
                  <div className="flex-1 relative border-r border-white/10">
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

                    {/* Suggestions dropdown */}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a2e]/98 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                          <ul>
                            {suggestions.map((product, idx) => (
                              <motion.li
                                key={product.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSelectProduct(product.id)}
                                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#33ffcc]/10 transition-colors text-left group"
                                >
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                                    {product.images?.[0] ? (
                                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Gamepad2 className="w-5 h-5 text-white/30" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate group-hover:text-[#33ffcc] transition-colors">
                                      {product.name}
                                    </p>
                                    <p className="text-white/40 text-sm">
                                      {product.pricing?.oneDay ? `${product.pricing.oneDay}€/jour` : 'Prix sur demande'}
                                    </p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#33ffcc] group-hover:translate-x-1 transition-all" />
                                </button>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Dates groupées */}
                  <div className="flex items-center gap-1 px-4 py-4 border-r border-white/10">
                    <Calendar className="w-5 h-5 text-[#33ffcc] flex-shrink-0 mr-2" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      min={getTodayString()}
                      className="w-[130px] bg-transparent text-white focus:outline-none text-sm [color-scheme:dark] cursor-pointer"
                    />
                    <span className="text-white/30 mx-1">→</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
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

                    {/* Mobile suggestions */}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a2e]/98 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                          <ul>
                            {suggestions.map((product) => (
                              <li key={product.id}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectProduct(product.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#33ffcc]/10 text-left"
                                >
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                                    {product.images?.[0] ? (
                                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Gamepad2 className="w-full h-full p-2 text-white/30" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate text-sm">{product.name}</p>
                                    <p className="text-white/40 text-xs">
                                      {product.pricing?.oneDay ? `${product.pricing.oneDay}€/jour` : 'Prix sur demande'}
                                    </p>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#33ffcc]" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        min={getTodayString()}
                        className="w-full pl-10 pr-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#33ffcc]/50 [color-scheme:dark]"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#33ffcc]" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
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

          {/* Catégories */}
          <motion.div variants={animations.fadeUp} className="pt-4">
            <p className="text-center text-white/40 text-sm mb-5 uppercase tracking-wider">
              Explorer par catégorie
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto">
              {categories.slice(0, 8).map((category, idx) => {
                const visual = categoryVisuals[category.name] || { gradient: 'from-gray-500 to-gray-600', emoji: '🎲' };
                return (
                  <motion.button
                    key={category.id}
                    variants={animations.staggerItem}
                    custom={idx}
                    onClick={() => handleCategoryClick(getCategorySlug(category.name))}
                    className="group relative px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/[0.08]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{visual.emoji}</span>
                      <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                        {category.name}
                      </span>
                    </div>

                    {/* Glow effect on hover */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${visual.gradient} opacity-0 group-hover:opacity-10 transition-opacity blur-xl`} />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Stats en bas */}
          <motion.div
            variants={animations.fadeUp}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-12 pt-6 border-t border-white/5 mt-8"
          >
            {[
              { value: '200+', label: 'Jeux disponibles' },
              { value: '10 ans', label: "d'expérience" },
              { value: '98%', label: 'Clients satisfaits' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-[#33ffcc]">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </motion.div>
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
    </section>
  );
}
