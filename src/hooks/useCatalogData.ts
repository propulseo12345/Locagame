import { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { CategoriesService } from '../services';
import { supabase } from '../lib/supabase';

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
          console.error('Supabase non configure! Verifiez votre fichier .env');
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
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (productsError) {
          console.error('Erreur lors du chargement des produits:', productsError);

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
      } catch (err: any) {
        if (attempt < 1 && !cancelled) {
          await new Promise(r => setTimeout(r, 1500));
          if (!cancelled) return loadData(attempt + 1);
        }
        if (!cancelled) {
          console.error('[CatalogPage] Erreur chargement:', err);
          setError(err?.message || 'Impossible de charger le catalogue');
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
function mapProducts(productsData: any[]): Product[] {
  return productsData.map((p: any) => {
    let pricing = { oneDay: 0, weekend: 0, week: 0, custom: 0 };
    if (p.pricing && typeof p.pricing === 'object') {
      pricing = {
        oneDay: p.pricing.oneDay || p.pricing.one_day || 0,
        weekend: p.pricing.weekend || 0,
        week: p.pricing.week || 0,
        custom: p.pricing.custom || 0,
      };
    }

    let specifications = {
      dimensions: '',
      weight: 0,
      players: { min: 1, max: 10 },
      electricity: false,
      setup_time: 0,
    };
    if (p.specifications && typeof p.specifications === 'object') {
      specifications = {
        dimensions: p.specifications.dimensions || '',
        weight: p.specifications.weight || 0,
        players: p.specifications.players || { min: 1, max: 10 },
        electricity: p.specifications.electricity || false,
        setup_time: p.specifications.setup_time || p.specifications.setupTime || 0,
      };
    }

    return {
      ...p,
      pricing,
      specifications,
      images: Array.isArray(p.images) ? p.images : [],
      total_stock: p.total_stock || 0,
      is_active: p.is_active !== undefined ? p.is_active : true,
      description: p.description || '',
    };
  }) as Product[];
}
