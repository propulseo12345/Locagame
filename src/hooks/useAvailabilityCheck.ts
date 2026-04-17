import { useState, useEffect, useRef } from 'react';
import { checkAvailability, type AvailabilityResult } from '../utils/availability';

interface UseAvailabilityCheckOptions {
  productId: string | undefined;
  startDate: string;
  endDate: string;
  quantity: number;
}

interface UseAvailabilityCheckReturn {
  /** Vérification en cours */
  isChecking: boolean;
  /** null = pas encore vérifié (dates non sélectionnées) */
  isAvailable: boolean | null;
  /** Résultat complet de la dernière vérification */
  result: AvailabilityResult | null;
}

/**
 * Vérifie la disponibilité d'un produit en temps réel
 * quand les deux dates sont sélectionnées.
 *
 * - Se déclenche uniquement quand les deux dates sont définies
 * - Debounce 300ms pour éviter les appels multiples
 * - Annule la vérification précédente si les dates changent
 */
export function useAvailabilityCheck({
  productId,
  startDate,
  endDate,
  quantity,
}: UseAvailabilityCheckOptions): UseAvailabilityCheckReturn {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const abortRef = useRef(0);

  useEffect(() => {
    // Reset si dates incomplètes
    if (!productId || !startDate || !endDate) {
      setIsAvailable(null);
      setResult(null);
      setIsChecking(false);
      return;
    }

    // Debounce 300ms
    const callId = ++abortRef.current;
    setIsChecking(true);

    const timer = setTimeout(async () => {
      try {
        const res = await checkAvailability(productId, startDate, endDate, quantity);
        // Ignorer si une vérification plus récente a été lancée
        if (callId !== abortRef.current) return;
        setResult(res);
        setIsAvailable(res.available);
      } catch {
        if (callId !== abortRef.current) return;
        setIsAvailable(false);
        setResult({
          available: false,
          availableQuantity: 0,
          conflictingDates: [],
          error: 'Impossible de vérifier la disponibilité. Veuillez réessayer.',
        });
      } finally {
        if (callId === abortRef.current) {
          setIsChecking(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [productId, startDate, endDate, quantity]);

  return { isChecking, isAvailable, result };
}
