import { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductsService } from '../services';

/**
 * Hook pour la recherche de produits via Supabase
 * Retourne les suggestions et l'état de chargement
 */
export function useProductSearch(debouncedQuery: string) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const search = async () => {
      setIsSearching(true);
      try {
        const results = await ProductsService.searchProducts(debouncedQuery, 5);
        if (!cancelled) setSuggestions(results);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };
    search();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return { suggestions, isSearching };
}
