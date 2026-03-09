import { useState, useEffect } from 'react';
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
  };
}
