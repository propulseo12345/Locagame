import { Product, DeliveryZone, PriceCalculation } from '../types';

// Zones de livraison simulées (en attendant la vraie DB)
export const deliveryZones: DeliveryZone[] = [
  {
    id: '1',
    name: 'Marseille Centre',
    postal_codes: ['13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008'],
    cities: ['Marseille'],
    delivery_fee: 85,
    free_delivery_threshold: null // Frais kilométriques en supplément
  },
  {
    id: '2',
    name: 'Marseille Périphérie',
    postal_codes: ['13009', '13010', '13011', '13012', '13013', '13014', '13015', '13016'],
    cities: ['Marseille'],
    delivery_fee: 85,
    free_delivery_threshold: null // Frais kilométriques en supplément
  },
  {
    id: '3',
    name: 'Aix-en-Provence',
    postal_codes: ['13100', '13101', '13102', '13103', '13104', '13105'],
    cities: ['Aix-en-Provence'],
    delivery_fee: 35,
    free_delivery_threshold: 400
  },
  {
    id: '4',
    name: 'Autres communes PACA',
    postal_codes: ['13000', '13100', '13200', '13300', '13400', '13500', '13600', '13700', '13800', '13900', '83000', '84000', '06000', '06100', '06200', '06300', '06400', '06500', '06600', '06700', '06800', '06900'],
    cities: ['Marseille', 'Aix-en-Provence', 'Toulon', 'Nice', 'Cannes', 'Antibes', 'Grasse', 'Draguignan', 'Fréjus', 'Saint-Raphaël'],
    delivery_fee: 50,
    free_delivery_threshold: 500
  }
];

/**
 * Trouve la zone de livraison basée sur le code postal
 */
export function findDeliveryZone(postalCode: string): DeliveryZone | null {
  const cleanPostalCode = postalCode.replace(/\s/g, '');
  
  for (const zone of deliveryZones) {
    if (zone.postal_codes.includes(cleanPostalCode)) {
      return zone;
    }
  }
  
  return null;
}

/**
 * Arrondi à 2 décimales (centimes)
 */
export function ROUND2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calcule le nombre de "jours LOCAGAME" entre deux dates.
 * Règle du bloc week-end : Ven+Sam+Dim+Lun = 1 seul jour LOCAGAME.
 *   - Vendredi (DOW=5) → compter 1 jour, sauter au Mardi suivant (+4j)
 *   - Samedi   (DOW=6) → compter 1 jour, sauter au Mardi suivant (+3j)
 *   - Dimanche (DOW=0) → compter 1 jour, sauter au Mardi suivant (+2j)
 *   - Lun/Mar/Mer/Jeu   → compter 1 jour, avancer de 1
 */
export function calculateLocagameDays(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? parseLocalDate(startDate) : new Date(startDate);
  const end = typeof endDate === 'string' ? parseLocalDate(endDate) : new Date(endDate);

  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  // Guard : si end < start → 0
  if (endMidnight < current) return 0;
  // Guard : max 365 jours calendaires
  const diffCalendar = Math.round((endMidnight.getTime() - current.getTime()) / 86400000);
  if (diffCalendar > 365) return 260;

  let days = 0;
  let iter = 0;
  while (current <= endMidnight && iter < 500) {
    iter++;
    const dow = current.getDay(); // 0=dim, 1=lun, 5=ven, 6=sam

    days += 1; // on compte toujours 1 jour

    if (dow === 5) {
      // Vendredi → saute au mardi suivant (+4 jours)
      current.setDate(current.getDate() + 4);
    } else if (dow === 6) {
      // Samedi → saute au mardi suivant (+3 jours)
      current.setDate(current.getDate() + 3);
    } else if (dow === 0) {
      // Dimanche → saute au mardi suivant (+2 jours)
      current.setDate(current.getDate() + 2);
    } else {
      // Lundi, Mardi, Mercredi, Jeudi → avance de 1 jour
      current.setDate(current.getDate() + 1);
    }
  }

  return days;
}

/**
 * Vérifie si la période contient un jour de week-end (ven/sam/dim)
 */
export function hasWeekend(startDate: string | Date, endDate: string | Date): boolean {
  const start = typeof startDate === 'string' ? parseLocalDate(startDate) : new Date(startDate);
  const end = typeof endDate === 'string' ? parseLocalDate(endDate) : new Date(endDate);
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (current <= endMidnight) {
    const dow = current.getDay();
    if (dow === 0 || dow === 5 || dow === 6) return true;
    current.setDate(current.getDate() + 1);
  }
  return false;
}

/**
 * Calcule le prix LOCAGAME pour un tarif journalier et un nombre de jours LOCAGAME.
 *
 * Formule :
 *   1j  = P
 *   2j  = P + P×50%
 *   3-5j = P + (P×0.5 × nSup) × (1 − remise)
 *          où nSup = n−1, remise = min(nSup×10%, 40%)
 *   >5j  = semainePrice + extraDays × (semainePrice / 6)
 *
 * Exemples pour P=100 :
 *   1j=100, 2j=150, 3j=180, 4j=205, 5j=220,
 *   6j=256.67, 8j=330, 10j=403.33
 */
export function calculateLocagamePrice(pricePerDay: number, locagameDays: number): number {
  if (locagameDays <= 0) return 0;
  if (locagameDays === 1) return ROUND2(pricePerDay);
  if (locagameDays === 2) return ROUND2(pricePerDay + pricePerDay * 0.5);

  // Tarif semaine de référence (5 jours)
  const semainePrice = ROUND2(
    pricePerDay + (pricePerDay * 0.5 * 4) * (1 - 0.40)
  );

  // Au-delà de 5 jours : semaine + jours sup à tarif_semaine/6
  if (locagameDays > 5) {
    const extraDays = locagameDays - 5;
    const pricePerExtraDay = ROUND2(semainePrice / 6);
    return ROUND2(semainePrice + extraDays * pricePerExtraDay);
  }

  // 3 à 5 jours
  const nSup = locagameDays - 1;
  const remise = Math.min(nSup * 0.10, 0.40);
  return ROUND2(pricePerDay + (pricePerDay * 0.5 * nSup) * (1 - remise));
}

/**
 * Calcule le prix total avec livraison (utilise la tarification LOCAGAME)
 */
export function calculateTotalPrice(
  product: Product,
  startDate: string | Date,
  endDate: string | Date,
  postalCode?: string,
  quantity: number = 1
): PriceCalculation {
  const locagameDays = calculateLocagameDays(startDate, endDate);
  const durationDays = calculateDurationDays(startDate, endDate);
  const unitPrice = calculateLocagamePrice(product.pricing.oneDay, locagameDays);
  const productPrice = unitPrice * quantity;
  const zone = postalCode ? findDeliveryZone(postalCode) : null;
  
  let deliveryFee = 0;
  if (zone) {
    if (zone.free_delivery_threshold && productPrice >= zone.free_delivery_threshold) {
      deliveryFee = 0;
    } else {
      deliveryFee = zone.delivery_fee;
    }
  }
  
  return {
    product_price: productPrice,
    delivery_fee: deliveryFee,
    total: productPrice + deliveryFee,
    duration_days: durationDays,
    zone: zone ?? undefined
  };
}

/**
 * Formate un prix en euros
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

/**
 * Calcule la durée en jours entre deux dates (INCLUSIF)
 * Pour la location: du 15 au 17 = 3 jours (15, 16, 17)
 * C'est la SOURCE DE VÉRITÉ pour le calcul de durée
 */
/** Parse a YYYY-MM-DD date string as local midnight (avoids UTC timezone shift) */
export function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function calculateDurationDays(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? parseLocalDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseLocalDate(endDate) : endDate;

  // Reset to midnight for accurate day calculation
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  const diffTime = endMidnight.getTime() - startMidnight.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // +1 pour inclusif: du 15 au 17 = 3 jours
  return Math.max(1, diffDays + 1);
}

/**
 * Calcule le prix d'un item de panier (produit + dates + quantité)
 * Utilise la tarification LOCAGAME (jours ouvrés, week-end offert)
 */
export function calculateCartItemPrice(
  product: Product,
  startDate: string | Date,
  endDate: string | Date,
  quantity: number = 1
): number {
  const locagameDays = calculateLocagameDays(startDate, endDate);
  const unitPrice = calculateLocagamePrice(product.pricing.oneDay, locagameDays);
  return unitPrice * quantity;
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calcule le dépôt de garantie (caution) pour une réservation
 * Logique : 20% du sous-total avec un minimum de 50€
 */
export function calculateDeposit(subtotal: number): number {
  const depositPercentage = 0.2; // 20%
  const minDeposit = 50;
  const calculatedDeposit = Math.ceil(subtotal * depositPercentage);
  return Math.max(calculatedDeposit, minDeposit);
}
