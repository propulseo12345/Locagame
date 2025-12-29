import { useState, useMemo, useCallback, useEffect } from 'react';
import { Product, Category, FilterOptions } from '../types';
import { checkAvailability } from '../utils/availability';

interface CatalogFiltersState {
  filters: FilterOptions;
  searchTerm: string;
  selectedCategory: string | null;
  startDate: string;
  endDate: string;
  viewMode: 'grid' | 'list';
  currentPage: number;
}

interface UseCatalogFiltersOptions {
  products: Product[];
  categories: Category[];
  itemsPerPage?: number;
}

interface UseCatalogFiltersReturn {
  // State
  filters: FilterOptions;
  searchTerm: string;
  selectedCategory: string | null;
  startDate: string;
  endDate: string;
  viewMode: 'grid' | 'list';
  currentPage: number;

  // Computed
  filteredProducts: Product[];
  paginatedProducts: Product[];
  totalPages: number;
  activeFiltersCount: number;
  categoriesWithCount: (Category & { productCount: number })[];

  // Actions
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setCurrentPage: (page: number) => void;
  handleFilterChange: (key: keyof FilterOptions, value: FilterOptions[keyof FilterOptions]) => void;
  clearFilters: () => void;
  clearDates: () => void;
}

export function useCatalogFilters({
  products,
  categories,
  itemsPerPage = 12
}: UseCatalogFiltersOptions): UseCatalogFiltersReturn {
  const [state, setState] = useState<CatalogFiltersState>({
    filters: {},
    searchTerm: '',
    selectedCategory: null,
    startDate: '',
    endDate: '',
    viewMode: 'grid',
    currentPage: 1
  });

  // Categories with product count
  const categoriesWithCount = useMemo(() => {
    return categories.map(category => ({
      ...category,
      productCount: products.filter(p => p.category_id === category.id).length
    }));
  }, [categories, products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by selected category
    if (state.selectedCategory) {
      filtered = filtered.filter(product => product.category_id === state.selectedCategory);
    }

    // Filter by search term
    if (state.searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    // Filter by category (from sidebar filters)
    if (state.filters.category) {
      filtered = filtered.filter(product => product.category_id === state.filters.category);
    }

    // Filter by price
    if (state.filters.price_min !== undefined) {
      filtered = filtered.filter(product => product.pricing.oneDay >= state.filters.price_min!);
    }
    if (state.filters.price_max !== undefined) {
      filtered = filtered.filter(product => product.pricing.oneDay <= state.filters.price_max!);
    }

    // Filter by players
    if (state.filters.players_min !== undefined) {
      filtered = filtered.filter(product => product.specifications.players.max >= state.filters.players_min!);
    }
    if (state.filters.players_max !== undefined) {
      filtered = filtered.filter(product => product.specifications.players.min <= state.filters.players_max!);
    }

    // Filter by availability dates
    if (state.startDate) {
      const endDateToUse = state.endDate || state.startDate;
      filtered = filtered.filter(product => {
        const availability = checkAvailability(product.id, state.startDate, endDateToUse, 1);
        return availability.available;
      });
    }

    // Sort
    switch (state.filters.sort_by) {
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
        if (state.searchTerm) {
          filtered.sort((a, b) => {
            const aRelevance = a.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ? 2 : 1;
            const bRelevance = b.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ? 2 : 1;
            return bRelevance - aRelevance;
          });
        }
    }

    return filtered;
  }, [products, state.filters, state.searchTerm, state.selectedCategory, state.startDate, state.endDate]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (state.currentPage - 1) * itemsPerPage,
      state.currentPage * itemsPerPage
    );
  }, [filteredProducts, state.currentPage, itemsPerPage]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(state.filters).filter(Boolean).length +
      (state.searchTerm ? 1 : 0) +
      (state.selectedCategory ? 1 : 0) +
      (state.startDate ? 1 : 0);
  }, [state.filters, state.searchTerm, state.selectedCategory, state.startDate]);

  // Reset page when filters change
  useEffect(() => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, [state.filters, state.searchTerm, state.selectedCategory, state.startDate, state.endDate]);

  // Actions
  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setSelectedCategory = useCallback((categoryId: string | null) => {
    setState(prev => ({ ...prev, selectedCategory: categoryId }));
  }, []);

  const setStartDate = useCallback((date: string) => {
    setState(prev => ({ ...prev, startDate: date }));
  }, []);

  const setEndDate = useCallback((date: string) => {
    setState(prev => ({ ...prev, endDate: date }));
  }, []);

  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterOptions, value: FilterOptions[keyof FilterOptions]) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      searchTerm: '',
      selectedCategory: null,
      startDate: '',
      endDate: ''
    }));
  }, []);

  const clearDates = useCallback(() => {
    setState(prev => ({ ...prev, startDate: '', endDate: '' }));
  }, []);

  return {
    // State
    filters: state.filters,
    searchTerm: state.searchTerm,
    selectedCategory: state.selectedCategory,
    startDate: state.startDate,
    endDate: state.endDate,
    viewMode: state.viewMode,
    currentPage: state.currentPage,

    // Computed
    filteredProducts,
    paginatedProducts,
    totalPages,
    activeFiltersCount,
    categoriesWithCount,

    // Actions
    setSearchTerm,
    setSelectedCategory,
    setStartDate,
    setEndDate,
    setViewMode,
    setCurrentPage,
    handleFilterChange,
    clearFilters,
    clearDates
  };
}
