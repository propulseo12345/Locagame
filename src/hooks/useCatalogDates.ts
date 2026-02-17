import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useDebounce } from './useDebounce';
import { getUnavailableProductIds } from '../utils/availability';

interface UseCatalogDatesReturn {
  startDate: string;
  endDate: string;
  unavailableProductIds: Set<string>;
  checkingAvailability: boolean;
  availabilityError: string | null;
  handleStartDateChange: (value: string) => void;
  handleEndDateChange: (value: string) => void;
  clearDates: () => void;
  getTodayString: () => string;
}

/**
 * Hook for catalog date management: local state, URL sync,
 * CartContext sync, and async availability checking.
 */
export function useCatalogDates(products: Product[]): UseCatalogDatesReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rentalDateRange, setRentalDateRange } = useCart();

  const [startDate, setStartDateLocal] = useState<string>('');
  const [endDate, setEndDateLocal] = useState<string>('');

  // Availability state
  const [unavailableProductIds, setUnavailableProductIds] = useState<Set<string>>(new Set());
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const debouncedStartDate = useDebounce(startDate, 300);
  const debouncedEndDate = useDebounce(endDate, 300);

  const getTodayString = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const validateAndCorrectDates = useCallback((from: string, to: string): { from: string; to: string } => {
    if (!from && to) return { from: to, to };
    if (from && to && to < from) return { from, to: from };
    return { from, to };
  }, []);

  const updateDates = useCallback(
    (newFrom: string, newTo: string, options?: { skipUrlUpdate?: boolean }) => {
      const corrected = validateAndCorrectDates(newFrom, newTo);

      setStartDateLocal(corrected.from);
      setEndDateLocal(corrected.to);

      // Sync with CartContext
      if (corrected.from && corrected.to) {
        setRentalDateRange({ from: corrected.from, to: corrected.to });
      } else if (!corrected.from && !corrected.to) {
        setRentalDateRange(null);
      }

      // Sync with URL (replace, no history push)
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
    },
    [searchParams, setSearchParams, setRentalDateRange, validateAndCorrectDates]
  );

  const handleStartDateChange = useCallback(
    (value: string) => {
      if (!value) {
        updateDates('', '');
      } else {
        const newTo = endDate && endDate >= value ? endDate : '';
        updateDates(value, newTo);
      }
    },
    [endDate, updateDates]
  );

  const handleEndDateChange = useCallback(
    (value: string) => {
      if (!value) {
        updateDates(startDate, '');
      } else if (!startDate) {
        updateDates(value, value);
      } else {
        updateDates(startDate, value);
      }
    },
    [startDate, updateDates]
  );

  const clearDates = useCallback(() => {
    updateDates('', '');
  }, [updateDates]);

  // Initialize dates from URL or CartContext on mount
  useEffect(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (fromParam || toParam) {
      const from = fromParam || '';
      const to = toParam || fromParam || '';
      updateDates(from, to, { skipUrlUpdate: true });
    } else if (rentalDateRange) {
      setStartDateLocal(rentalDateRange.from);
      setEndDateLocal(rentalDateRange.to);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('from', rentalDateRange.from);
      newParams.set('to', rentalDateRange.to);
      setSearchParams(newParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check availability when debounced dates change
  useEffect(() => {
    if (!debouncedStartDate || !debouncedEndDate || products.length === 0) {
      setUnavailableProductIds(new Set());
      setCheckingAvailability(false);
      setAvailabilityError(null);
      return;
    }

    let cancelled = false;

    const checkAvailabilities = async () => {
      setCheckingAvailability(true);
      setAvailabilityError(null);

      try {
        const result = await getUnavailableProductIds(products, debouncedStartDate, debouncedEndDate);

        if (!cancelled) {
          setUnavailableProductIds(result.unavailableIds);
          if (result.hasError) {
            setAvailabilityError(
              result.errorMessage || 'Impossible de verifier la disponibilite. Contactez-nous via le formulaire de contact.'
            );
          }
        }
      } catch (error) {
        console.error('Error checking availabilities:', error);
        if (!cancelled) {
          setUnavailableProductIds(new Set());
          setAvailabilityError('Impossible de verifier la disponibilite. Contactez-nous via le formulaire de contact.');
        }
      } finally {
        if (!cancelled) {
          setCheckingAvailability(false);
        }
      }
    };

    checkAvailabilities();

    return () => {
      cancelled = true;
    };
  }, [products, debouncedStartDate, debouncedEndDate]);

  return {
    startDate,
    endDate,
    unavailableProductIds,
    checkingAvailability,
    availabilityError,
    handleStartDateChange,
    handleEndDateChange,
    clearDates,
    getTodayString,
  };
}
