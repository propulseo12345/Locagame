import { useState, useEffect } from 'react';
import { Product } from '../../types';
import { getUnavailableProductIds } from '../../utils/availability';

interface UseCatalogAvailabilityOptions {
  products: Product[];
  debouncedStartDate: string;
  debouncedEndDate: string;
}

interface UseCatalogAvailabilityReturn {
  unavailableProductIds: Set<string>;
  checkingAvailability: boolean;
  availabilityError: string | null;
}

export function useCatalogAvailability({
  products,
  debouncedStartDate,
  debouncedEndDate,
}: UseCatalogAvailabilityOptions): UseCatalogAvailabilityReturn {
  const [unavailableProductIds, setUnavailableProductIds] = useState<Set<string>>(new Set());
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Verifier la disponibilite des produits quand les dates changent
  useEffect(() => {
    // Ne rien faire si pas de dates ou pas de produits
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
        const result = await getUnavailableProductIds(
          products,
          debouncedStartDate,
          debouncedEndDate
        );

        if (!cancelled) {
          setUnavailableProductIds(result.unavailableIds);
          // Afficher le message d'erreur si la verification a echoue
          if (result.hasError) {
            setAvailabilityError(result.errorMessage || 'Impossible de vérifier la disponibilité. Contactez-nous via le formulaire de contact.');
          }
        }
      } catch (error) {
        console.error('Error checking availabilities:', error);
        if (!cancelled) {
          setUnavailableProductIds(new Set());
          setAvailabilityError('Impossible de vérifier la disponibilité. Contactez-nous via le formulaire de contact.');
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
    unavailableProductIds,
    checkingAvailability,
    availabilityError,
  };
}
