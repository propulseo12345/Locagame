/**
 * Date fixe configurée : 30/01/2026 12h59 (heure de Paris/FR)
 * Cette date est utilisée dans toutes les interfaces pour avoir une date de référence constante
 *
 * IMPORTANT: Ce fichier est synchronisé avec src/constants/time.ts
 * Toute modification de la date de référence doit être faite dans les deux fichiers.
 */

import { REFERENCE_TIME, getReferenceDate } from '../constants/time';

// Date fixe : 30 janvier 2026 à 12h59 (heure de Paris)
// Note: JavaScript Date utilise UTC, donc on doit ajuster pour l'heure de Paris (UTC+1 en janvier)
// 12h59 heure de Paris = 11h59 UTC
const FIXED_DATE = getReferenceDate();

/**
 * Retourne la date fixe configurée (30/01/2026 12h59 Paris)
 * Remplace new Date() dans toutes les interfaces
 */
export function getCurrentDate(): Date {
  return new Date(FIXED_DATE);
}

/**
 * Retourne la date fixe au format ISO (YYYY-MM-DD)
 */
export function getCurrentDateISO(): string {
  return REFERENCE_TIME.date;
}

/**
 * Retourne le timestamp de la date fixe
 */
export function getCurrentTimestamp(): number {
  return REFERENCE_TIME.timestamp;
}

/**
 * Retourne la date fixe formatée pour l'affichage
 */
export function getCurrentDateFormatted(): string {
  return FIXED_DATE.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: REFERENCE_TIME.timezone,
  });
}

/**
 * Vérifie si une date correspond à la date fixe (aujourd'hui)
 */
export function isToday(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;

  // Normaliser les deux dates à minuit en heure locale pour comparer uniquement les jours
  const fixedYear = FIXED_DATE.getFullYear();
  const fixedMonth = FIXED_DATE.getMonth();
  const fixedDay = FIXED_DATE.getDate();

  const checkYear = checkDate.getFullYear();
  const checkMonth = checkDate.getMonth();
  const checkDay = checkDate.getDate();

  return fixedYear === checkYear && fixedMonth === checkMonth && fixedDay === checkDay;
}

/**
 * Vérifie si une date est dans le passé par rapport à la date fixe
 */
export function isPastDate(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return checkDate < FIXED_DATE;
}

/**
 * Vérifie si une date est dans le futur par rapport à la date fixe
 */
export function isFutureDate(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return checkDate > FIXED_DATE;
}

/**
 * Retourne la date de référence (alias pour getCurrentDate)
 * @deprecated Utiliser getCurrentDate() ou importer depuis constants/time
 */
export function getFixedDate(): Date {
  return getCurrentDate();
}
