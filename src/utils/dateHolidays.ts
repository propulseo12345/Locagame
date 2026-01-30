/**
 * Utilitaires pour la gestion des jours fériés français
 * et détection du week-end
 */

// Jours fériés fixes (mois indexés de 0 à 11)
const FIXED_HOLIDAYS: Array<{ month: number; day: number; name: string }> = [
  { month: 0, day: 1, name: 'Jour de l\'an' },
  { month: 4, day: 1, name: 'Fête du Travail' },
  { month: 4, day: 8, name: 'Victoire 1945' },
  { month: 6, day: 14, name: 'Fête Nationale' },
  { month: 7, day: 15, name: 'Assomption' },
  { month: 10, day: 1, name: 'Toussaint' },
  { month: 10, day: 11, name: 'Armistice' },
  { month: 11, day: 25, name: 'Noël' },
];

/**
 * Calcule la date de Pâques pour une année donnée
 * Algorithme de Butcher (méthode de calcul de Pâques)
 */
export function calculateEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month, day);
}

/**
 * Calcule les jours fériés mobiles basés sur Pâques pour une année donnée
 */
export function getMovableHolidays(year: number): Array<{ date: Date; name: string }> {
  const easter = calculateEasterDate(year);
  const easterTime = easter.getTime();

  // Lundi de Pâques: Pâques + 1 jour
  const easterMonday = new Date(easterTime + 1 * 24 * 60 * 60 * 1000);

  // Ascension: Pâques + 39 jours
  const ascension = new Date(easterTime + 39 * 24 * 60 * 60 * 1000);

  // Lundi de Pentecôte: Pâques + 50 jours
  const whitMonday = new Date(easterTime + 50 * 24 * 60 * 60 * 1000);

  return [
    { date: easterMonday, name: 'Lundi de Pâques' },
    { date: ascension, name: 'Ascension' },
    { date: whitMonday, name: 'Lundi de Pentecôte' },
  ];
}

/**
 * Récupère tous les jours fériés pour une année donnée
 */
export function getAllHolidays(year: number): Array<{ date: Date; name: string }> {
  const holidays: Array<{ date: Date; name: string }> = [];

  // Jours fériés fixes
  for (const holiday of FIXED_HOLIDAYS) {
    holidays.push({
      date: new Date(year, holiday.month, holiday.day),
      name: holiday.name,
    });
  }

  // Jours fériés mobiles
  holidays.push(...getMovableHolidays(year));

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Normalise une date pour comparaison (minuit, heure locale)
 */
function normalizeDate(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Vérifie si une date est un jour férié français
 */
export function isFrenchHoliday(date: Date | string): boolean {
  const d = normalizeDate(date);
  const year = d.getFullYear();
  const holidays = getAllHolidays(year);

  return holidays.some((h) => {
    const hDate = normalizeDate(h.date);
    return (
      hDate.getFullYear() === d.getFullYear() &&
      hDate.getMonth() === d.getMonth() &&
      hDate.getDate() === d.getDate()
    );
  });
}

/**
 * Retourne le nom du jour férié si c'en est un, sinon null
 */
export function getHolidayName(date: Date | string): string | null {
  const d = normalizeDate(date);
  const year = d.getFullYear();
  const holidays = getAllHolidays(year);

  const holiday = holidays.find((h) => {
    const hDate = normalizeDate(h.date);
    return (
      hDate.getFullYear() === d.getFullYear() &&
      hDate.getMonth() === d.getMonth() &&
      hDate.getDate() === d.getDate()
    );
  });

  return holiday?.name ?? null;
}

/**
 * Vérifie si une date est un week-end (samedi ou dimanche)
 */
export function isWeekend(date: Date | string): boolean {
  const d = normalizeDate(date);
  const dayOfWeek = d.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = dimanche, 6 = samedi
}

/**
 * Vérifie si une date est un samedi
 */
export function isSaturday(date: Date | string): boolean {
  const d = normalizeDate(date);
  return d.getDay() === 6;
}

/**
 * Vérifie si une date est un dimanche
 */
export function isSunday(date: Date | string): boolean {
  const d = normalizeDate(date);
  return d.getDay() === 0;
}

/**
 * Vérifie si une date est un vendredi
 */
export function isFriday(date: Date | string): boolean {
  const d = normalizeDate(date);
  return d.getDay() === 5;
}

/**
 * Vérifie si une date est un lundi
 */
export function isMonday(date: Date | string): boolean {
  const d = normalizeDate(date);
  return d.getDay() === 1;
}

/**
 * Vérifie si une date est un week-end ou un jour férié
 */
export function isWeekendOrHoliday(date: Date | string): boolean {
  return isWeekend(date) || isFrenchHoliday(date);
}

/**
 * Vérifie si une période contient au moins un samedi ou un dimanche
 */
export function periodContainsWeekend(startDate: Date | string, endDate: Date | string): boolean {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  const current = new Date(start);
  while (current <= end) {
    if (isWeekend(current)) {
      return true;
    }
    current.setDate(current.getDate() + 1);
  }
  return false;
}

/**
 * Vérifie si une période contient au moins un jour férié
 */
export function periodContainsHoliday(startDate: Date | string, endDate: Date | string): boolean {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  const current = new Date(start);
  while (current <= end) {
    if (isFrenchHoliday(current)) {
      return true;
    }
    current.setDate(current.getDate() + 1);
  }
  return false;
}

export type DaySlot = 'AM' | 'PM';

/**
 * Vérifie si la période correspond au pattern "vendredi PM -> lundi AM"
 * typique d'un forfait week-end
 */
export function isWeekendPattern(
  startDate: Date | string,
  endDate: Date | string,
  startSlot: DaySlot = 'AM',
  endSlot: DaySlot = 'AM'
): boolean {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  // Pattern vendredi PM -> lundi AM
  if (isFriday(start) && startSlot === 'PM' && isMonday(end) && endSlot === 'AM') {
    // Vérifier que c'est bien le lundi suivant (3 jours plus tard)
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays === 3;
  }

  return false;
}
