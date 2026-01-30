import { supabase } from '../lib/supabase';
import { ProductsService } from '../services';
import { Product } from '../types';

/** Résultat de vérification de disponibilité */
export interface AvailabilityResult {
  available: boolean;
  availableQuantity: number;
  conflictingDates: string[];
  /** Message d'erreur si la vérification a échoué - BLOQUE la réservation */
  error?: string;
}

/** Résultat de génération de calendrier */
export interface CalendarDayResult {
  date: string;
  available: boolean;
  availableQuantity: number;
  isMaintenance: boolean;
  /** Erreur de vérification pour ce jour */
  error?: string;
}

/** Résultat de vérification batch pour le catalogue */
export interface UnavailabilityResult {
  unavailableIds: Set<string>;
  /** Si true, une erreur s'est produite et les résultats ne sont pas fiables */
  hasError: boolean;
  errorMessage?: string;
}

/**
 * Vérifie la disponibilité d'un produit pour une période donnée
 * Utilise Supabase pour calculer la disponibilité réelle
 *
 * SÉCURITÉ: En cas d'erreur, retourne TOUJOURS available=false
 */
export async function checkAvailability(
  productId: string,
  startDate: string,
  endDate: string,
  quantity: number = 1
): Promise<AvailabilityResult> {
  try {
    // Récupérer le produit pour connaître le stock total
    const product = await ProductsService.getProductById(productId);
    if (!product || !product.is_active) {
      return {
        available: false,
        availableQuantity: 0,
        conflictingDates: [startDate]
      };
    }

    const totalStock = product.total_stock || 0;

    // Récupérer toutes les disponibilités qui se chevauchent avec la période
    // Chevauchement : start_date <= endDate AND end_date >= startDate
    const { data: availabilities, error } = await supabase
      .from('product_availability')
      .select('*')
      .eq('product_id', productId)
      .lte('start_date', endDate)
      .gte('end_date', startDate);

    if (error) {
      console.error('Error checking availability:', error);
      // SÉCURITÉ: En cas d'erreur, considérer comme INDISPONIBLE
      // Ne jamais retourner "disponible" si on ne peut pas vérifier
      return {
        available: false,
        availableQuantity: 0,
        conflictingDates: [startDate, endDate],
        error: 'Impossible de vérifier la disponibilité. Veuillez réessayer.'
      };
    }

    // Calculer la quantité réservée pour chaque date de la période
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    let minAvailableQuantity = totalStock;
    const conflictingDates: string[] = [];

    for (const date of dates) {
      // Calculer la quantité réservée pour cette date
      let reservedQuantity = 0;
      const dateObj = new Date(date);

      for (const availability of availabilities || []) {
        const availStart = new Date(availability.start_date);
        const availEnd = new Date(availability.end_date);

        // Vérifier si cette disponibilité couvre cette date
        if (dateObj >= availStart && dateObj <= availEnd) {
          // Si c'est une réservation active ou un blocage/maintenance
          if (availability.status === 'reserved' || availability.status === 'blocked' || availability.status === 'maintenance') {
            reservedQuantity += availability.quantity || 0;
          }
        }
      }

      const availableQuantity = Math.max(0, totalStock - reservedQuantity);
      minAvailableQuantity = Math.min(minAvailableQuantity, availableQuantity);

      if (availableQuantity < quantity) {
        conflictingDates.push(date);
      }
    }

    return {
      available: minAvailableQuantity >= quantity && conflictingDates.length === 0,
      availableQuantity: minAvailableQuantity,
      conflictingDates
    };
  } catch (error) {
    console.error('Error in checkAvailability:', error);
    // SÉCURITÉ: En cas d'erreur, considérer comme INDISPONIBLE
    // Ne jamais retourner "disponible" si on ne peut pas vérifier
    return {
      available: false,
      availableQuantity: 0,
      conflictingDates: [startDate, endDate],
      error: 'Impossible de vérifier la disponibilité. Veuillez réessayer.'
    };
  }
}

/**
 * Génère un calendrier de disponibilité pour un produit
 * Utilise Supabase pour calculer la disponibilité réelle
 *
 * SÉCURITÉ: En cas d'erreur, retourne TOUJOURS available=false pour tous les jours
 */
export async function generateAvailabilityCalendar(
  productId: string,
  year: number,
  month: number
): Promise<CalendarDayResult[]> {
  try {
    // Récupérer le produit pour connaître le stock total
    const product = await ProductsService.getProductById(productId);
    if (!product) {
      return [];
    }

    const totalStock = product.total_stock || 0;

    // Calculer les dates de début et fin du mois
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];

    // Récupérer toutes les disponibilités pour ce mois
    // Chevauchement : start_date <= endDateStr AND end_date >= startDateStr
    const { data: availabilities, error } = await supabase
      .from('product_availability')
      .select('*')
      .eq('product_id', productId)
      .lte('start_date', endDateStr)
      .gte('end_date', startDateStr);

    if (error) {
      console.error('Error fetching availability:', error);
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const calendar: { date: string; available: boolean; availableQuantity: number; isMaintenance: boolean }[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];
      const dateObj = new Date(dateString);

      // Calculer la quantité réservée pour cette date
      let reservedQuantity = 0;
      let isMaintenance = false;

      for (const availability of availabilities || []) {
        const availStart = new Date(availability.start_date);
        const availEnd = new Date(availability.end_date);

        // Vérifier si cette disponibilité couvre cette date
        if (dateObj >= availStart && dateObj <= availEnd) {
          if (availability.status === 'maintenance') {
            isMaintenance = true;
            reservedQuantity += availability.quantity || 0;
          } else if (availability.status === 'blocked' || availability.status === 'reserved') {
            reservedQuantity += availability.quantity || 0;
          }
        }
      }

      const availableQuantity = Math.max(0, totalStock - reservedQuantity);

      calendar.push({
        date: dateString,
        available: availableQuantity > 0 && !isMaintenance,
        availableQuantity,
        isMaintenance
      });
    }
    
    return calendar;
  } catch (error) {
    console.error('Error in generateAvailabilityCalendar:', error);
    // SÉCURITÉ: En cas d'erreur, retourner un calendrier avec TOUTES LES DATES INDISPONIBLES
    // Ne jamais retourner "disponible" si on ne peut pas vérifier
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month - 1, i + 1);
      return {
        date: date.toISOString().split('T')[0],
        available: false,
        availableQuantity: 0,
        isMaintenance: false,
        error: 'Impossible de vérifier la disponibilité. Veuillez nous contacter.'
      };
    });
  }
}

/**
 * Vérifie si une date est dans le passé
 */
export function isPastDate(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  return checkDate < today;
}

/**
 * Vérifie si une date est aujourd'hui
 */
export function isToday(date: string): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formate une date courte
 */
export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
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
        const dateStr = d.toISOString().split('T')[0];
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

/**
 * Calcule le nombre de jours entre deux dates (inclusif)
 * Ex: du 2025-01-15 au 2025-01-17 = 3 jours
 *
 * @deprecated Utiliser calculateDurationDays depuis pricing.ts
 * Cette fonction est conservée pour compatibilité et délègue à la source unique
 */
export { calculateDurationDays as calculateDurationDaysInclusive } from './pricing';
