/**
 * Utilitaires de date pour LOCAGAME
 *
 * Utilise le mode configuré dans constants/time.ts :
 * - 'system' (défaut) : utilise la date réelle (new Date())
 * - 'reference' : utilise la date fixe REFERENCE_TIME (pour tests/démo)
 *
 * IMPORTANT: Ce fichier est synchronisé avec src/constants/time.ts
 */

import { REFERENCE_TIME, getNow, getTodayString } from '../constants/time';

/**
 * Retourne la date courante selon le mode configuré
 * Mode 'system' : new Date() — Mode 'reference' : date fixe REFERENCE_TIME
 */
export function getCurrentDate(): Date {
  return getNow();
}

/**
 * Retourne la date courante au format ISO (YYYY-MM-DD)
 */
export function getCurrentDateISO(): string {
  return getTodayString();
}

/**
 * Retourne le timestamp de la date courante
 */
export function getCurrentTimestamp(): number {
  return getNow().getTime();
}

/**
 * Retourne la date courante formatée pour l'affichage
 */
export function getCurrentDateFormatted(): string {
  return getNow().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: REFERENCE_TIME.timezone,
  });
}

/**
 * Vérifie si une date correspond à aujourd'hui
 */
export function isToday(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const now = getNow();

  return (
    now.getFullYear() === checkDate.getFullYear() &&
    now.getMonth() === checkDate.getMonth() &&
    now.getDate() === checkDate.getDate()
  );
}

/**
 * Vérifie si une date est dans le passé
 */
export function isPastDate(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return checkDate < getNow();
}

/**
 * Vérifie si une date est dans le futur
 */
export function isFutureDate(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return checkDate > getNow();
}

/**
 * Retourne la date courante (alias pour getCurrentDate)
 * @deprecated Utiliser getCurrentDate() ou importer depuis constants/time
 */
export function getFixedDate(): Date {
  return getCurrentDate();
}
