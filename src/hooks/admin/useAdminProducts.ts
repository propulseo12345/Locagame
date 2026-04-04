import { useState, useEffect, useCallback } from 'react';
import { ProductsService, CategoriesService } from '../../services';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';

const PAGE_SIZE = 20;

interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  totalStock: number;
}

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<ProductStats>({ total: 0, active: 0, inactive: 0, totalStock: 0 });
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('products')
        .select('*, category:categories!products_category_id_fkey(*), product_categories(category_id, categories(id, name, slug))', { count: 'exact' })
        .order('name', { ascending: true });

      // Filtres côté serveur
      if (statusFilter === 'active') query = query.eq('is_active', true);
      else if (statusFilter === 'inactive') query = query.eq('is_active', false);

      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm.trim()}%`);
      }

      // Pagination
      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      const { data: productsData, error: productsError, count } = await query;

      if (productsError) throw productsError;

      // Global stats (independent of filters/pagination)
      const [categoriesData, { count: totalAll }, { count: totalActive }, stockResult] = await Promise.all([
        CategoriesService.getCategories(),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('total_stock'),
      ]);

      const totalStock = (stockResult.data || []).reduce((sum: number, p: { total_stock: number | null }) => sum + (p.total_stock || 0), 0);
      setStats({
        total: totalAll || 0,
        active: totalActive || 0,
        inactive: (totalAll || 0) - (totalActive || 0),
        totalStock,
      });

      setProducts(productsData as Product[]);
      setTotalCount(count || 0);
      setCategories(categoriesData);
    } catch (error) {
      logger.error('Error loading data', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  const setSearchTermAndReset = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(0);
  }, []);

  const setStatusFilterAndReset = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(0);
  }, []);

  const setCategoryFilterAndReset = useCallback((value: string) => {
    setCategoryFilter(value);
    setPage(0);
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // With server-side filtering, filteredProducts = products (already filtered by query)
  const filteredProducts = products;

  const handleDelete = async (productId: string) => {
    try {
      await ProductsService.deleteProduct(productId);
      await loadData();
      setShowDeleteConfirm(null);
    } catch (error) {
      logger.error('Error deleting product', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const XLSX = await import('xlsx');
      const allProducts = await ProductsService.getAllProductsForExport();

      const rows = allProducts.map((p) => ({
        name: p.name || '',
        slug: p.slug || '',
        category_id: p.category?.slug || '',
        description: p.description || '',
        price_one_day: p.pricing?.oneDay || 0,
        price_weekend: p.pricing?.weekend || 0,
        price_week: p.pricing?.week || 0,
        total_stock: p.total_stock || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Produits');

      ws['!cols'] = [
        { wch: 40 }, { wch: 40 }, { wch: 20 }, { wch: 50 },
        { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
      ];

      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `locagame_products_export_${today}.xlsx`);
    } catch (error) {
      logger.error('Export error', error);
      alert("Erreur lors de l'export des produits.");
    } finally {
      setExporting(false);
    }
  };

  return {
    products,
    categories,
    loading,
    searchTerm,
    setSearchTerm: setSearchTermAndReset,
    statusFilter,
    setStatusFilter: setStatusFilterAndReset,
    categoryFilter,
    setCategoryFilter: setCategoryFilterAndReset,
    filteredProducts,
    handleDelete,
    handleExport,
    exporting,
    loadData,
    showDeleteConfirm,
    setShowDeleteConfirm,
    // Pagination
    page,
    setPage,
    totalPages,
    totalCount,
    stats,
  };
}
