import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, PriceCalculation } from '../types';
import { ProductsService, CategoriesService } from '../services';
import { checkAvailability } from '../utils/availability';
import { calculateLocagameDays } from '../utils/pricing';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAvailabilityCheck } from './useAvailabilityCheck';
import { logger } from '../lib/logger';
import { AnalyticsService } from '../services/analytics.service';

export interface UseProductPageReturn {
  // Data
  product: Product | null;
  category: string;
  loading: boolean;
  // Image state
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  // Favorite
  isLiked: boolean;
  handleLike: () => void;
  // Share
  handleShare: () => Promise<void>;
  // Dates
  selectedStartDate: string;
  selectedEndDate: string;
  handleDateSelect: (startDate: string, endDate: string) => void;
  handleClearSelection: () => void;
  getSelectedDays: () => number;
  // Pricing
  priceCalculation: PriceCalculation | null;
  handlePriceChange: (calculation: PriceCalculation) => void;
  // Cart
  canAddToCart: boolean;
  isAddingToCart: boolean;
  handleAddToCart: () => Promise<void>;
  availabilityError: string;
  // Availability (real-time)
  isCheckingAvailability: boolean;
  isAvailable: boolean | null;
  // Tabs
  activeTab: 'description' | 'includes' | 'specs';
  setActiveTab: (tab: 'description' | 'includes' | 'specs') => void;
  // Quantity
  quantity: number;
}

export function useProductPage(): UseProductPageReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, rentalDateRange } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<string>(rentalDateRange?.from || '');
  const [selectedEndDate, setSelectedEndDate] = useState<string>(rentalDateRange?.to || '');
  const [quantity] = useState(1);
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'includes' | 'specs'>('description');

  // Vérification de disponibilité en temps réel
  const {
    isChecking: isCheckingAvailability,
    isAvailable,
    result: availabilityResult,
  } = useAvailabilityCheck({
    productId: product?.id,
    startDate: selectedStartDate,
    endDate: selectedEndDate,
    quantity,
  });

  // Synchroniser l'erreur de disponibilité avec le résultat du hook
  useEffect(() => {
    if (availabilityResult && !availabilityResult.available) {
      const msg = availabilityResult.error
        || 'Ce produit n\'est pas disponible pour les dates sélectionnées. Essayez d\'autres dates.';
      setAvailabilityError(msg);
    } else if (availabilityResult?.available) {
      setAvailabilityError('');
    }
  }, [availabilityResult]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // UUID pattern: try by ID first, otherwise by slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let foundProduct = isUUID
          ? await ProductsService.getProductById(id)
          : await ProductsService.getProductBySlug(id);
        // Fallback: if slug lookup failed, try by ID (and vice versa)
        if (!foundProduct) {
          foundProduct = isUUID
            ? await ProductsService.getProductBySlug(id)
            : await ProductsService.getProductById(id).catch(() => null);
        }
        if (foundProduct) {
          setProduct(foundProduct);
          let categoryName = '';
          if (foundProduct.category_id) {
            const foundCategory = await CategoriesService.getCategoryById(foundProduct.category_id);
            if (foundCategory) {
              categoryName = foundCategory.name;
              setCategory(categoryName);
            }
          }
          AnalyticsService.viewItem(foundProduct, categoryName || undefined);
        }
      } catch (error) {
        logger.error('Error loading product', error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

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

  const canAddToCart = !!(product && product.pricing?.oneDay > 0);

  const handleAddToCart = async () => {
    if (!product || !selectedStartDate || !selectedEndDate) {
      setAvailabilityError('Veuillez s\u00e9lectionner vos dates de location');
      return;
    }

    if (!canAddToCart) {
      setAvailabilityError('Ce produit n\'est pas disponible \u00e0 la location');
      return;
    }

    if (!priceCalculation) {
      setAvailabilityError('Calcul du prix en cours, veuillez patienter');
      return;
    }

    try {
      setIsAddingToCart(true);
      const availability = await checkAvailability(product.id, selectedStartDate, selectedEndDate, quantity);

      if (!availability.available) {
        const errorMsg = availability.error
          ? availability.error
          : 'Ce produit n\'est pas disponible pour les dates s\u00e9lectionn\u00e9es';
        setAvailabilityError(errorMsg);
        setIsAddingToCart(false);
        return;
      }

      addItem({
        product,
        start_date: selectedStartDate,
        end_date: selectedEndDate,
        quantity,
        delivery_mode: priceCalculation.delivery_mode || 'pickup',
        delivery_address: priceCalculation.delivery_address,
        delivery_city: priceCalculation.delivery_city,
        delivery_postal_code: priceCalculation.delivery_postal_code,
        delivery_distance: priceCalculation.delivery_distance,
        delivery_fee: priceCalculation.delivery_fee,
        product_price: priceCalculation.product_price,
        total_price: priceCalculation.total,
      });

      AnalyticsService.addToCart(product, quantity, priceCalculation.product_price);

      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/panier');
    } catch (error) {
      logger.error('Error checking availability', error);
      setAvailabilityError('Impossible de v\u00e9rifier la disponibilit\u00e9. Contactez-nous via le formulaire de contact.');
      setIsAddingToCart(false);
    }
  };

  const isLiked = product ? isFavorite(product.id) : false;

  const handleLike = () => {
    if (!product) return;
    toggleFavorite(product.id);
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
        logger.error('Error sharing', error);
      }
    }
  };

  const getSelectedDays = () => {
    if (selectedStartDate && selectedEndDate) {
      return calculateLocagameDays(selectedStartDate, selectedEndDate);
    }
    return 0;
  };

  return {
    product,
    category,
    loading,
    currentImageIndex,
    setCurrentImageIndex,
    isLiked,
    handleLike,
    handleShare,
    selectedStartDate,
    selectedEndDate,
    handleDateSelect,
    handleClearSelection,
    getSelectedDays,
    priceCalculation,
    handlePriceChange,
    canAddToCart,
    isAddingToCart,
    handleAddToCart,
    availabilityError,
    isCheckingAvailability,
    isAvailable,
    activeTab,
    setActiveTab,
    quantity,
  };
}
