/**
 * Moteur de calcul des règles tarifaires LOCAGAME
 * Gère les forfaits week-end et majorations livraison/reprise
 */

import { Product } from '../types';
import {
  isWeekendOrHoliday,
  periodContainsWeekend,
  isWeekendPattern,
  getHolidayName,
  isWeekend,
  DaySlot,
} from './dateHolidays';
import { calculateProductPrice, calculateDurationDays } from './pricing';
import {
  WEEKEND_DELIVERY_SURCHARGE,
  HOLIDAY_SURCHARGE,
  type PricingInput,
  type PricingRuleApplied,
  type PricingBreakdown,
} from './pricingRulesTypes';

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

  // === REGLE 1: Forfait week-end ===
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

  // === REGLE 2: Majorations livraison/reprise ===
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
