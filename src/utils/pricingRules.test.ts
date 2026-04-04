/**
 * Tests unitaires pour le module de règles tarifaires
 * npm test -- pricingRules.test.ts
 *
 * Date de référence: 30 janvier 2026, 12:59 (Europe/Paris)
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePricingBreakdown,
  shouldApplyWeekendFlatRate,
  calculateDeliverySurcharges,
  WEEKEND_DELIVERY_SURCHARGE,
  HOLIDAY_SURCHARGE,
} from './pricingRules';
import { calculateLocagameDays, calculateLocagamePrice } from './pricing';
import {
  isFrenchHoliday,
  isWeekend,
  isWeekendPattern,
  calculateEasterDate,
  periodContainsWeekend,
  toLocalISODate,
} from './dateHolidays';
import { REFERENCE_TIME } from '../constants/time';
import type { Product } from '../types';

// Vérification de cohérence temporelle
const EXPECTED_YEAR = 2026;
const EXPECTED_DATE = '2026-01-30';

// Produit de test: Babyfoot avec forfait week-end
const babyfootProduct: Product & { weekend_flat_price: number } = {
  id: 'test-babyfoot',
  name: 'Babyfoot Professionnel',
  description: 'Un babyfoot de qualité professionnelle',
  category_id: 'cat-1',
  images: ['/images/babyfoot.jpg'],
  specifications: {
    dimensions: '150x120x90 cm',
    weight: 80,
    players: { min: 2, max: 4 },
    electricity: false,
    setup_time: 15,
  },
  pricing: {
    oneDay: 50,
    weekend: 80,
    week: 200,
    custom: 0,
  },
  total_stock: 5,
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  multi_day_coefficient: 1.0,
  weekend_flat_price: 125,
};

// Produit sans forfait week-end
const regularProduct: Product = {
  id: 'test-regular',
  name: 'Produit Standard',
  description: 'Un produit standard',
  category_id: 'cat-1',
  images: [],
  specifications: {
    dimensions: '100x100x100 cm',
    weight: 50,
    players: { min: 1, max: 8 },
    electricity: false,
    setup_time: 10,
  },
  pricing: {
    oneDay: 40,
    weekend: 70,
    week: 180,
    custom: 0,
  },
  total_stock: 3,
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('dateHolidays', () => {
  describe('isFrenchHoliday', () => {
    it('should detect fixed holidays', () => {
      // Année 2026 (année de référence)
      expect(isFrenchHoliday('2026-01-01')).toBe(true); // Jour de l'an
      expect(isFrenchHoliday('2026-05-01')).toBe(true); // Fête du Travail
      expect(isFrenchHoliday('2026-05-08')).toBe(true); // Victoire 1945
      expect(isFrenchHoliday('2026-07-14')).toBe(true); // Fête Nationale
      expect(isFrenchHoliday('2026-08-15')).toBe(true); // Assomption
      expect(isFrenchHoliday('2026-11-01')).toBe(true); // Toussaint
      expect(isFrenchHoliday('2026-11-11')).toBe(true); // Armistice
      expect(isFrenchHoliday('2026-12-25')).toBe(true); // Noël
    });

    it('should not detect regular days as holidays', () => {
      expect(isFrenchHoliday('2026-01-02')).toBe(false);
      expect(isFrenchHoliday('2026-06-15')).toBe(false);
      expect(isFrenchHoliday('2026-10-10')).toBe(false);
    });

    it('should detect Easter-based movable holidays for 2026', () => {
      // Pâques 2026 est le 5 avril
      expect(isFrenchHoliday('2026-04-06')).toBe(true); // Lundi de Pâques (5 avril + 1)
      expect(isFrenchHoliday('2026-05-14')).toBe(true); // Ascension (5 avril + 39)
      expect(isFrenchHoliday('2026-05-25')).toBe(true); // Lundi de Pentecôte (5 avril + 50)
    });
  });

  describe('calculateEasterDate', () => {
    it('should calculate Easter dates correctly', () => {
      // Dates connues de Pâques
      expect(toLocalISODate(calculateEasterDate(2024))).toBe('2024-03-31');
      expect(toLocalISODate(calculateEasterDate(2025))).toBe('2025-04-20');
      expect(toLocalISODate(calculateEasterDate(2026))).toBe('2026-04-05');
    });
  });

  describe('isWeekend', () => {
    it('should detect weekends', () => {
      // Dates en 2026 (année de référence)
      expect(isWeekend('2026-01-31')).toBe(true); // Samedi
      expect(isWeekend('2026-02-01')).toBe(true); // Dimanche
      expect(isWeekend('2026-02-02')).toBe(false); // Lundi
      expect(isWeekend('2026-01-30')).toBe(false); // Vendredi (date de référence)
    });
  });

  describe('periodContainsWeekend', () => {
    it('should detect periods containing weekend', () => {
      // Lundi à Vendredi (pas de week-end) - semaine du 2 février 2026
      expect(periodContainsWeekend('2026-02-02', '2026-02-06')).toBe(false);
      // Vendredi à Lundi (contient samedi/dimanche)
      expect(periodContainsWeekend('2026-01-30', '2026-02-02')).toBe(true);
      // Samedi seul
      expect(periodContainsWeekend('2026-01-31', '2026-01-31')).toBe(true);
    });
  });

  describe('isWeekendPattern', () => {
    it('should detect Friday PM to Monday AM pattern', () => {
      // Vendredi 30 janvier 2026 PM -> Lundi 2 février 2026 AM
      expect(isWeekendPattern('2026-01-30', '2026-02-02', 'PM', 'AM')).toBe(true);
    });

    it('should not detect invalid patterns', () => {
      // Vendredi AM à Lundi AM (pas le bon slot de départ)
      expect(isWeekendPattern('2026-01-30', '2026-02-02', 'AM', 'AM')).toBe(false);
      // Jeudi PM à Lundi AM (pas le bon jour de départ)
      expect(isWeekendPattern('2026-01-29', '2026-02-02', 'PM', 'AM')).toBe(false);
    });
  });
});

describe('pricingRules', () => {
  describe('shouldApplyWeekendFlatRate', () => {
    it('should apply for weekend pattern (Fri PM -> Mon AM)', () => {
      // Vendredi 30 janvier 2026 PM -> Lundi 2 février 2026 AM
      expect(shouldApplyWeekendFlatRate('2026-01-30', '2026-02-02', 'PM', 'AM')).toBe(true);
    });

    it('should apply when period contains weekend', () => {
      // Vendredi 30 janvier à dimanche 1 février 2026
      expect(shouldApplyWeekendFlatRate('2026-01-30', '2026-02-01')).toBe(true);
    });

    it('should not apply for weekday-only periods', () => {
      // Lundi 2 à Mercredi 4 février 2026
      expect(shouldApplyWeekendFlatRate('2026-02-02', '2026-02-04')).toBe(false);
    });
  });

  describe('calculateDeliverySurcharges', () => {
    it('should add surcharge for mandatory weekend delivery', () => {
      const surcharges = calculateDeliverySurcharges(
        '2026-01-31', // Samedi 31 janvier 2026
        '2026-02-02', // Lundi 2 février 2026
        true, // delivery mandatory
        false // pickup not mandatory
      );
      expect(surcharges).toHaveLength(1);
      expect(surcharges[0].id).toBe('delivery_weekend_surcharge');
      expect(surcharges[0].amount).toBe(WEEKEND_DELIVERY_SURCHARGE);
    });

    it('should add surcharge for mandatory holiday delivery', () => {
      const surcharges = calculateDeliverySurcharges(
        '2026-12-25', // Noël 2026 (jour férié)
        '2026-12-26',
        true,
        false
      );
      expect(surcharges).toHaveLength(1);
      expect(surcharges[0].id).toBe('delivery_holiday_surcharge');
      expect(surcharges[0].amount).toBe(HOLIDAY_SURCHARGE);
    });

    it('should not add surcharge for non-mandatory delivery on weekend', () => {
      const surcharges = calculateDeliverySurcharges(
        '2026-01-31', // Samedi 31 janvier 2026
        '2026-02-02',
        false, // not mandatory
        false
      );
      expect(surcharges).toHaveLength(0);
    });

    it('should add both surcharges for mandatory delivery and pickup on weekend', () => {
      const surcharges = calculateDeliverySurcharges(
        '2026-01-31', // Samedi 31 janvier 2026
        '2026-02-01', // Dimanche 1 février 2026
        true,
        true
      );
      expect(surcharges).toHaveLength(2);
    });
  });

  describe('calculatePricingBreakdown', () => {
    it('should apply weekend flat rate for babyfoot over weekend', () => {
      const breakdown = calculatePricingBreakdown({
        product: babyfootProduct,
        startDate: '2026-01-30', // Vendredi (date de référence)
        endDate: '2026-02-01',   // Dimanche
        startSlot: 'PM',
        endSlot: 'AM',
      });

      expect(breakdown.weekendFlatRateApplied).toBe(true);
      expect(breakdown.basePrice).toBe(125);
      expect(breakdown.basePriceLabel).toBe('Forfait week-end');
      expect(breakdown.productSubtotal).toBe(125);
    });

    it('should use LOCAGAME pricing for babyfoot on weekday', () => {
      const breakdown = calculatePricingBreakdown({
        product: babyfootProduct,
        startDate: '2026-02-02', // Lundi
        endDate: '2026-02-03',   // Mardi
      });

      expect(breakdown.weekendFlatRateApplied).toBe(false);
      // 2 jours LOCAGAME: P + 50% = 50 + 25 = 75
      expect(breakdown.basePrice).toBe(75);
    });

    it('should use LOCAGAME pricing for product without weekend_flat_price', () => {
      const breakdown = calculatePricingBreakdown({
        product: regularProduct,
        startDate: '2026-01-30', // Vendredi
        endDate: '2026-02-01',   // Dimanche
      });

      expect(breakdown.weekendFlatRateApplied).toBe(false);
      // Ven-Dim = 1 jour LOCAGAME (sam/dim offerts, ven = 1j ouvré)
      // 1j LOCAGAME × 40€/j = 40€
      expect(breakdown.basePrice).toBe(40);
    });

    it('should add delivery surcharge for mandatory weekend delivery', () => {
      const breakdown = calculatePricingBreakdown({
        product: babyfootProduct,
        startDate: '2026-01-31', // Samedi
        endDate: '2026-02-01',   // Dimanche
        deliveryIsMandatory: true,
        deliveryDate: '2026-01-31', // Samedi
      });

      expect(breakdown.surchargesTotal).toBe(WEEKEND_DELIVERY_SURCHARGE);
      expect(breakdown.rulesApplied.some(r => r.id === 'delivery_weekend_surcharge')).toBe(true);
    });

    it('should correctly calculate total with surcharges', () => {
      const breakdown = calculatePricingBreakdown({
        product: babyfootProduct,
        startDate: '2026-01-31', // Samedi
        endDate: '2026-02-01',   // Dimanche
        quantity: 2,
        deliveryIsMandatory: true,
        pickupIsMandatory: true,
        deliveryDate: '2026-01-31', // Samedi
        pickupDate: '2026-02-01',   // Dimanche
      });

      // Forfait week-end: 125€ × 2 = 250€
      // + Majoration livraison week-end: 47€
      // + Majoration reprise week-end: 47€
      // Total: 344€
      expect(breakdown.productSubtotal).toBe(250);
      expect(breakdown.surchargesTotal).toBe(94);
      expect(breakdown.total).toBe(344);
    });

    it('should not add surcharge for non-mandatory delivery on weekend', () => {
      const breakdown = calculatePricingBreakdown({
        product: babyfootProduct,
        startDate: '2026-01-31', // Samedi
        endDate: '2026-02-01',
        deliveryIsMandatory: false,
        deliveryDate: '2026-01-31', // Samedi
      });

      expect(breakdown.surchargesTotal).toBe(0);
      expect(breakdown.infoMessage).toBeDefined();
    });

    it('should add holiday surcharge for Noel', () => {
      const breakdown = calculatePricingBreakdown({
        product: babyfootProduct,
        startDate: '2026-12-25', // Noël 2026
        endDate: '2026-12-26',
        deliveryIsMandatory: true,
        deliveryDate: '2026-12-25',
      });

      expect(breakdown.rulesApplied.some(r => r.id === 'delivery_holiday_surcharge')).toBe(true);
      expect(breakdown.surchargesTotal).toBe(HOLIDAY_SURCHARGE);
    });
  });

  describe('delivery people count multiplier', () => {
    it('should default to 1 person when no param provided', () => {
      const surcharges = calculateDeliverySurcharges(
        '2026-01-31', // Samedi
        '2026-02-02', // Lundi
        true,
        false
      );
      expect(surcharges).toHaveLength(1);
      expect(surcharges[0].amount).toBe(47);
    });

    it('should multiply surcharge by delivery people count', () => {
      const surcharges = calculateDeliverySurcharges(
        '2026-01-31', // Samedi
        '2026-02-02', // Lundi
        true,
        false,
        2, // 2 personnes livraison
        1
      );
      expect(surcharges).toHaveLength(1);
      expect(surcharges[0].amount).toBe(94); // 47 x 2
    });

    it('should multiply both delivery and pickup surcharges independently', () => {
      const surcharges = calculateDeliverySurcharges(
        '2026-01-31', // Samedi
        '2026-02-01', // Dimanche
        true,
        true,
        2, // 2 personnes livraison
        2  // 2 personnes reprise
      );
      expect(surcharges).toHaveLength(2);
      // Livraison: 47 x 2 = 94
      expect(surcharges[0].amount).toBe(94);
      // Reprise: 47 x 2 = 94
      expect(surcharges[1].amount).toBe(94);
      // Total: 188
      const total = surcharges.reduce((sum, s) => sum + s.amount, 0);
      expect(total).toBe(188);
    });

    it('should use product delivery_people_count in full breakdown', () => {
      const productWith2People = {
        ...babyfootProduct,
        delivery_people_count: 2,
        pickup_people_count: 3,
      };

      const breakdown = calculatePricingBreakdown({
        product: productWith2People,
        startDate: '2026-01-31', // Samedi
        endDate: '2026-02-01',   // Dimanche
        deliveryIsMandatory: true,
        pickupIsMandatory: true,
        deliveryDate: '2026-01-31',
        pickupDate: '2026-02-01',
        deliveryPeopleCount: 2,
        pickupPeopleCount: 3,
      });

      // Livraison: 47 x 2 = 94
      // Reprise: 47 x 3 = 141
      expect(breakdown.surchargesTotal).toBe(235);
    });

    it('should include people count in surcharge description', () => {
      const surcharges = calculateDeliverySurcharges(
        '2026-01-31', // Samedi
        '2026-02-02',
        true,
        false,
        3,
        1
      );
      expect(surcharges[0].description).toContain('3 pers.');
      expect(surcharges[0].description).toContain('47');
    });
  });
});

describe('calculateLocagameDays — bloc week-end', () => {
  test('Ven→Lun = 1 jour', () => {
    // 2026-04-10 = Vendredi, 2026-04-13 = Lundi
    expect(calculateLocagameDays(
      new Date('2026-04-10'), new Date('2026-04-13')
    )).toBe(1);
  });

  test('Sam seul = 1 jour', () => {
    expect(calculateLocagameDays(
      new Date('2026-04-11'), new Date('2026-04-11')
    )).toBe(1);
  });

  test('Sam+Dim = 1 jour', () => {
    expect(calculateLocagameDays(
      new Date('2026-04-11'), new Date('2026-04-12')
    )).toBe(1);
  });

  test('Sam→Mar = 2 jours', () => {
    expect(calculateLocagameDays(
      new Date('2026-04-11'), new Date('2026-04-14')
    )).toBe(2);
  });

  test('Ven→Mer = 3 jours', () => {
    expect(calculateLocagameDays(
      new Date('2026-04-10'), new Date('2026-04-15')
    )).toBe(3);
  });

  test('Dim seul = 1 jour', () => {
    expect(calculateLocagameDays(
      new Date('2026-04-12'), new Date('2026-04-12')
    )).toBe(1);
  });

  test('Dim→Mar = 2 jours', () => {
    expect(calculateLocagameDays(
      new Date('2026-04-12'), new Date('2026-04-14')
    )).toBe(2);
  });

  test('Lun seul = 1 jour', () => {
    expect(calculateLocagameDays(
      new Date('2026-04-13'), new Date('2026-04-13')
    )).toBe(1);
  });

  test('Lun→Ven = 5 jours', () => {
    // Lun+Mar+Mer+Jeu+Ven(bloc) = 5 jours
    expect(calculateLocagameDays(
      new Date('2026-04-13'), new Date('2026-04-17')
    )).toBe(5);
  });

  test('Mar seul = 1 jour', () => {
    expect(calculateLocagameDays(
      new Date('2026-04-14'), new Date('2026-04-14')
    )).toBe(1);
  });

  test('Lun→Lun (1 semaine) = 5 jours', () => {
    // 2026-04-06 (Lun) → 2026-04-13 (Lun)
    // Lun6+Mar7+Mer8+Jeu9+Ven10(bloc, skip to Mar14)→14>13 STOP = 5
    expect(calculateLocagameDays(
      new Date('2026-04-06'), new Date('2026-04-13')
    )).toBe(5);
  });

  test('accepts string dates', () => {
    expect(calculateLocagameDays('2026-04-10', '2026-04-13')).toBe(1);
    expect(calculateLocagameDays('2026-04-13', '2026-04-17')).toBe(5);
  });

  test('end < start = 0', () => {
    expect(calculateLocagameDays(
      new Date('2026-04-15'), new Date('2026-04-10')
    )).toBe(0);
  });

  test('Mon→Fri across 2 weeks = 9 jours', () => {
    // Mon9→Fri20: Mon+Tue+Wed+Thu+Fri(bloc→Tue17)+Tue+Wed+Thu+Fri(bloc→Tue24) = 9
    expect(calculateLocagameDays('2026-03-09', '2026-03-20')).toBe(9);
  });
});

describe('calculateLocagamePrice', () => {
  const P = 100;

  it('should return P for 1 day', () => {
    expect(calculateLocagamePrice(P, 1)).toBe(100);
  });

  it('should return P + 50% for 2 days', () => {
    expect(calculateLocagamePrice(P, 2)).toBe(150);
  });

  it('should return 180 for 3 days', () => {
    // P + (P*0.5*2) * (1-20%) = 100 + 80 = 180
    expect(calculateLocagamePrice(P, 3)).toBe(180);
  });

  it('should return 205 for 4 days', () => {
    // P + (P*0.5*3) * (1-30%) = 100 + 105 = 205
    expect(calculateLocagamePrice(P, 4)).toBe(205);
  });

  it('should return 220 for 5 days (1 semaine)', () => {
    // P + (P*0.5*4) * (1-40%) = 100 + 120 = 220
    expect(calculateLocagamePrice(P, 5)).toBe(220);
  });

  it('should return 256.67 for 6 days (semaine + 1j)', () => {
    // semainePrice=220, extraDayRate=220/6=36.67, total=220+36.67=256.67
    expect(calculateLocagamePrice(P, 6)).toBeCloseTo(256.67, 2);
  });

  it('should return ~330 for 8 days (semaine + 3j)', () => {
    // semainePrice=220, extraDayRate=ROUND2(220/6)=36.67
    // 220 + 3*36.67 = 330.01 (rounding artifact)
    expect(calculateLocagamePrice(P, 8)).toBeCloseTo(330, 0);
  });

  it('should return ~403.33 for 10 days (semaine + 5j)', () => {
    // 220 + 5*36.67 = 403.35 (rounding artifact)
    expect(calculateLocagamePrice(P, 10)).toBeCloseTo(403.33, 0);
  });
});
