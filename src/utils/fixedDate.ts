/**
 * Date fixe configurée : 11/11/2025 5h31 (heure de Paris/FR)
 * Cette date est utilisée dans toutes les interfaces pour avoir une date de référence constante
 */

// Date fixe : 11 novembre 2025 à 5h31 (heure de Paris)
// Note: JavaScript Date utilise UTC, donc on doit ajuster pour l'heure de Paris (UTC+1 en novembre)
// 5h31 heure de Paris = 4h31 UTC
const FIXED_DATE = new Date('2025-11-11T04:31:00.000Z');

/**
 * Retourne la date fixe configurée (11/11/2025 5h31 Paris)
 * Remplace new Date() dans toutes les interfaces
 */
export function getCurrentDate(): Date {
  return new Date(FIXED_DATE);
}

/**
 * Retourne la date fixe au format ISO (YYYY-MM-DD)
 */
export function getCurrentDateISO(): string {
  return FIXED_DATE.toISOString().split('T')[0];
}

/**
 * Retourne le timestamp de la date fixe
 */
export function getCurrentTimestamp(): number {
  return FIXED_DATE.getTime();
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
    timeZone: 'Europe/Paris'
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

