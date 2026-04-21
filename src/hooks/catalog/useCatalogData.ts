import { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '../../types';
import { CategoriesService } from '../../services';
import { normalizeProduct } from '../../services/products.normalizers';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';

interface UseCatalogDataReturn {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  categoriesWithCount: (Category & { productCount: number })[];
}

export function useCatalogData(): UseCatalogDataReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les produits et categories depuis Supabase avec synchronisation temps reel
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
          logger.error('Supabase non configuré! Vérifiez votre fichier .env');
          logger.error('Variables requises: VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
          setError('Supabase non configuré. Veuillez créer un fichier .env avec vos identifiants Supabase.');
          setProducts([]);
          setCategories([]);
          return;
        }

        setError(null);

        // Recuperer TOUS les produits actifs pour le catalogue
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, category:categories!products_category_id_fkey(*)')
          .eq('is_active', true)
          .gt('total_stock', 0)
          .order('name', { ascending: true });

        if (productsError) {
          logger.error('Erreur lors du chargement des produits', productsError);
          logger.error('Détails', {
            message: productsError.message,
            code: productsError.code,
            details: productsError.details,
            hint: productsError.hint
          });

          // Si c'est une erreur de permission (RLS), afficher un message specifique
          if (productsError.code === 'PGRST301' || productsError.message?.includes('permission')) {
            logger.error('Problème de permissions RLS. Vérifiez les politiques de sécurité dans Supabase.');
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

        // Mapper les produits via normalizeProduct (logique centralisée)
        const mappedProducts = (productsData || []).map((p) =>
          normalizeProduct(p as unknown as Parameters<typeof normalizeProduct>[0])
        );

        setProducts(mappedProducts);
        setCategories(categoriesData);
      } catch (err: unknown) {
        logger.error('[CatalogPage] Erreur chargement', err);
        setError(err instanceof Error ? err.message : 'Impossible de charger le catalogue');
      } finally {
        setLoading(false);
      }
    };

    // Charger les donnees initiales
    loadData();

    // Synchronisation en temps reel avec Supabase Realtime
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
          // Recharger les produits en temps reel
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
    return categories
      .map(category => ({
        ...category,
        productCount: products.filter(p => p.category_id === category.id).length
      }))
      .filter(c => c.productCount > 0);
  }, [categories, products]);

  return {
    products,
    categories,
    loading,
    error,
    categoriesWithCount,
  };
}
