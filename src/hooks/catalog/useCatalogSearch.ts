import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Category } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useDebounce } from '../useDebounce';
import { CATEGORY_SLUG_MAP, getCategorySlug } from '../../constants/categorySlugMap';

interface UseCatalogSearchOptions {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  productsRef: React.RefObject<HTMLDivElement | null>;
}

interface UseCatalogSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  startDate: string;
  endDate: string;
  debouncedStartDate: string;
  debouncedEndDate: string;
  handleStartDateChange: (value: string) => void;
  handleEndDateChange: (value: string) => void;
  clearDates: () => void;
  handleSearchSubmit: (e?: FormEvent) => void;
  getTodayString: () => string;
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

export function useCatalogSearch({
  categories,
  selectedCategory,
  setSelectedCategory,
  productsRef,
}: UseCatalogSearchOptions): UseCatalogSearchReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rentalDateRange, setRentalDateRange } = useCart();

  const [searchTerm, setSearchTerm] = useState('');

  // Dates locales (synchronisees avec URL et CartContext)
  const [startDate, setStartDateLocal] = useState<string>('');
  const [endDate, setEndDateLocal] = useState<string>('');

  const hasScrolledToCategory = useRef(false);
  const isInitialMount = useRef(true);

  // Debounce les dates pour eviter trop de requetes
  const debouncedStartDate = useDebounce(startDate, 300);
  const debouncedEndDate = useDebounce(endDate, 300);

  // Helper pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayString = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Valider et corriger les dates
  const validateAndCorrectDates = useCallback((from: string, to: string): { from: string; to: string } => {
    if (!from && to) {
      // Si to est choisi sans from, mettre from = to
      return { from: to, to };
    }
    if (from && to && to < from) {
      // Si to < from, corriger to = from
      return { from, to: from };
    }
    return { from, to };
  }, []);

  // Mettre a jour les dates avec synchronisation URL + Context
  const updateDates = useCallback((newFrom: string, newTo: string, options?: { skipUrlUpdate?: boolean }) => {
    const corrected = validateAndCorrectDates(newFrom, newTo);

    setStartDateLocal(corrected.from);
    setEndDateLocal(corrected.to);

    // Mettre a jour le CartContext
    if (corrected.from && corrected.to) {
      setRentalDateRange({ from: corrected.from, to: corrected.to });
    } else if (!corrected.from && !corrected.to) {
      setRentalDateRange(null);
    }

    // Mettre a jour l'URL (sans empiler l'historique)
    if (!options?.skipUrlUpdate) {
      const newParams = new URLSearchParams(searchParams);
      if (corrected.from) {
        newParams.set('from', corrected.from);
      } else {
        newParams.delete('from');
      }
      if (corrected.to) {
        newParams.set('to', corrected.to);
      } else {
        newParams.delete('to');
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, setRentalDateRange, validateAndCorrectDates]);

  // Handler pour le changement de date de debut
  const handleStartDateChange = useCallback((value: string) => {
    if (!value) {
      // Si on efface from, effacer aussi to
      updateDates('', '');
    } else {
      // Garder to si valide, sinon vider
      const newTo = endDate && endDate >= value ? endDate : '';
      updateDates(value, newTo);
    }
  }, [endDate, updateDates]);

  // Handler pour le changement de date de fin
  const handleEndDateChange = useCallback((value: string) => {
    if (!value) {
      updateDates(startDate, '');
    } else if (!startDate) {
      // Si pas de from, mettre from = to
      updateDates(value, value);
    } else {
      updateDates(startDate, value);
    }
  }, [startDate, updateDates]);

  // Effacer les dates
  const clearDates = useCallback(() => {
    updateDates('', '');
  }, [updateDates]);

  // Lire les parametres d'URL au chargement initial
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const searchQuery = searchParams.get('search');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (searchQuery) {
      setSearchTerm(searchQuery);
    }

    // Initialiser les dates depuis l'URL ou le CartContext
    if (fromParam || toParam) {
      // Priorite aux params URL
      const from = fromParam || '';
      const to = toParam || fromParam || ''; // Si pas de to, utiliser from
      updateDates(from, to, { skipUrlUpdate: true });
    } else if (rentalDateRange) {
      // Sinon utiliser le CartContext (restauration depuis localStorage)
      setStartDateLocal(rentalDateRange.from);
      setEndDateLocal(rentalDateRange.to);
      // Mettre a jour l'URL
      const newParams = new URLSearchParams(searchParams);
      newParams.set('from', rentalDateRange.from);
      newParams.set('to', rentalDateRange.to);
      setSearchParams(newParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handler pour soumettre la recherche (bouton ou Entree) - synchronise l'URL
  const handleSearchSubmit = useCallback((e?: FormEvent) => {
    if (e) e.preventDefault();

    // Mettre a jour l'URL avec tous les parametres actuels
    const newParams = new URLSearchParams();
    if (searchTerm.trim()) {
      newParams.set('search', searchTerm.trim());
    }
    if (startDate) {
      newParams.set('from', startDate);
    }
    if (endDate) {
      newParams.set('to', endDate);
    }
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        newParams.set('category', getCategorySlug(category.name));
      }
    }

    setSearchParams(newParams, { replace: true });

    // Scroller vers les resultats
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [searchTerm, startDate, endDate, selectedCategory, categories, setSearchParams, productsRef]);

  // Appliquer la categorie depuis l'URL une fois les categories chargees
  useEffect(() => {
    const categorySlug = searchParams.get('category');

    if (categorySlug && categories.length > 0 && !hasScrolledToCategory.current) {
      const categoryName = CATEGORY_SLUG_MAP[categorySlug];

      if (categoryName) {
        // Trouver la categorie par son nom
        const category = categories.find(
          c => c.name.toLowerCase() === categoryName.toLowerCase()
        );

        if (category) {
          setSelectedCategory(category.id);
          hasScrolledToCategory.current = true;

          // Scroller vers la section produits apres un court delai
          setTimeout(() => {
            productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      }
    }
  }, [categories, searchParams, setSelectedCategory, productsRef]);

  return {
    searchTerm,
    setSearchTerm,
    startDate,
    endDate,
    debouncedStartDate,
    debouncedEndDate,
    handleStartDateChange,
    handleEndDateChange,
    clearDates,
    handleSearchSubmit,
    getTodayString,
    searchParams,
    setSearchParams,
  };
}
