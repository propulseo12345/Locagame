/**
 * Types et constantes pour les règles tarifaires LOCAGAME
 */

import { Product } from '../types';
import { DaySlot } from './dateHolidays';

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
