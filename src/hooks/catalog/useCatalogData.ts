import { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '../../types';
import { CategoriesService } from '../../services';
import { supabase } from '../../lib/supabase';

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

        // Verifier si Supabase est configure
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey ||
            supabaseUrl === 'https://placeholder.supabase.co' ||
            supabaseKey === 'placeholder-anon-key') {
          console.error('❌ Supabase non configuré! Vérifiez votre fichier .env');
          console.error('Variables requises: VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
          setError('Supabase non configuré. Veuillez créer un fichier .env avec vos identifiants Supabase.');
          setProducts([]);
          setCategories([]);
          return;
        }

        setError(null);

        // Recuperer TOUS les produits actifs pour le catalogue
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (productsError) {
          console.error('❌ Erreur lors du chargement des produits:', productsError);
          console.error('Détails:', {
            message: productsError.message,
            code: productsError.code,
            details: productsError.details,
            hint: productsError.hint
          });

          // Si c'est une erreur de permission (RLS), afficher un message specifique
          if (productsError.code === 'PGRST301' || productsError.message?.includes('permission')) {
            console.error('💡 Problème de permissions RLS. Vérifiez les politiques de sécurité dans Supabase.');
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

        // Mapper les produits pour s'assurer qu'ils ont la bonne structure
        const mappedProducts = (productsData || []).map((p: any) => {
          // Gerer le pricing qui peut etre un JSONB
          let pricing = { oneDay: 0, weekend: 0, week: 0, custom: 0 };
          if (p.pricing) {
            if (typeof p.pricing === 'object') {
              pricing = {
                oneDay: p.pricing.oneDay || p.pricing.one_day || 0,
                weekend: p.pricing.weekend || 0,
                week: p.pricing.week || 0,
                custom: p.pricing.custom || 0
              };
            }
          }

          // Gerer les specifications qui peuvent etre un JSONB
          let specifications = {
            dimensions: '',
            weight: 0,
            players: { min: 1, max: 10 },
            electricity: false,
            setup_time: 0
          };
          if (p.specifications) {
            if (typeof p.specifications === 'object') {
              specifications = {
                dimensions: p.specifications.dimensions || '',
                weight: p.specifications.weight || 0,
                players: p.specifications.players || { min: 1, max: 10 },
                electricity: p.specifications.electricity || false,
                setup_time: p.specifications.setup_time || p.specifications.setupTime || 0
              };
            }
          }

          return {
            ...p,
            pricing,
            specifications,
            images: Array.isArray(p.images) ? p.images : [],
            total_stock: p.total_stock || 0,
            is_active: p.is_active !== undefined ? p.is_active : true,
            description: p.description || ''
          };
        }) as Product[];

        setProducts(mappedProducts);
        setCategories(categoriesData);
      } catch (err: any) {
        console.error('[CatalogPage] Erreur chargement:', err);
        setError(err?.message || 'Impossible de charger le catalogue');
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

  // Grouper les produits par categorie avec compteurs
  const categoriesWithCount = useMemo(() => {
    return categories.map(category => ({
      ...category,
      productCount: products.filter(p => p.category_id === category.id).length
    }));
  }, [categories, products]);

  return {
    products,
    categories,
    loading,
    error,
    categoriesWithCount,
  };
}
