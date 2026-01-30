/**
 * Module de règles tarifaires LOCAGAME
 * Gère les forfaits week-end et majorations livraison/reprise
 */

import { Product } from '../types';
import {
  isWeekendOrHoliday,
  periodContainsWeekend,
  isWeekendPattern,
  isFrenchHoliday,
  getHolidayName,
  isWeekend,
  DaySlot,
} from './dateHolidays';
import { calculateProductPrice, calculateDurationDays } from './pricing';

// === CONFIGURATION ===

/**
 * Surcharge pour livraison/reprise impérative le week-end (en euros)
 */
export const WEEKEND_DELIVERY_SURCHARGE = 50;

/**
 * Surcharge pour livraison/reprise impérative un jour férié (en euros)
 */
export const HOLIDAY_SURCHARGE = 50;

/**
 * Forfait week-end par défaut si le produit n'a pas de prix spécifique
 * (utilisé seulement comme fallback, normalement le produit définit son propre forfait)
 */
export const DEFAULT_WEEKEND_FLAT_PRICE = 125;

// === TYPES ===

export interface PricingInput {
  /** Produit avec son weekend_flat_price optionnel */
  product: Product & { weekend_flat_price?: number | null };
  /** Date de début de location */
  startDate: string | Date;
  /** Date de fin de location */
  endDate: string | Date;
  /** Créneau de début (AM = matin, PM = après-midi) */
  startSlot?: DaySlot;
  /** Créneau de fin (AM = matin, PM = après-midi) */
  endSlot?: DaySlot;
  /** Quantité louée */
  quantity?: number;
  /** Livraison impérative à la date choisie */
  deliveryIsMandatory?: boolean;
  /** Reprise impérative à la date choisie */
  pickupIsMandatory?: boolean;
  /** Date de livraison (par défaut = startDate) */
  deliveryDate?: string | Date;
  /** Date de reprise (par défaut = endDate) */
  pickupDate?: string | Date;
}

export interface PricingRuleApplied {
  /** Identifiant de la règle */
  id: string;
  /** Nom affichable de la règle */
  name: string;
  /** Description détaillée */
  description: string;
  /** Montant (positif ou négatif) */
  amount: number;
  /** Type de règle */
  type: 'flat_rate' | 'surcharge' | 'discount';
}

export interface PricingBreakdown {
  /** Prix de base (calcul standard prix/jour * jours ou forfait) */
  basePrice: number;
  /** Label du prix de base pour affichage */
  basePriceLabel: string;
  /** Quantité */
  quantity: number;
  /** Sous-total produit (basePrice * quantity) */
  productSubtotal: number;
  /** Durée en jours */
  durationDays: number;
  /** Règles tarifaires appliquées */
  rulesApplied: PricingRuleApplied[];
  /** Total des majorations */
  surchargesTotal: number;
  /** Total final (productSubtotal + surchargesTotal) */
  total: number;
  /** Indique si le forfait week-end a été appliqué */
  weekendFlatRateApplied: boolean;
  /** Message d'information pour l'UX */
  infoMessage?: string;
}

// === FONCTIONS PRINCIPALES ===

/**
 * Détermine si le forfait week-end doit s'appliquer
 */
export function shouldApplyWeekendFlatRate(
  startDate: string | Date,
  endDate: string | Date,
  startSlot: DaySlot = 'AM',
  endSlot: DaySlot = 'AM'
): boolean {
  // Cas 1: Pattern vendredi PM -> lundi AM
  if (isWeekendPattern(startDate, endDate, startSlot, endSlot)) {
    return true;
  }

  // Cas 2: La période couvre au moins un jour du week-end
  if (periodContainsWeekend(startDate, endDate)) {
    return true;
  }

  return false;
}

/**
 * Calcule les majorations pour livraison/reprise week-end ou jour férié
 */
export function calculateDeliverySurcharges(
  deliveryDate: string | Date,
  pickupDate: string | Date,
  deliveryIsMandatory: boolean,
  pickupIsMandatory: boolean
): PricingRuleApplied[] {
  const rules: PricingRuleApplied[] = [];

  // Majoration livraison
  if (deliveryIsMandatory) {
    const holidayName = getHolidayName(deliveryDate);
    if (holidayName) {
      rules.push({
        id: 'delivery_holiday_surcharge',
        name: 'Majoration livraison jour férié',
        description: `Livraison impérative le ${holidayName}`,
        amount: HOLIDAY_SURCHARGE,
        type: 'surcharge',
      });
    } else if (isWeekend(deliveryDate)) {
      rules.push({
        id: 'delivery_weekend_surcharge',
        name: 'Majoration livraison week-end',
        description: 'Livraison impérative le week-end',
        amount: WEEKEND_DELIVERY_SURCHARGE,
        type: 'surcharge',
      });
    }
  }

  // Majoration reprise
  if (pickupIsMandatory) {
    const holidayName = getHolidayName(pickupDate);
    if (holidayName) {
      rules.push({
        id: 'pickup_holiday_surcharge',
        name: 'Majoration reprise jour férié',
        description: `Reprise impérative le ${holidayName}`,
        amount: HOLIDAY_SURCHARGE,
        type: 'surcharge',
      });
    } else if (isWeekend(pickupDate)) {
      rules.push({
        id: 'pickup_weekend_surcharge',
        name: 'Majoration reprise week-end',
        description: 'Reprise impérative le week-end',
        amount: WEEKEND_DELIVERY_SURCHARGE,
        type: 'surcharge',
      });
    }
  }

  return rules;
}

/**
 * Calcule le breakdown complet du prix avec toutes les règles
 */
export function calculatePricingBreakdown(input: PricingInput): PricingBreakdown {
  const {
    product,
    startDate,
    endDate,
    startSlot = 'AM',
    endSlot = 'AM',
    quantity = 1,
    deliveryIsMandatory = false,
    pickupIsMandatory = false,
    deliveryDate,
    pickupDate,
  } = input;

  const durationDays = calculateDurationDays(startDate, endDate);
  const rulesApplied: PricingRuleApplied[] = [];
  let basePrice: number;
  let basePriceLabel: string;
  let weekendFlatRateApplied = false;
  let infoMessage: string | undefined;

  // === RÈGLE 1: Forfait week-end ===
  const hasWeekendFlatPrice =
    product.weekend_flat_price !== null && product.weekend_flat_price !== undefined;

  if (hasWeekendFlatPrice && shouldApplyWeekendFlatRate(startDate, endDate, startSlot, endSlot)) {
    basePrice = product.weekend_flat_price!;
    basePriceLabel = 'Forfait week-end';
    weekendFlatRateApplied = true;

    rulesApplied.push({
      id: 'weekend_flat_rate',
      name: 'Forfait week-end',
      description: `Tarif forfaitaire week-end pour ${product.name}`,
      amount: basePrice,
      type: 'flat_rate',
    });
  } else {
    // Calcul standard
    basePrice = calculateProductPrice(product, durationDays);
    basePriceLabel =
      durationDays === 1 ? '1 jour' : `${durationDays} jours`;
  }

  const productSubtotal = basePrice * quantity;

  // === RÈGLE 2: Majorations livraison/reprise ===
  const effectiveDeliveryDate = deliveryDate ?? startDate;
  const effectivePickupDate = pickupDate ?? endDate;

  const deliverySurcharges = calculateDeliverySurcharges(
    effectiveDeliveryDate,
    effectivePickupDate,
    deliveryIsMandatory,
    pickupIsMandatory
  );
  rulesApplied.push(...deliverySurcharges);

  // Message UX si livraison non impérative sur week-end/férié
  if (!deliveryIsMandatory && isWeekendOrHoliday(effectiveDeliveryDate)) {
    infoMessage =
      'Livraison planifiée hors week-end / jours fériés (nous vous contacterons pour confirmer le créneau).';
  }
  if (!pickupIsMandatory && isWeekendOrHoliday(effectivePickupDate)) {
    infoMessage =
      infoMessage ??
      'Reprise planifiée hors week-end / jours fériés (nous vous contacterons pour confirmer le créneau).';
  }

  // Calcul des totaux
  const surchargesTotal = rulesApplied
    .filter((r) => r.type === 'surcharge')
    .reduce((sum, r) => sum + r.amount, 0);

  const total = productSubtotal + surchargesTotal;

  return {
    basePrice,
    basePriceLabel,
    quantity,
    productSubtotal,
    durationDays,
    rulesApplied,
    surchargesTotal,
    total,
    weekendFlatRateApplied,
    infoMessage,
  };
}

/**
 * Calcule le prix d'un item du panier avec les règles tarifaires
 */
export function calculateCartItemPriceWithRules(
  product: Product & { weekend_flat_price?: number | null },
  startDate: string | Date,
  endDate: string | Date,
  quantity: number = 1,
  options?: {
    startSlot?: DaySlot;
    endSlot?: DaySlot;
    deliveryIsMandatory?: boolean;
    pickupIsMandatory?: boolean;
  }
): PricingBreakdown {
  return calculatePricingBreakdown({
    product,
    startDate,
    endDate,
    quantity,
    ...options,
  });
}

/**
 * Formate un breakdown pour affichage dans l'UI
 */
export function formatBreakdownForDisplay(breakdown: PricingBreakdown): string[] {
  const lines: string[] = [];

  // Ligne de base
  if (breakdown.quantity > 1) {
    lines.push(
      `${breakdown.basePriceLabel}: ${breakdown.basePrice.toFixed(2)}€ x ${breakdown.quantity} = ${breakdown.productSubtotal.toFixed(2)}€`
    );
  } else {
    lines.push(`${breakdown.basePriceLabel}: ${breakdown.productSubtotal.toFixed(2)}€`);
  }

  // Majorations
  for (const rule of breakdown.rulesApplied.filter((r) => r.type === 'surcharge')) {
    lines.push(`+ ${rule.name}: ${rule.amount.toFixed(2)}€`);
  }

  // Total
  if (breakdown.surchargesTotal > 0) {
    lines.push(`Total: ${breakdown.total.toFixed(2)}€`);
  }

  return lines;
}

/**
 * Sérialise un breakdown pour stockage en base (JSONB)
 */
export function serializeBreakdown(breakdown: PricingBreakdown): object {
  return {
    base_price: breakdown.basePrice,
    base_price_label: breakdown.basePriceLabel,
    quantity: breakdown.quantity,
    product_subtotal: breakdown.productSubtotal,
    duration_days: breakdown.durationDays,
    rules_applied: breakdown.rulesApplied.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      amount: r.amount,
      type: r.type,
    })),
    surcharges_total: breakdown.surchargesTotal,
    total: breakdown.total,
    weekend_flat_rate_applied: breakdown.weekendFlatRateApplied,
    info_message: breakdown.infoMessage,
  };
}
