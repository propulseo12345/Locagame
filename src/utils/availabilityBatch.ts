import { supabase } from '../lib/supabase';
import { Product } from '../types';

/** Résultat de vérification batch pour le catalogue */
export interface UnavailabilityResult {
  unavailableIds: Set<string>;
  /** Si true, une erreur s'est produite et les résultats ne sont pas fiables */
  hasError: boolean;
  errorMessage?: string;
}

/**
 * Récupère les IDs des produits indisponibles pour une période donnée.
 * Optimisé pour le filtrage du catalogue.
 *
 * SÉCURITÉ: En cas d'erreur, retourne hasError=true pour que l'UI puisse afficher un message
 *
 * @param products - Liste des produits à vérifier
 * @param startDate - Date de début (YYYY-MM-DD)
 * @param endDate - Date de fin (YYYY-MM-DD)
 * @returns Résultat avec Set des IDs indisponibles et indicateur d'erreur
 */
export async function getUnavailableProductIds(
  products: Product[],
  startDate: string,
  endDate: string
): Promise<UnavailabilityResult> {
  const unavailableIds = new Set<string>();

  if (!products.length || !startDate || !endDate) {
    return { unavailableIds, hasError: false };
  }

  try {
    // Récupérer toutes les indisponibilités qui chevauchent la période
    const { data: availabilities, error } = await supabase
      .from('product_availability')
      .select('product_id, start_date, end_date, quantity, status')
      .lte('start_date', endDate)
      .gte('end_date', startDate)
      .in('status', ['reserved', 'blocked', 'maintenance']);

    if (error) {
      console.error('Error fetching unavailabilities:', error);
      // SÉCURITÉ: Signaler l'erreur pour que l'UI affiche un message
      return {
        unavailableIds,
        hasError: true,
        errorMessage: 'Impossible de vérifier la disponibilité. Veuillez nous contacter.'
      };
    }

    if (!availabilities || availabilities.length === 0) {
      return { unavailableIds, hasError: false };
    }

    // Créer un map product_id -> stock total pour accès rapide
    const stockMap = new Map<string, number>();
    for (const product of products) {
      stockMap.set(product.id, product.total_stock || 0);
    }

    // Grouper les indisponibilités par produit
    const productAvailabilities = new Map<string, typeof availabilities>();
    for (const avail of availabilities) {
      const existing = productAvailabilities.get(avail.product_id) || [];
      existing.push(avail);
      productAvailabilities.set(avail.product_id, existing);
    }

    // Vérifier chaque produit concerné
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const [productId, avails] of productAvailabilities) {
      const totalStock = stockMap.get(productId) || 0;

      // Vérifier chaque jour de la période demandée
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        let reservedQuantity = 0;

        for (const avail of avails) {
          const availStart = new Date(avail.start_date);
          const availEnd = new Date(avail.end_date);

          if (d >= availStart && d <= availEnd) {
            reservedQuantity += avail.quantity || 0;
          }
        }

        // Si stock insuffisant pour au moins 1 unité, le produit est indisponible
        if (totalStock - reservedQuantity < 1) {
          unavailableIds.add(productId);
          break; // Pas besoin de continuer pour ce produit
        }
      }
    }

    return { unavailableIds, hasError: false };
  } catch (error) {
    console.error('Error in getUnavailableProductIds:', error);
    // SÉCURITÉ: Signaler l'erreur pour que l'UI affiche un message
    return {
      unavailableIds,
      hasError: true,
      errorMessage: 'Impossible de vérifier la disponibilité. Veuillez nous contacter.'
    };
  }
}
