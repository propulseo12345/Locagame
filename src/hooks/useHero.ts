import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoriesService } from '../services';
import { Category } from '../types';
import { useCart } from '../contexts/CartContext';
import { useDebounce } from './useDebounce';
import { useProductSearch } from './useProductSearch';
import { heroImages, calculateDays } from '../components/hero/constants';

export function useHero() {
  const navigate = useNavigate();
  const { rentalDateRange, setRentalDateRange } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(rentalDateRange?.from || '');
  const [endDate, setEndDate] = useState(rentalDateRange?.to || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputDesktopRef = useRef<HTMLDivElement>(null);
  const searchInputMobileRef = useRef<HTMLDivElement>(null);
  const dropdownPortalRef = useRef<HTMLDivElement>(null);

  // Détecter la taille de l'écran
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { suggestions, isSearching } = useProductSearch(debouncedQuery);

  const getTodayString = useCallback(() => new Date().toISOString().split('T')[0], []);

  // Diaporama
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Chargement catégories
  useEffect(() => {
    CategoriesService.getCategories()
      .then(setCategories)
      .catch((error) => console.error('Error loading categories:', error));
  }, []);

  useEffect(() => {
    setShowSuggestions(debouncedQuery.length >= 1 && isSearchFocused);
  }, [debouncedQuery, isSearchFocused]);

  // Click outside - exclure le dropdown portal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideSearchContainer = searchContainerRef.current?.contains(target);
      const isInsideDropdownPortal = dropdownPortalRef.current?.contains(target);

      if (!isInsideSearchContainer && !isInsideDropdownPortal) {
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

  const handleSelectProduct = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/produit/${productId}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleCategoryClick = (categorySlug: string) => {
    if (startDate && endDate) setRentalDateRange({ from: startDate, to: endDate });
    const params = new URLSearchParams();
    params.set('category', categorySlug);
    if (startDate) params.set('from', startDate);
    if (endDate) params.set('to', endDate);
    navigate(`/catalogue?${params.toString()}`);
  };

  const durationDays = startDate && endDate ? calculateDays(startDate, endDate) : 0;

  return {
    searchQuery,
    setSearchQuery,
    startDate,
    endDate,
    categories,
    showSuggestions,
    setShowSuggestions,
    currentImageIndex,
    isSearchFocused,
    setIsSearchFocused,
    isDesktop,
    isSearching,
    suggestions,
    durationDays,
    getTodayString,
    handleStartDateChange,
    handleEndDateChange,
    handleSearch,
    handleSelectProduct,
    handleCategoryClick,
    searchContainerRef,
    searchInputDesktopRef,
    searchInputMobileRef,
    dropdownPortalRef,
  };
}
