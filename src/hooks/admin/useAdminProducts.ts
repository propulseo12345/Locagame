import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { ProductsService, CategoriesService } from '../../services';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
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
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('name', { ascending: true });

      if (productsError) throw productsError;

      const categoriesData = await CategoriesService.getCategories();
      setProducts(productsData as Product[]);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const productStatus = product.is_active ? 'active' : 'inactive';
    const matchesStatus = statusFilter === 'all' || productStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = async (productId: string) => {
    try {
      await ProductsService.deleteProduct(productId);
      await loadData();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const allProducts = await ProductsService.getAllProductsForExport();

      const rows = allProducts.map((p: any) => ({
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
      console.error('Export error:', error);
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
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    filteredProducts,
    handleDelete,
    handleExport,
    exporting,
    loadData,
    showDeleteConfirm,
    setShowDeleteConfirm,
  };
}
