/**
 * Extended pricing tests — weekend/weekday surcharges & edge cases
 */
import { describe, it, expect } from 'vitest';
import { isWeekend } from '../dateHolidays';
import {
  calculateDeliverySurcharges,
  WEEKEND_DELIVERY_SURCHARGE,
  calculatePricingBreakdown,
} from '../pricingRules';
import { calculateLocagamePrice } from '../pricing';
import type { Product } from '../../types';

// ─── isWeekend — specific dates from task ──────────────────────

describe('isWeekend — april 2026 specifics', () => {
  it('samedi 4 avril 2026 = true', () => {
    expect(isWeekend('2026-04-04')).toBe(true);
  });

  it('dimanche 5 avril 2026 = true', () => {
    expect(isWeekend('2026-04-05')).toBe(true);
  });

  it('lundi 6 avril 2026 = false (weekend-wise, even though Easter Monday)', () => {
    expect(isWeekend('2026-04-06')).toBe(false);
  });

  it('vendredi 3 avril 2026 = false', () => {
    expect(isWeekend('2026-04-03')).toBe(false);
  });
});

// ─── Weekend delivery surcharge = 47€ ─────────────────────────

describe('delivery surcharge — weekend vs weekday', () => {
  it('surcharge is 47€ when delivery on a Saturday', () => {
    const surcharges = calculateDeliverySurcharges(
      '2026-04-04', // Samedi
      '2026-04-06', // Lundi
      true, false
    );

    expect(surcharges).toHaveLength(1);
    expect(surcharges[0].amount).toBe(47);
    expect(surcharges[0].amount).toBe(WEEKEND_DELIVERY_SURCHARGE);
  });

  it('surcharge is 47€ when delivery on a Sunday', () => {
    const surcharges = calculateDeliverySurcharges(
      '2026-04-05', // Dimanche
      '2026-04-07', // Mardi
      true, false
    );

    expect(surcharges).toHaveLength(1);
    expect(surcharges[0].amount).toBe(47);
  });

  it('surcharge is 0€ (no surcharges) when delivery on a weekday', () => {
    const surcharges = calculateDeliverySurcharges(
      '2026-04-07', // Mardi (not holiday, not weekend)
      '2026-04-09', // Jeudi
      true, false
    );

    expect(surcharges).toHaveLength(0);
  });

  it('surcharge is 0€ when delivery on a Friday (not weekend)', () => {
    const surcharges = calculateDeliverySurcharges(
      '2026-04-03', // Vendredi
      '2026-04-07', // Mardi
      true, false
    );

    // Vendredi n'est pas un week-end, pas de surcharge
    expect(surcharges).toHaveLength(0);
  });
});

// ─── Holiday detection for delivery surcharges ─────────────────

describe('delivery surcharge — holidays', () => {
  it('1er mai = holiday surcharge', () => {
    const surcharges = calculateDeliverySurcharges(
      '2026-05-01', // Fête du Travail
      '2026-05-03',
      true, false
    );

    expect(surcharges.some(s => s.id === 'delivery_holiday_surcharge')).toBe(true);
  });

  it('14 juillet = holiday surcharge', () => {
    const surcharges = calculateDeliverySurcharges(
      '2026-07-14', // Fête Nationale
      '2026-07-16',
      true, false
    );

    expect(surcharges.some(s => s.id === 'delivery_holiday_surcharge')).toBe(true);
  });

  it('regular weekday = no surcharge at all', () => {
    const surcharges = calculateDeliverySurcharges(
      '2026-04-07', // Mardi
      '2026-04-09',
      true, false
    );

    expect(surcharges).toHaveLength(0);
  });
});

// ─── calculateLocagamePrice edge cases ─────────────────────────

describe('calculateLocagamePrice — edge cases', () => {
  it('0 days = 0€', () => {
    expect(calculateLocagamePrice(100, 0)).toBe(0);
  });

  it('price scales with base price', () => {
    // 1 day at 200€/j = 200
    expect(calculateLocagamePrice(200, 1)).toBe(200);
    // 2 days at 200€/j = 300 (200 + 50%)
    expect(calculateLocagamePrice(200, 2)).toBe(300);
  });

  it('1 day = exactly the daily price', () => {
    expect(calculateLocagamePrice(75, 1)).toBe(75);
    expect(calculateLocagamePrice(150, 1)).toBe(150);
  });
});

// ─── Full pricing breakdown with surcharges ────────────────────

const testProduct: Product & { weekend_flat_price: number } = {
  id: 'test-prod',
  name: 'Test Product',
  description: '',
  category_id: 'cat-1',
  images: [],
  specifications: {
    dimensions: null,
    weight: null,
    players: { min: 1, max: 4 },
    electricity: false,
    setup_time: 10,
  },
  pricing: { oneDay: 60, weekend: 100, week: 250, custom: 0 },
  total_stock: 5,
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  multi_day_coefficient: 1.0,
  weekend_flat_price: 150,
};

describe('calculatePricingBreakdown — surcharge integration', () => {
  it('weekend delivery adds 47€ surcharge to total', () => {
    const breakdown = calculatePricingBreakdown({
      product: testProduct,
      startDate: '2026-04-04', // Samedi
      endDate: '2026-04-05',   // Dimanche
      deliveryIsMandatory: true,
      deliveryDate: '2026-04-04',
    });

    expect(breakdown.surchargesTotal).toBe(47);
    expect(breakdown.total).toBe(breakdown.productSubtotal + 47);
  });

  it('weekday delivery has 0€ surcharge', () => {
    const breakdown = calculatePricingBreakdown({
      product: testProduct,
      startDate: '2026-04-07', // Mardi (not holiday)
      endDate: '2026-04-08',   // Mercredi
      deliveryIsMandatory: true,
      deliveryDate: '2026-04-07',
    });

    expect(breakdown.surchargesTotal).toBe(0);
    expect(breakdown.total).toBe(breakdown.productSubtotal);
  });

  it('quantity multiplies product subtotal but not surcharges', () => {
    const breakdown = calculatePricingBreakdown({
      product: testProduct,
      startDate: '2026-04-04', // Samedi
      endDate: '2026-04-05',   // Dimanche
      quantity: 3,
      deliveryIsMandatory: true,
      deliveryDate: '2026-04-04',
    });

    // Product subtotal is multiplied by 3
    expect(breakdown.productSubtotal).toBe(breakdown.basePrice * 3);
    // Surcharge stays 47€ (not multiplied by quantity)
    expect(breakdown.surchargesTotal).toBe(47);
  });
});
