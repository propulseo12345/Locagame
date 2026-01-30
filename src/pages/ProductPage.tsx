import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Heart,
  ShoppingCart,
  Users,
  Clock,
  Zap,
  Ruler,
  Weight,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Star,
  Package,
  Calendar,
  Shield,
  Truck,
  MessageCircle,
  Award,
  Sparkles,
  Play,
  Info
} from 'lucide-react';
import { Product, PriceCalculation } from '../types';
import { ProductsService, CategoriesService, FavoritesService } from '../services';
import { formatPrice } from '../utils/pricing';
import { checkAvailability } from '../utils/availability';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import PriceCalculator from '../components/PriceCalculator';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ProductSchema } from '../components/ProductSchema';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, rentalDateRange } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // Initialiser les dates depuis le contexte global (dates du catalogue)
  const [selectedStartDate, setSelectedStartDate] = useState<string>(rentalDateRange?.from || '');
  const [selectedEndDate, setSelectedEndDate] = useState<string>(rentalDateRange?.to || '');
  const [quantity] = useState(1);
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'includes' | 'specs'>('description');

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          const foundProduct = await ProductsService.getProductById(id);
          if (foundProduct) {
            setProduct(foundProduct);
            if (foundProduct.category_id) {
              const foundCategory = await CategoriesService.getCategoryById(foundProduct.category_id);
              if (foundCategory) {
                setCategory(foundCategory.name);
              }
            }
            // Check if product is in favorites
            if (user) {
              const favorites = await FavoritesService.getFavorites(user.id);
              setIsLiked(favorites.some(f => f.id === foundProduct.id));
            }
          }
        } catch (error) {
          console.error('Error loading product:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadProduct();
  }, [id, user]);

  const handleDateSelect = (startDate: string, endDate: string) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    setAvailabilityError('');
  };

  const handleClearSelection = () => {
    setSelectedStartDate('');
    setSelectedEndDate('');
    setAvailabilityError('');
  };

  const handlePriceChange = (calculation: PriceCalculation) => {
    setPriceCalculation(calculation);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedStartDate || !selectedEndDate) {
      setAvailabilityError('Veuillez sélectionner vos dates de location');
      return;
    }

    if (!priceCalculation) {
      setAvailabilityError('Calcul du prix en cours, veuillez patienter');
      return;
    }

    try {
      setIsAddingToCart(true);
      const availability = await checkAvailability(product.id, selectedStartDate, selectedEndDate, quantity);

      // Si erreur de vérification ou indisponible, afficher le message approprié
      if (!availability.available) {
        const errorMsg = availability.error
          ? availability.error
          : 'Ce produit n\'est pas disponible pour les dates sélectionnées';
        setAvailabilityError(errorMsg);
        setIsAddingToCart(false);
        return;
      }

      addItem({
        product,
        start_date: selectedStartDate,
        end_date: selectedEndDate,
        quantity,
        delivery_mode: priceCalculation.delivery_mode,
        delivery_address: priceCalculation.delivery_address,
        delivery_city: priceCalculation.delivery_city,
        delivery_postal_code: priceCalculation.delivery_postal_code,
        delivery_distance: priceCalculation.delivery_distance,
        delivery_fee: priceCalculation.delivery_fee,
        product_price: priceCalculation.product_price,
        total_price: priceCalculation.total,
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/panier');
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityError('Impossible de vérifier la disponibilité. Contactez-nous via le formulaire de contact.');
      setIsAddingToCart(false);
    }
  };

  const handleLike = async () => {
    if (!user || !product) return;

    try {
      if (isLiked) {
        await FavoritesService.removeFavorite(user.id, product.id);
      } else {
        await FavoritesService.addFavorite(user.id, product.id);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const getSelectedDays = () => {
    if (selectedStartDate && selectedEndDate) {
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      const diffTime = end.getTime() - start.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000033] pt-header flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#33ffcc] border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-[#fe1979] border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-white/60 text-lg">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#000033] pt-header flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-[#fe1979]/20 rounded-full mb-6">
            <Package className="w-12 h-12 text-[#fe1979]" />
          </div>
          <h1 className="text-2xl font-black text-white mb-4">Produit non trouvé</h1>
          <p className="text-white/60 mb-6">Ce produit n'existe pas ou a été supprimé</p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] rounded-xl font-bold hover:bg-[#66cccc] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  // Breadcrumb pour le schema
  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://www.locagame.fr' },
    { name: 'Catalogue', url: 'https://www.locagame.fr/catalogue' },
    { name: product.name, url: `https://www.locagame.fr/produit/${product.id}` }
  ];

  return (
    <>
      {/* Structured Data */}
      <ProductSchema product={product} url={`https://www.locagame.fr/produit/${product.id}`} />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header">
      {/* Header Navigation - Sticky */}
      <div className="sticky top-[var(--header-height)] z-40 bg-[#000033]/95 backdrop-blur-xl border-b border-white/10 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 text-white/70 hover:text-[#33ffcc] transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Catalogue
            </Link>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-white/40">
              <Link to="/" className="hover:text-white/60 transition-colors">Accueil</Link>
              <span>/</span>
              <Link to="/catalogue" className="hover:text-white/60 transition-colors">Catalogue</Link>
              <span>/</span>
              <span className="text-[#33ffcc]">{product.name}</span>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleLike}
                className={`p-2 rounded-lg transition-all ${
                  isLiked
                    ? 'bg-[#fe1979] text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14 pb-6 lg:pb-10">
        {/* Layout Principal - 2 colonnes */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Colonne gauche - Galerie & Infos (3/5) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Galerie Images */}
            <div className="space-y-4">
              {/* Image principale */}
              <div className="relative group overflow-hidden rounded-3xl aspect-[4/3] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
                <img
                  src={product.images[currentImageIndex] || '/placeholder-product.jpg'}
                  alt={`${product.name} - Location de jeu pour événement en région PACA. ${product.shortDescription || 'Jeu disponible à la location avec installation professionnelle.'}`}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                  onClick={() => setShowLightbox(true)}
                  fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
                  loading={currentImageIndex === 0 ? "eager" : "lazy"}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.total_stock < 5 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fe1979]/90 backdrop-blur-md text-white rounded-full shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold">Très demandé</span>
                    </div>
                  )}
                  <div className="px-3 py-1.5 bg-[#33ffcc]/20 backdrop-blur-md text-[#33ffcc] rounded-full border border-[#33ffcc]/30">
                    <span className="text-xs font-bold">{category}</span>
                  </div>
                </div>

                {/* Navigation images */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Indicateurs images */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-md rounded-full px-3 py-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? 'w-6 bg-[#33ffcc]'
                            : 'w-1.5 bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Zoom hint */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3 h-3" />
                  Cliquez pour agrandir
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {product.images.slice(0, 5).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'ring-2 ring-[#33ffcc] ring-offset-2 ring-offset-[#000033]'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Titre et Description */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Quick specs mobile */}
              <div className="flex flex-wrap items-center gap-3 mb-6 lg:hidden">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
                  <Users className="w-4 h-4 text-[#33ffcc]" />
                  <span className="text-sm text-white font-medium">{product.specifications.players.min}-{product.specifications.players.max}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
                  <Clock className="w-4 h-4 text-[#66cccc]" />
                  <span className="text-sm text-white font-medium">{product.specifications.setup_time}min</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
                  <Package className="w-4 h-4 text-[#33ffcc]" />
                  <span className="text-sm text-white font-medium">{product.total_stock} dispo</span>
                </div>
              </div>

              <p className="text-lg text-white/70 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Tabs Infos */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-white/10">
                {[
                  { id: 'description', label: 'Description', icon: Info },
                  { id: 'includes', label: 'Inclus', icon: Check },
                  { id: 'specs', label: 'Spécifications', icon: Ruler }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-bold text-sm transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#33ffcc]/10 text-[#33ffcc] border-b-2 border-[#33ffcc]'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'description' && (
                  <div className="space-y-4">
                    <p className="text-white/70 leading-relaxed">
                      {product.description}
                    </p>
                    {product.shortDescription && (
                      <p className="text-white/50 text-sm italic">
                        {product.shortDescription}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'includes' && (
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-8 h-8 rounded-lg bg-[#33ffcc]/20 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-[#33ffcc]" />
                      </div>
                      <span>Livraison et installation sur site</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-8 h-8 rounded-lg bg-[#33ffcc]/20 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-[#33ffcc]" />
                      </div>
                      <span>Explication des règles du jeu</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-8 h-8 rounded-lg bg-[#33ffcc]/20 flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#33ffcc]" />
                      </div>
                      <span>Reprise du matériel en fin d'événement</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-8 h-8 rounded-lg bg-[#33ffcc]/20 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-[#33ffcc]" />
                      </div>
                      <span>Assurance matériel incluse</span>
                    </li>
                    {product.specifications.electricity && (
                      <li className="flex items-center gap-3 text-[#fe1979]">
                        <div className="w-8 h-8 rounded-lg bg-[#fe1979]/20 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-[#fe1979]" />
                        </div>
                        <span className="font-medium">Nécessite une prise électrique</span>
                      </li>
                    )}
                  </ul>
                )}

                {activeTab === 'specs' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <Users className="w-5 h-5 text-[#33ffcc] mb-2" />
                      <div className="text-2xl font-black text-white">{product.specifications.players.min}-{product.specifications.players.max}</div>
                      <div className="text-xs text-white/50 uppercase tracking-wider">Joueurs</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <Clock className="w-5 h-5 text-[#66cccc] mb-2" />
                      <div className="text-2xl font-black text-white">{product.specifications.setup_time}</div>
                      <div className="text-xs text-white/50 uppercase tracking-wider">Min installation</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <Ruler className="w-5 h-5 text-[#33ffcc] mb-2" />
                      <div className="text-lg font-black text-white">{product.specifications.dimensions.width}×{product.specifications.dimensions.length}</div>
                      <div className="text-xs text-white/50 uppercase tracking-wider">Dimensions (cm)</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <Weight className="w-5 h-5 text-[#66cccc] mb-2" />
                      <div className="text-2xl font-black text-white">{product.specifications.weight}</div>
                      <div className="text-xs text-white/50 uppercase tracking-wider">Poids (kg)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite - Réservation Sticky (2/5) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-32 space-y-6">
              {/* Carte Prix */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                {/* Header avec prix */}
                <div className="bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/10 p-6 border-b border-white/10">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-white/60 text-sm">À partir de</span>
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-[#33ffcc]" />
                      <span className="text-sm text-[#33ffcc] font-medium">{product.total_stock} disponibles</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-[#33ffcc]">{formatPrice(product.pricing.oneDay)}</span>
                    <span className="text-xl text-white/60 font-medium">/jour</span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6 space-y-6">
                  {/* Sélecteur de dates */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#33ffcc]" />
                        Choisissez vos dates
                      </h3>
                    </div>

                    {/* Quick date display */}
                    {selectedStartDate && selectedEndDate && (
                      <div className="mb-4 p-4 bg-[#33ffcc]/10 rounded-xl border border-[#33ffcc]/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-[#33ffcc] font-bold uppercase tracking-wider mb-1">Période</div>
                            <div className="text-white font-bold">
                              {new Date(selectedStartDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              {selectedEndDate !== selectedStartDate && (
                                <> → {new Date(selectedEndDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</>
                              )}
                            </div>
                          </div>
                          <div className="bg-[#33ffcc] rounded-xl px-3 py-2 text-center">
                            <div className="text-2xl font-black text-[#000033]">{getSelectedDays()}</div>
                            <div className="text-[10px] font-bold text-[#000033]/70 uppercase">jour{getSelectedDays() > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Calendrier */}
                    <AvailabilityCalendar
                      productId={product.id}
                      onDateSelect={handleDateSelect}
                      onClearSelection={handleClearSelection}
                      selectedStartDate={selectedStartDate}
                      selectedEndDate={selectedEndDate}
                    />
                  </div>

                  {/* Calculateur de prix */}
                  {selectedStartDate && selectedEndDate && (
                    <div className="pt-4 border-t border-white/10">
                      <PriceCalculator
                        product={product}
                        startDate={selectedStartDate}
                        endDate={selectedEndDate}
                        quantity={quantity}
                        onPriceChange={handlePriceChange}
                      />
                    </div>
                  )}

                  {/* Message d'erreur */}
                  {availabilityError && (
                    <div className="p-4 bg-[#fe1979]/20 border border-[#fe1979]/50 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#fe1979] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[#fe1979] font-medium">{availabilityError}</p>
                    </div>
                  )}

                  {/* Bouton Réserver */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !selectedStartDate || !selectedEndDate}
                    className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-[#33ffcc] text-[#000033] rounded-2xl hover:bg-[#66cccc] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-black text-lg shadow-lg shadow-[#33ffcc]/30"
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#000033] border-t-transparent rounded-full animate-spin"></div>
                        Ajout en cours...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        {priceCalculation ? `Réserver • ${formatPrice(priceCalculation.total)}` : 'Ajouter au panier'}
                      </>
                    )}
                  </button>

                  {/* Trust badges */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                      <Shield className="w-4 h-4 text-[#33ffcc]" />
                      <span className="text-xs text-white/70">Paiement sécurisé</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                      <Award className="w-4 h-4 text-[#33ffcc]" />
                      <span className="text-xs text-white/70">Qualité garantie</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                      <MessageCircle className="w-4 h-4 text-[#33ffcc]" />
                      <span className="text-xs text-white/70">Support 7j/7</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                      <Clock className="w-4 h-4 text-[#33ffcc]" />
                      <span className="text-xs text-white/70">Annulation 48h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick specs desktop */}
              <div className="hidden lg:block bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#33ffcc]" />
                  En un coup d'œil
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#33ffcc]/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#33ffcc]" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-white">{product.specifications.players.min}-{product.specifications.players.max}</div>
                      <div className="text-xs text-white/50">Joueurs</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#66cccc]/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#66cccc]" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-white">{product.specifications.setup_time}</div>
                      <div className="text-xs text-white/50">Min setup</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Thumbnails in lightbox */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-[#33ffcc] w-6' : 'bg-white/50 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
    </>
  );
}
