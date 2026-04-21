import { useState, useEffect, useCallback } from 'react';
import { Product, FilterOptions } from '../../types';

interface UseCatalogPaginationOptions {
  filteredProducts: Product[];
  itemsPerPage?: number;
  filters: FilterOptions;
  searchTerm: string;
  selectedCategory: string | null;
  startDate: string;
  endDate: string;
}

interface UseCatalogPaginationReturn {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  totalPages: number;
  paginatedProducts: Product[];
  /** Products accumulated up to currentPage (for "load more" mode) */
  loadMoreProducts: Product[];
  /** Load next page (appends to loadMoreProducts) */
  loadMore: () => void;
  /** Whether more pages are available */
  hasMore: boolean;
}

export function useCatalogPagination({
  filteredProducts,
  itemsPerPage = 12,
  filters,
  searchTerm,
  selectedCategory,
  startDate,
  endDate,
}: UseCatalogPaginationOptions): UseCatalogPaginationReturn {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Load more: all items from page 1 up to currentPage
  const loadMoreProducts = filteredProducts.slice(0, currentPage * itemsPerPage);
  const hasMore = currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (hasMore) setCurrentPage(p => p + 1);
  }, [hasMore]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, selectedCategory, startDate, endDate]);

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    paginatedProducts,
    loadMoreProducts,
    loadMore,
    hasMore,
  };
}
