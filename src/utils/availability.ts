/**
 * Module de disponibilité LOCAGAME
 *
 * Re-exports depuis les sous-modules pour compatibilité ascendante.
 * - availabilityCheck.ts : vérification individuelle + calendrier
 * - availabilityBatch.ts : vérification batch pour le catalogue
 */

// === Re-exports : vérification individuelle + calendrier ===
export {
  checkAvailability,
  generateAvailabilityCalendar,
  type AvailabilityResult,
  type CalendarDayResult,
} from './availabilityCheck';

// === Re-exports : vérification batch catalogue ===
export {
  getUnavailableProductIds,
  type UnavailabilityResult,
} from './availabilityBatch';

// === Fonctions utilitaires de date ===

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
 * Calcule le nombre de jours entre deux dates (inclusif)
 * Ex: du 2025-01-15 au 2025-01-17 = 3 jours
 *
 * @deprecated Utiliser calculateDurationDays depuis pricing.ts
 * Cette fonction est conservée pour compatibilité et délègue à la source unique
 */
export { calculateDurationDays as calculateDurationDaysInclusive } from './pricing';
