import { Search, Calendar, Star, ArrowRight, Gamepad2, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ProductsService } from '../services';
import { Product } from '../types';

// Variantes d'animation pour le Hero
const heroAnimations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  },
  badge: {
    hidden: { opacity: 0, y: -20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
    }
  },
  title: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }
    }
  },
  text: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
    }
  },
  buttons: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
    }
  },
  stats: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
    }
  },
  searchCard: {
    hidden: { opacity: 0, x: 60, rotateY: -5 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }
    }
  }
};

// Images pour le diaporama du héro (4 photos bien distinctes)
const heroImages = [
  'https://images.pexels.com/photos/4691567/pexels-photo-4691567.jpeg?auto=compress&cs=tinysrgb&w=1920', // Soirée casino
  'https://images.pexels.com/photos/163888/pexels-photo-163888.jpeg?auto=compress&cs=tinysrgb&w=1920',  // Baby-foot
  'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1920', // Jeux vidéo néon
  'https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg?auto=compress&cs=tinysrgb&w=1920', // Fête foraine
];

// Hook personnalisé pour le debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function Hero() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce la recherche pour éviter trop de filtrage
  const debouncedQuery = useDebounce(searchQuery, 150);

  // Diaporama automatique
  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(nextImage, 5000);
    return () => clearInterval(intervalId);
  }, [nextImage]);

  // Charger tous les produits au montage
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const data = await ProductsService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Filtrer les suggestions avec useMemo pour optimiser les performances
  const suggestions = useMemo(() => {
    if (debouncedQuery.length < 1 || products.length === 0) {
      return [];
    }

    const query = debouncedQuery.toLowerCase().trim();

    // Filtrer les produits qui matchent
    const matches = products.filter(product => {
      const name = product.name?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      return name.includes(query) || description.includes(query);
    });

    // Trier : d'abord ceux qui commencent par la requête, puis par pertinence
    const sorted = matches.sort((a, b) => {
      const aName = a.name?.toLowerCase() || '';
      const bName = b.name?.toLowerCase() || '';
      const aStartsWith = aName.startsWith(query);
      const bStartsWith = bName.startsWith(query);

      // Priorité aux noms qui commencent par la requête
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Puis par position du match dans le nom
      const aIndex = aName.indexOf(query);
      const bIndex = bName.indexOf(query);
      if (aIndex !== bIndex) return aIndex - bIndex;

      // Enfin par ordre alphabétique
      return aName.localeCompare(bName);
    });

    return sorted.slice(0, 6);
  }, [debouncedQuery, products]);

  // Afficher/masquer les suggestions
  useEffect(() => {
    if (debouncedQuery.length >= 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  // Calculer l'état de chargement
  const isSearching = searchQuery !== debouncedQuery;

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/catalogue${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleSelectProduct = (productId: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/produit/${productId}`);
  };

  return (
    <section id="main-content" className="relative min-h-screen flex items-center overflow-hidden hero-gradient">
      {/* Diaporama de fond */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('${image}')`,
              opacity: index === currentImageIndex ? 1 : 0,
            }}
          />
        ))}
      </div>
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#000033]/70 via-[#000033]/60 to-[#000033]/65"></div>
      
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#33ffcc] rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-[#66cccc] rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-[#33ffcc]/60 rounded-full animate-bounce"></div>
        <div className="absolute top-60 right-1/3 w-1 h-1 bg-[#66cccc]/80 rounded-full animate-pulse"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Contenu principal - Décalé à gauche */}
            <motion.div
              className="text-left lg:pr-8"
              variants={heroAnimations.container}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={heroAnimations.badge}
                className="inline-flex items-center gap-2 mb-8 px-6 py-3 bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-full backdrop-blur-sm"
              >
                <Star className="w-4 h-4 text-[#33ffcc] fill-current" />
                <span className="text-[#33ffcc] friendly-badge text-xl md:text-2xl">
                  Depuis 2015 en région PACA • +2000 événements
                </span>
              </motion.div>

              <motion.h1
                variants={heroAnimations.title}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] drop-shadow-lg"
              >
                Loue & <span className="gradient-text drop-shadow-none">Joue !</span>
              </motion.h1>

              <motion.p
                variants={heroAnimations.text}
                className="text-lg md:text-xl text-[#E5E5E5]/90 mb-10 leading-relaxed max-w-xl"
              >
                Location de <span className="text-[#33ffcc] font-semibold">jeux variés, rares et insolites</span> pour tous vos événements en Provence-Alpes-Côte d'Azur
              </motion.p>

              {/* CTA */}
              <motion.div
                variants={heroAnimations.buttons}
                className="flex flex-row gap-4 justify-start mb-14"
              >
                <Link
                  to="/catalogue"
                  className="group bg-[#33ffcc] text-[#000033] font-bold text-base md:text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(51,255,204,0.4)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Catalogue</span>
                </Link>
                <Link
                  to="/evenements"
                  className="group bg-white/10 text-white font-bold text-base md:text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 border border-white/20 hover:border-[#33ffcc]/50 hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Événements</span>
                </Link>
              </motion.div>

              {/* Stats rapides */}
              <motion.div
                variants={heroAnimations.stats}
                className="grid grid-cols-3 gap-6 max-w-md"
              >
                <div className="text-center">
                  <div className="text-3xl md:text-4xl friendly-badge text-[#33ffcc]">200+</div>
                  <div className="text-sm md:text-base text-gray-400">Jeux disponibles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl friendly-badge text-[#33ffcc]">2000+</div>
                  <div className="text-sm md:text-base text-gray-400">Événements</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl friendly-badge text-[#33ffcc]">98%</div>
                  <div className="text-sm md:text-base text-gray-400">Satisfaction</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Barre de recherche interactive */}
            <motion.div
              className="relative"
              variants={heroAnimations.searchCard}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#33ffcc]/10 flex items-center justify-center">
                    <Search className="w-5 h-5 text-[#33ffcc]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">Trouvez votre jeu idéal</h3>
                </div>

                <form onSubmit={handleSearch} className="space-y-3">
                  {/* Champ de recherche principal avec autocomplétion */}
                  <div className="relative" ref={searchRef}>
                    <label className="block text-sm text-white/70 mb-2 font-medium">Quel jeu recherchez-vous ?</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                      {(isSearching || isLoadingProducts) && searchQuery.length > 0 && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#33ffcc] animate-spin z-10" />
                      )}
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 1 && setShowSuggestions(true)}
                        placeholder="Baby-foot, poker, borne arcade..."
                        className="w-full pl-12 pr-4 py-4 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 focus:bg-white/[0.08] transition-all duration-200 text-base"
                        autoComplete="off"
                      />
                    </div>

                    {/* Liste des suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#000033]/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                        <ul className="max-h-80 overflow-y-auto">
                          {suggestions.map((product) => (
                            <li key={product.id}>
                              <button
                                type="button"
                                onClick={() => handleSelectProduct(product.id)}
                                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#33ffcc]/10 transition-colors duration-200 text-left"
                              >
                                {/* Image du produit */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                                  {product.images && product.images[0] ? (
                                    <img
                                      src={product.images[0]}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Gamepad2 className="w-6 h-6 text-gray-500" />
                                    </div>
                                  )}
                                </div>

                                {/* Infos du produit */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-semibold truncate">{product.name}</p>
                                  <p className="text-gray-400 text-sm truncate">
                                    {product.pricing?.oneDay ? `${product.pricing.oneDay}€/jour` : 'Prix sur demande'}
                                  </p>
                                </div>

                                {/* Flèche */}
                                <ArrowRight className="w-5 h-5 text-[#33ffcc] flex-shrink-0" />
                              </button>
                            </li>
                          ))}
                        </ul>

                        {/* Voir tous les résultats */}
                        <div className="border-t border-white/10 p-2">
                          <button
                            type="submit"
                            className="w-full px-4 py-2 text-[#33ffcc] hover:bg-[#33ffcc]/10 rounded-lg transition-colors duration-200 text-sm font-semibold flex items-center justify-center gap-2"
                          >
                            Voir tous les résultats pour "{searchQuery}"
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Message si aucun résultat */}
                    {showSuggestions && debouncedQuery.length >= 1 && suggestions.length === 0 && !isSearching && !isLoadingProducts && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#000033]/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl p-4 z-50 animate-fade-in">
                        <p className="text-white/60 text-center">Aucun produit trouvé pour "{debouncedQuery}"</p>
                        <button
                          type="submit"
                          className="w-full mt-3 px-4 py-2 text-[#33ffcc] hover:bg-[#33ffcc]/10 rounded-lg transition-colors duration-200 text-sm font-semibold"
                        >
                          Rechercher dans le catalogue
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sélecteur de catégorie */}
                  <div>
                    <label className="block text-sm text-white/70 mb-2 font-medium">Catégorie</label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-4 bg-white/[0.06] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 focus:bg-white/[0.08] transition-all duration-200 appearance-none cursor-pointer text-base"
                      >
                        <option value="" className="bg-[#000033]">Toutes les catégories</option>
                        <option value="casino-poker" className="bg-[#000033]">Casino & Poker</option>
                        <option value="jeux-bar" className="bg-[#000033]">Jeux de Bar</option>
                        <option value="jeux-video" className="bg-[#000033]">Jeux Vidéo</option>
                        <option value="jeux-bois" className="bg-[#000033]">Jeux en Bois</option>
                        <option value="kermesse" className="bg-[#000033]">Kermesse</option>
                        <option value="jeux-sportifs" className="bg-[#000033]">Jeux Sportifs</option>
                        <option value="loto-bingo" className="bg-[#000033]">Loto & Bingo</option>
                        <option value="decoration" className="bg-[#000033]">Décoration</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Bouton de recherche */}
                  <button
                    type="submit"
                    className="group w-full bg-[#33ffcc] hover:bg-[#4fffdd] text-[#000033] font-bold text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_0_20px_rgba(51,255,204,0.3)] mt-2"
                  >
                    <Search className="w-5 h-5" />
                    Rechercher
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* Lien direct vers le catalogue */}
                <div className="mt-5 pt-4 border-t border-white/10 text-center">
                  <Link
                    to="/catalogue"
                    className="group inline-flex items-center gap-2 text-white/60 hover:text-[#33ffcc] transition-colors duration-200 text-sm"
                  >
                    Ou parcourir tout le catalogue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Gradient de transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#000033] to-transparent"></div>
    </section>
  );
}
