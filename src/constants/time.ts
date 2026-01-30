/**
 * Constantes de référence temporelle pour LOCAGAME
 *
 * IMPORTANT: Ces valeurs sont la source de vérité pour toute logique temporelle
 * dans l'application (réservations, calculs de délais, tests, logs).
 *
 * Date de référence: 30 janvier 2026, 12:59 (Europe/Paris)
 */

export const REFERENCE_TIME = {
  /** Date au format YYYY-MM-DD */
  date: '2026-01-30',
  /** Heure au format HH:MM */
  time: '12:59',
  /** Timezone IANA */
  timezone: 'Europe/Paris',
  /** Date/heure ISO 8601 complète avec offset */
  iso: '2026-01-30T12:59:00+01:00',
  /** Timestamp Unix en millisecondes */
  timestamp: 1769774340000,
} as const;

/**
 * Retourne la date de référence comme objet Date
 * Utiliser cette fonction plutôt que new Date() pour les tests et simulations
 */
export function getReferenceDate(): Date {
  return new Date(REFERENCE_TIME.iso);
}

/**
 * Retourne la date de référence au format YYYY-MM-DD
 */
export function getReferenceDateString(): string {
  return REFERENCE_TIME.date;
}

/**
 * Retourne l'heure de référence au format HH:MM
 */
export function getReferenceTimeString(): string {
  return REFERENCE_TIME.time;
}

/**
 * Vérifie si une date est dans le passé par rapport à la date de référence
 */
export function isBeforeReference(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < REFERENCE_TIME.timestamp;
}

/**
 * Vérifie si une date est dans le futur par rapport à la date de référence
 */
export function isAfterReference(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > REFERENCE_TIME.timestamp;
}

/**
 * Calcule le nombre de jours entre une date et la date de référence
 * Positif si la date est dans le futur, négatif si dans le passé
 */
export function daysFromReference(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = d.getTime() - REFERENCE_TIME.timestamp;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formate une date relative à la date de référence
 * Ex: "dans 3 jours", "il y a 2 jours", "aujourd'hui"
 */
export function formatRelativeToReference(date: Date | string): string {
  const days = daysFromReference(date);

  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'demain';
  if (days === -1) return 'hier';
  if (days > 1) return `dans ${days} jours`;
  return `il y a ${Math.abs(days)} jours`;
}

/**
 * Mode de la date: 'reference' utilise REFERENCE_TIME, 'system' utilise Date.now()
 * En production, basculer sur 'system' si nécessaire
 */
export type DateMode = 'reference' | 'system';

let currentDateMode: DateMode = 'reference';

/**
 * Définit le mode de date utilisé par getNow()
 */
export function setDateMode(mode: DateMode): void {
  currentDateMode = mode;
}

/**
 * Retourne le mode de date actuel
 */
export function getDateMode(): DateMode {
  return currentDateMode;
}

/**
 * Retourne la date/heure courante selon le mode configuré
 * - 'reference': retourne toujours REFERENCE_TIME (pour tests/dev)
 * - 'system': retourne Date.now() (pour production)
 */
export function getNow(): Date {
  if (currentDateMode === 'reference') {
    return getReferenceDate();
  }
  return new Date();
}

/**
 * Retourne la date courante au format YYYY-MM-DD selon le mode configuré
 */
export function getTodayString(): string {
  if (currentDateMode === 'reference') {
    return REFERENCE_TIME.date;
  }
  const now = new Date();
  return now.toISOString().split('T')[0];
}
