import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Grid, List, X, Calendar, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product, Category, FilterOptions } from '../types';
import { ProductsService, CategoriesService } from '../services';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { getUnavailableProductIds, calculateDurationDaysInclusive } from '../utils/availability';
import { SEO } from '../components/SEO';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';
import { useCart } from '../contexts/CartContext';
import { useDebounce } from '../hooks';

// Mapping des slugs URL vers les noms de catégories
const CATEGORY_SLUG_MAP: { [key: string]: string } = {
  'casino-poker': 'Casino & Poker',
  'jeux-bar': 'Jeux de Bar',
  'jeux-video': 'Jeux Vidéo',
  'jeux-bois': 'Jeux en Bois',
  'kermesse': 'Kermesse',
  'jeux-sportifs': 'Jeux Sportifs',
  'loto-bingo': 'Loto & Bingo',
  'decoration': 'Décoration',
  'son-lumiere': 'Son & Lumière'
};

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rentalDateRange, setRentalDateRange, rentalDurationDays } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const hasScrolledToCategory = useRef(false);
  const isInitialMount = useRef(true);

  // State pour le filtrage de disponibilité asynchrone
  const [unavailableProductIds, setUnavailableProductIds] = useState<Set<string>>(new Set());
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Dates locales (synchronisées avec URL et CartContext)
  const [startDate, setStartDateLocal] = useState<string>('');
  const [endDate, setEndDateLocal] = useState<string>('');

  // Debounce les dates pour éviter trop de requêtes
  const debouncedStartDate = useDebounce(startDate, 300);
  const debouncedEndDate = useDebounce(endDate, 300);

  // Helper pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayString = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Valider et corriger les dates
  const validateAndCorrectDates = useCallback((from: string, to: string): { from: string; to: string } => {
    if (!from && to) {
      // Si to est choisi sans from, mettre from = to
      return { from: to, to };
    }
    if (from && to && to < from) {
      // Si to < from, corriger to = from
      return { from, to: from };
    }
    return { from, to };
  }, []);

  // Mettre à jour les dates avec synchronisation URL + Context
  const updateDates = useCallback((newFrom: string, newTo: string, options?: { skipUrlUpdate?: boolean }) => {
    const corrected = validateAndCorrectDates(newFrom, newTo);

    setStartDateLocal(corrected.from);
    setEndDateLocal(corrected.to);

    // Mettre à jour le CartContext
    if (corrected.from && corrected.to) {
      setRentalDateRange({ from: corrected.from, to: corrected.to });
    } else if (!corrected.from && !corrected.to) {
      setRentalDateRange(null);
    }

    // Mettre à jour l'URL (sans empiler l'historique)
    if (!options?.skipUrlUpdate) {
      const newParams = new URLSearchParams(searchParams);
      if (corrected.from) {
        newParams.set('from', corrected.from);
      } else {
        newParams.delete('from');
      }
      if (corrected.to) {
        newParams.set('to', corrected.to);
      } else {
        newParams.delete('to');
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, setRentalDateRange, validateAndCorrectDates]);

  // Handler pour le changement de date de début
  const handleStartDateChange = useCallback((value: string) => {
    if (!value) {
      // Si on efface from, effacer aussi to
      updateDates('', '');
    } else {
      // Garder to si valide, sinon vider
      const newTo = endDate && endDate >= value ? endDate : '';
      updateDates(value, newTo);
    }
  }, [endDate, updateDates]);

  // Handler pour le changement de date de fin
  const handleEndDateChange = useCallback((value: string) => {
    if (!value) {
      updateDates(startDate, '');
    } else if (!startDate) {
      // Si pas de from, mettre from = to
      updateDates(value, value);
    } else {
      updateDates(startDate, value);
    }
  }, [startDate, updateDates]);

  // Effacer les dates
  const clearDates = useCallback(() => {
    updateDates('', '');
  }, [updateDates]);

  // Lire les paramètres d'URL au chargement initial
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const searchQuery = searchParams.get('search');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (searchQuery) {
      setSearchTerm(searchQuery);
    }

    // Initialiser les dates depuis l'URL ou le CartContext
    if (fromParam || toParam) {
      // Priorité aux params URL
      const from = fromParam || '';
      const to = toParam || fromParam || ''; // Si pas de to, utiliser from
      updateDates(from, to, { skipUrlUpdate: true });
    } else if (rentalDateRange) {
      // Sinon utiliser le CartContext (restauration depuis localStorage)
      setStartDateLocal(rentalDateRange.from);
      setEndDateLocal(rentalDateRange.to);
      // Mettre à jour l'URL
      const newParams = new URLSearchParams(searchParams);
      newParams.set('from', rentalDateRange.from);
      newParams.set('to', rentalDateRange.to);
      setSearchParams(newParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Vérifier la disponibilité des produits quand les dates changent
  useEffect(() => {
    // Ne rien faire si pas de dates ou pas de produits
    if (!debouncedStartDate || !debouncedEndDate || products.length === 0) {
      setUnavailableProductIds(new Set());
      setCheckingAvailability(false);
      return;
    }

    let cancelled = false;

    const checkAvailabilities = async () => {
      setCheckingAvailability(true);

      try {
        const unavailable = await getUnavailableProductIds(
          products,
          debouncedStartDate,
          debouncedEndDate
        );

        if (!cancelled) {
          setUnavailableProductIds(unavailable);
        }
      } catch (error) {
        console.error('Error checking availabilities:', error);
        if (!cancelled) {
          setUnavailableProductIds(new Set());
        }
      } finally {
        if (!cancelled) {
          setCheckingAvailability(false);
        }
      }
    };

    checkAvailabilities();

    return () => {
      cancelled = true;
    };
  }, [products, debouncedStartDate, debouncedEndDate]);

  // Appliquer la catégorie depuis l'URL une fois les catégories chargées
  useEffect(() => {
    const categorySlug = searchParams.get('category');

    if (categorySlug && categories.length > 0 && !hasScrolledToCategory.current) {
      const categoryName = CATEGORY_SLUG_MAP[categorySlug];

      if (categoryName) {
        // Trouver la catégorie par son nom
        const category = categories.find(
          c => c.name.toLowerCase() === categoryName.toLowerCase()
        );

        if (category) {
          setSelectedCategory(category.id);
          hasScrolledToCategory.current = true;

          // Scroller vers la section produits après un court délai
          setTimeout(() => {
            productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      }
    }
  }, [categories, searchParams]);

  // Charger les produits et catégories depuis Supabase avec synchronisation temps réel
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Vérifier si Supabase est configuré
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey || 
            supabaseUrl === 'https://placeholder.supabase.co' || 
            supabaseKey === 'placeholder-anon-key') {
          console.error('❌ Supabase non configuré! Vérifiez votre fichier .env');
          console.error('Variables requises: VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
          setError('Supabase non configuré. Veuillez créer un fichier .env avec vos identifiants Supabase.');
          setProducts([]);
          setCategories([]);
          return;
        }
        
        setError(null);
        
        // Récupérer TOUS les produits actifs pour le catalogue
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .order('name', { ascending: true });
        
        if (productsError) {
          console.error('❌ Erreur lors du chargement des produits:', productsError);
          console.error('Détails:', {
            message: productsError.message,
            code: productsError.code,
            details: productsError.details,
            hint: productsError.hint
          });
          
          // Si c'est une erreur de permission (RLS), afficher un message spécifique
          if (productsError.code === 'PGRST301' || productsError.message?.includes('permission')) {
            console.error('💡 Problème de permissions RLS. Vérifiez les politiques de sécurité dans Supabase.');
            setError('Erreur de permissions. Vérifiez les politiques RLS dans Supabase.');
          } else {
            setError(`Erreur lors du chargement: ${productsError.message}`);
          }
          
          setProducts([]);
          setCategories([]);
          return;
        }

        const [categoriesData] = await Promise.all([
          CategoriesService.getCategories()
        ]);

        // Mapper les produits pour s'assurer qu'ils ont la bonne structure
        const mappedProducts = (productsData || []).map((p: any) => {
          // Gérer le pricing qui peut être un JSONB
          let pricing = { oneDay: 0, weekend: 0, week: 0, custom: 0 };
          if (p.pricing) {
            if (typeof p.pricing === 'object') {
              pricing = {
                oneDay: p.pricing.oneDay || p.pricing.one_day || 0,
                weekend: p.pricing.weekend || 0,
                week: p.pricing.week || 0,
                custom: p.pricing.custom || 0
              };
            }
          }
          
          // Gérer les specifications qui peuvent être un JSONB
          let specifications = {
            dimensions: '',
            weight: 0,
            players: { min: 1, max: 10 },
            electricity: false,
            setup_time: 0
          };
          if (p.specifications) {
            if (typeof p.specifications === 'object') {
              specifications = {
                dimensions: p.specifications.dimensions || '',
                weight: p.specifications.weight || 0,
                players: p.specifications.players || { min: 1, max: 10 },
                electricity: p.specifications.electricity || false,
                setup_time: p.specifications.setup_time || p.specifications.setupTime || 0
              };
            }
          }
          
          return {
            ...p,
            pricing,
            specifications,
            images: Array.isArray(p.images) ? p.images : [],
            total_stock: p.total_stock || 0,
            is_active: p.is_active !== undefined ? p.is_active : true,
            description: p.description || ''
          };
        }) as Product[];

        setProducts(mappedProducts);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading catalog data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Charger les données initiales
    loadData();

    // Synchronisation en temps réel avec Supabase Realtime
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          // Recharger les produits en temps réel
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
    };
  }, []);

  // Grouper les produits par catégorie avec compteurs
  const categoriesWithCount = useMemo(() => {
    return categories.map(category => ({
      ...category,
      productCount: products.filter(p => p.category_id === category.id).length
    }));
  }, [categories, products]);

  // Filtrage et recherche des produits
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filtre par catégorie sélectionnée
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    // Filtre par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie (depuis filtres sidebar)
    if (filters.category) {
      filtered = filtered.filter(product => product.category_id === filters.category);
    }

    // Filtre par prix
    if (filters.price_min !== undefined) {
      filtered = filtered.filter(product => product.pricing.oneDay >= filters.price_min!);
    }
    if (filters.price_max !== undefined) {
      filtered = filtered.filter(product => product.pricing.oneDay <= filters.price_max!);
    }

    // Filtre par nombre de joueurs (depuis filtres sidebar)
    if (filters.players_min !== undefined) {
      filtered = filtered.filter(product => product.specifications.players.max >= filters.players_min!);
    }
    if (filters.players_max !== undefined) {
      filtered = filtered.filter(product => product.specifications.players.min <= filters.players_max!);
    }

    // Filtre principal : dates de disponibilité (utilise les IDs pré-calculés)
    if (startDate && endDate && unavailableProductIds.size > 0) {
      filtered = filtered.filter(product => !unavailableProductIds.has(product.id));
    }

    // Tri
    switch (filters.sort_by) {
      case 'price_asc':
        filtered.sort((a, b) => a.pricing.oneDay - b.pricing.oneDay);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.pricing.oneDay - a.pricing.oneDay);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.total_stock - a.total_stock);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        if (searchTerm) {
          filtered.sort((a, b) => {
            const aRelevance = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 2 : 1;
            const bRelevance = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 2 : 1;
            return bRelevance - aRelevance;
          });
        }
    }

    return filtered;
  }, [products, filters, searchTerm, selectedCategory, startDate, endDate, unavailableProductIds]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, selectedCategory, startDate, endDate]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
    // Scroll vers les produits
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSelectedCategory(null);
    clearDates();
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length +
    (searchTerm ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (startDate ? 1 : 0);


  // Breadcrumb pour le schema
  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://www.locagame.fr' },
    { name: 'Catalogue', url: 'https://www.locagame.fr/catalogue' }
  ];

  // Titre dynamique basé sur les filtres
  const getPageTitle = () => {
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory);
      return cat ? `Location ${cat.name}` : 'Catalogue';
    }
    if (searchTerm) {
      return `Recherche: ${searchTerm}`;
    }
    return 'Catalogue de jeux à louer';
  };

  return (
    <>
      <SEO
        title={getPageTitle()}
        description={`Découvrez notre catalogue de ${products.length}+ jeux à louer pour vos événements : jeux de bar, casino, jeux en bois, bornes arcade et plus. Livraison en région PACA.`}
        keywords="location jeux, catalogue jeux, jeux événement, baby-foot location, poker location, borne arcade, jeux bois, Marseille, PACA"
        url="https://www.locagame.fr/catalogue"
      />
      <BreadcrumbSchema items={breadcrumbItems} />

    <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#000033] to-[#001144] pt-header">
      {/* Hero Section - Compact */}
      <div className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Notre <span className="gradient-text">Catalogue</span>
          </h1>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            {products.length}+ jeux disponibles pour vos événements
          </p>

          {/* Barre de recherche et dates - Layout horizontal sur desktop */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Barre de recherche */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un jeu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#33ffcc] focus:bg-white/10 focus:outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dates groupées */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                  <Calendar className="w-4 h-4 text-gray-500 hidden sm:block" />
                  <span className="text-gray-500 text-sm hidden sm:inline">Du</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    min={getTodayString()}
                    className="w-[130px] bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                  />
                  <span className="text-gray-500 text-sm">au</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    min={startDate || getTodayString()}
                    className="w-[130px] bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                  />
                  {/* Affichage du nombre de jours */}
                  {startDate && endDate && (
                    <span className="text-[#33ffcc] text-sm font-medium whitespace-nowrap">
                      {calculateDurationDaysInclusive(startDate, endDate)} jour{calculateDurationDaysInclusive(startDate, endDate) > 1 ? 's' : ''}
                    </span>
                  )}
                  {/* Indicateur de vérification */}
                  {checkingAvailability && (
                    <Loader2 className="w-4 h-4 text-[#33ffcc] animate-spin" />
                  )}
                  {/* Bouton effacer */}
                  {startDate && (
                    <button
                      onClick={clearDates}
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
        </div>
      </div>

      {/* Section Catégories - Scroll horizontal épuré */}
      <div className="relative z-10 py-3 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {/* Bouton "Tous" */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-[#33ffcc] text-[#000033]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              Tous ({products.length})
            </button>
            {categoriesWithCount.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-[#33ffcc] text-[#000033]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category.icon} {category.name} ({category.productCount})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section Produits */}
      <div ref={productsRef} className="relative z-10 py-8 bg-gradient-to-b from-transparent to-[#000033]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Barre de résultats - Compacte */}
          <div className="sticky top-[var(--header-height)] z-30 bg-[#000033]/90 backdrop-blur-md py-3 mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-white/5">
            <div className="flex items-center justify-between gap-4">
              {/* Compteur et filtres actifs */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-white font-medium whitespace-nowrap">
                  {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''}
                </span>

                {/* Badge indiquant le filtre de dates actif */}
                {startDate && endDate && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-full text-xs text-[#33ffcc]">
                    <Calendar className="w-3 h-3" />
                    Dispo {new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    {unavailableProductIds.size > 0 && (
                      <span className="ml-1 text-gray-400">
                        ({unavailableProductIds.size} indispo)
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

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Tri rapide */}
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

                {/* Vue grille/liste */}
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

          {/* Grille des produits */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-[#33ffcc] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Chargement du catalogue...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/10 rounded-full mb-6">
                <X className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Erreur de connexion</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">{error}</p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto text-left">
                <p className="text-white font-semibold mb-3">Solutions possibles :</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                  <li>Créez un fichier <code className="bg-white/10 px-2 py-1 rounded">.env</code> à la racine du projet</li>
                  <li>Ajoutez vos identifiants Supabase :
                    <pre className="bg-[#000033] p-3 rounded mt-2 text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon`}
                    </pre>
                  </li>
                  <li>Redémarrez le serveur de développement</li>
                  <li>Vérifiez que les tables existent dans Supabase</li>
                  <li>Vérifiez les politiques RLS (Row Level Security) dans Supabase</li>
                </ol>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 rounded-full mb-6">
                <Search className="w-12 h-12 text-[#33ffcc]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Aucun produit disponible</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Le catalogue est vide pour le moment. Les produits seront ajoutés prochainement.
              </p>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              {/* Affichage par catégorie si aucune catégorie n'est sélectionnée et pas de recherche */}
              {!selectedCategory && !searchTerm && Object.keys(filters).length === 0 && !startDate ? (
                categoriesWithCount
                  .filter(cat => cat.productCount > 0)
                  .map(category => {
                    const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
                    if (categoryProducts.length === 0) return null;
                    
                    return (
                      <div key={category.id} className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                          <span className="text-sm font-normal text-gray-500">({categoryProducts.length})</span>
                        </h2>
                        <div className={`grid gap-5 ${
                          viewMode === 'grid'
                            ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'grid-cols-1'
                        }`}>
                          {categoryProducts.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              viewMode={viewMode}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className={`grid gap-5 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}>
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Précédent
                  </button>

                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 text-sm rounded-lg transition-all ${
                            page === currentPage
                              ? 'bg-[#33ffcc] text-[#000033] font-bold'
                              : 'text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-4">Aucun produit trouvé pour ces critères</p>
              <button
                onClick={clearAllFilters}
                className="text-[#33ffcc] hover:underline text-sm"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
