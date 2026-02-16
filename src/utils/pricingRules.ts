/**
 * Module de règles tarifaires LOCAGAME
 *
 * Re-exports depuis les sous-modules pour compatibilité ascendante.
 * - pricingRulesTypes.ts : types et constantes
 * - pricingRulesEngine.ts : moteur de calcul
 */

import type { PricingBreakdown } from './pricingRulesTypes';

// === Re-exports : types et constantes ===
export {
  WEEKEND_DELIVERY_SURCHARGE,
  HOLIDAY_SURCHARGE,
  DEFAULT_WEEKEND_FLAT_PRICE,
  type PricingInput,
  type PricingRuleApplied,
  type PricingBreakdown,
} from './pricingRulesTypes';

// === Re-exports : moteur de calcul ===
export {
  shouldApplyWeekendFlatRate,
  calculateDeliverySurcharges,
  calculatePricingBreakdown,
  calculateCartItemPriceWithRules,
} from './pricingRulesEngine';

// === Fonctions de formatage et sérialisation ===

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
