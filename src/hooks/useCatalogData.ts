import { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { CategoriesService } from '../services';
import { normalizeProduct } from '../services/products.normalizers';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface UseCatalogDataReturn {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to load products and categories from Supabase with realtime sync.
 */
export function useCatalogData(): UseCatalogDataReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async (attempt = 0) => {
      try {
        if (attempt === 0) setLoading(true);

        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (
          !supabaseUrl ||
          !supabaseKey ||
          supabaseUrl === 'https://placeholder.supabase.co' ||
          supabaseKey === 'placeholder-anon-key'
        ) {
          logger.error('Supabase non configure! Verifiez votre fichier .env');
          if (!cancelled) {
            setError('Supabase non configure. Veuillez creer un fichier .env avec vos identifiants Supabase.');
            setProducts([]);
            setCategories([]);
          }
          return;
        }

        if (!cancelled) setError(null);

        // Fetch all active products for catalog
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, category:categories!products_category_id_fkey(*)')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (productsError) {
          logger.error('Erreur lors du chargement des produits', productsError);

          // Retry once on error (possible stale auth token)
          if (attempt < 1 && !cancelled) {
            await new Promise(r => setTimeout(r, 1500));
            if (!cancelled) return loadData(attempt + 1);
          }

          if (!cancelled) {
            if (productsError.code === 'PGRST301' || productsError.message?.includes('permission')) {
              setError('Erreur de permissions. Verifiez les politiques RLS dans Supabase.');
            } else {
              setError(`Erreur lors du chargement: ${productsError.message}`);
            }
            setProducts([]);
            setCategories([]);
          }
          return;
        }

        // Retry once if products came back empty (possible stale auth token)
        if ((!productsData || productsData.length === 0) && attempt < 1 && !cancelled) {
          await new Promise(r => setTimeout(r, 1500));
          if (!cancelled) return loadData(attempt + 1);
        }

        const [categoriesData] = await Promise.all([CategoriesService.getCategories()]);

        if (!cancelled) {
          const mappedProducts = mapProducts(productsData || []);
          setProducts(mappedProducts);
          setCategories(categoriesData);
        }
      } catch (err: unknown) {
        if (attempt < 1 && !cancelled) {
          await new Promise(r => setTimeout(r, 1500));
          if (!cancelled) return loadData(attempt + 1);
        }
        if (!cancelled) {
          logger.error('[CatalogPage] Erreur chargement', err);
          setError(err instanceof Error ? err.message : 'Impossible de charger le catalogue');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    // Realtime sync with Supabase
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(productsChannel);
    };
  }, []);

  return { products, categories, loading, error };
}

/** Map raw Supabase data to typed Product objects */
function mapProducts(productsData: Array<Record<string, unknown> & { id: string; name: string }>): Product[] {
  return productsData.map((p) => normalizeProduct(p));
}
