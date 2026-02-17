import { useMemo, useEffect, useState } from 'react';
import { Product, FilterOptions } from '../types';

interface UseCatalogFilteringOptions {
  products: Product[];
  filters: FilterOptions;
  searchTerm: string;
  selectedCategory: string | null;
  startDate: string;
  endDate: string;
  unavailableProductIds: Set<string>;
  itemsPerPage?: number;
}

interface UseCatalogFilteringReturn {
  filteredProducts: Product[];
  paginatedProducts: Product[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  activeFiltersCount: number;
}

/**
 * Hook for filtering, sorting, and paginating catalog products.
 */
export function useCatalogFiltering({
  products,
  filters,
  searchTerm,
  selectedCategory,
  startDate,
  endDate,
  unavailableProductIds,
  itemsPerPage = 12,
}: UseCatalogFilteringOptions): UseCatalogFilteringReturn {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term)
      );
    }
    if (filters.category) {
      filtered = filtered.filter(p => p.category_id === filters.category);
    }
    if (filters.price_min !== undefined) {
      filtered = filtered.filter(p => p.pricing.oneDay >= filters.price_min!);
    }
    if (filters.price_max !== undefined) {
      filtered = filtered.filter(p => p.pricing.oneDay <= filters.price_max!);
    }
    if (filters.players_min !== undefined) {
      filtered = filtered.filter(p => p.specifications.players.max >= filters.players_min!);
    }
    if (filters.players_max !== undefined) {
      filtered = filtered.filter(p => p.specifications.players.min <= filters.players_max!);
    }
    if (startDate && endDate && unavailableProductIds.size > 0) {
      filtered = filtered.filter(p => !unavailableProductIds.has(p.id));
    }

    switch (filters.sort_by) {
      case 'price_asc': filtered.sort((a, b) => a.pricing.oneDay - b.pricing.oneDay); break;
      case 'price_desc': filtered.sort((a, b) => b.pricing.oneDay - a.pricing.oneDay); break;
      case 'popularity': filtered.sort((a, b) => b.total_stock - a.total_stock); break;
      case 'newest': filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default:
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered.sort((a, b) => {
            const aR = a.name.toLowerCase().includes(term) ? 2 : 1;
            const bR = b.name.toLowerCase().includes(term) ? 2 : 1;
            return bR - aR;
          });
        }
    }
    return filtered;
  }, [products, filters, searchTerm, selectedCategory, startDate, endDate, unavailableProductIds]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [filters, searchTerm, selectedCategory, startDate, endDate]);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length
    + (searchTerm ? 1 : 0) + (selectedCategory ? 1 : 0) + (startDate ? 1 : 0);

  return { filteredProducts, paginatedProducts, totalPages, currentPage, setCurrentPage, activeFiltersCount };
}
