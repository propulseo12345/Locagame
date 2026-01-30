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
import {
  isFrenchHoliday,
  isWeekend,
  isWeekendPattern,
  calculateEasterDate,
  periodContainsWeekend,
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
      expect(calculateEasterDate(2024).toISOString().split('T')[0]).toBe('2024-03-31');
      expect(calculateEasterDate(2025).toISOString().split('T')[0]).toBe('2025-04-20');
      expect(calculateEasterDate(2026).toISOString().split('T')[0]).toBe('2026-04-05');
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

    it('should use standard pricing for babyfoot on weekday', () => {
      const breakdown = calculatePricingBreakdown({
        product: babyfootProduct,
        startDate: '2026-02-02', // Lundi
        endDate: '2026-02-03',   // Mardi
      });

      expect(breakdown.weekendFlatRateApplied).toBe(false);
      // 2 jours = tarif weekend (80€)
      expect(breakdown.basePrice).toBe(80);
    });

    it('should use standard pricing for product without weekend_flat_price', () => {
      const breakdown = calculatePricingBreakdown({
        product: regularProduct,
        startDate: '2026-01-30', // Vendredi
        endDate: '2026-02-01',   // Dimanche
      });

      expect(breakdown.weekendFlatRateApplied).toBe(false);
      // Calcul standard: 3 jours = tarif weekend (70€)
      expect(breakdown.basePrice).toBe(70);
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
      // + Majoration livraison week-end: 50€
      // + Majoration reprise week-end: 50€
      // Total: 350€
      expect(breakdown.productSubtotal).toBe(250);
      expect(breakdown.surchargesTotal).toBe(100);
      expect(breakdown.total).toBe(350);
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
});
