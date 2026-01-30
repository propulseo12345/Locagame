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
 * Calcule le prix total d'un produit pour une durée donnée
 * Applique le coefficient multi-jours si durationDays >= 2
 */
export function calculateProductPrice(product: Product, durationDays: number): number {
  const { pricing } = product;
  let basePrice: number;

  // 1 jour
  if (durationDays === 1) {
    return pricing.oneDay;
  }

  // 2-3 jours (weekend)
  if (durationDays >= 2 && durationDays <= 3) {
    basePrice = pricing.weekend;
  }
  // 4-7 jours (semaine)
  else if (durationDays >= 4 && durationDays <= 7) {
    basePrice = pricing.week;
  }
  // Plus de 7 jours : vérifier les durées custom
  else if (pricing.customDurations && pricing.customDurations.length > 0) {
    // Trouver la durée custom qui correspond le mieux
    const matchingDuration = pricing.customDurations.find(
      (cd: any) => durationDays >= cd.minDays && durationDays <= cd.maxDays
    );

    if (matchingDuration) {
      basePrice = matchingDuration.price;
    } else {
      // Fallback : calculer au prorata du tarif semaine
      const weekPrice = pricing.week;
      const pricePerDay = weekPrice / 7;
      basePrice = Math.ceil(pricePerDay * durationDays);
    }
  } else {
    // Fallback : calculer au prorata du tarif semaine
    const weekPrice = pricing.week;
    const pricePerDay = weekPrice / 7;
    basePrice = Math.ceil(pricePerDay * durationDays);
  }

  // Appliquer le coefficient multi-jours (uniquement si >= 2 jours)
  const coefficient = product.multi_day_coefficient ?? 1.00;
  const finalPrice = basePrice * coefficient;

  // Arrondi à 2 décimales (centime)
  return Math.round(finalPrice * 100) / 100;
}

/**
 * Calcule le prix total avec livraison
 */
export function calculateTotalPrice(
  product: Product,
  durationDays: number,
  postalCode?: string,
  quantity: number = 1
): PriceCalculation {
  const productPrice = calculateProductPrice(product, durationDays) * quantity;
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
    zone
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
 * Calcule la durée en jours entre deux dates
 */
export function calculateDurationDays(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diffTime = end.getTime() - start.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 1; // Minimum 1 jour
}

/**
 * Calcule le prix d'un item de panier (produit + dates + quantité)
 */
export function calculateCartItemPrice(
  product: Product,
  startDate: string | Date,
  endDate: string | Date,
  quantity: number = 1
): number {
  const durationDays = calculateDurationDays(startDate, endDate);
  const unitPrice = calculateProductPrice(product, durationDays);
  return unitPrice * quantity;
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
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
