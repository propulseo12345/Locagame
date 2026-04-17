import { useState, useEffect, useCallback } from 'react';
import type { CartItem, DaySlot } from '../../types';
import {
  calculatePricingBreakdown,
  type PricingBreakdown,
} from '../../utils/pricingRules';
import { isWeekendOrHoliday } from '../../utils/dateHolidays';
import { DistanceService, calculateDeliveryFeeFromCoords } from '../../services/distance.service';
import type { DeliveryState } from './types';
import { logger } from '../../lib/logger';

interface UseCheckoutPricingArgs {
  cartItems: CartItem[];
  delivery: DeliveryState;
  isPickup: boolean;
  deliveryIsMandatory: boolean;
  pickupIsMandatory: boolean;
  startSlot: DaySlot;
  endSlot: DaySlot;
}

interface CheckoutPricingReturn {
  pricingBreakdowns: PricingBreakdown[];
  productsSubtotal: number;
  surchargesTotal: number;
  finalTotal: number;
  calculatedDeliveryFee: number;
  deliveryDistance: number;
  isCalculatingFee: boolean;
  deliveryError: string;
  deliveryDateIsWeekendOrHoliday: boolean;
  pickupDateIsWeekendOrHoliday: boolean;
  pricingInfoMessage: string | undefined;
  calculateFromCoords: (lat: number, lng: number) => Promise<void>;
}

export function useCheckoutPricing({
  cartItems,
  delivery,
  isPickup,
  deliveryIsMandatory,
  pickupIsMandatory,
  startSlot,
  endSlot,
}: UseCheckoutPricingArgs): CheckoutPricingReturn {
  // Delivery fee calculation (ORS)
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(0);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');

  // Pricing breakdowns per cart item
  const pricingBreakdowns: PricingBreakdown[] = cartItems.map(item => {
    const effectiveDeliveryDate = isPickup ? item.start_date : (delivery.date || item.start_date);
    const effectivePickupDate = isPickup ? item.end_date : (delivery.pickupDate || item.end_date);

    return calculatePricingBreakdown({
      product: item.product,
      startDate: item.start_date,
      endDate: item.end_date,
      startSlot,
      endSlot,
      quantity: item.quantity,
      deliveryIsMandatory: !isPickup && deliveryIsMandatory,
      pickupIsMandatory: !isPickup && pickupIsMandatory,
      deliveryDate: effectiveDeliveryDate,
      pickupDate: effectivePickupDate,
      deliveryPeopleCount: item.product.delivery_people_count ?? 1,
      pickupPeopleCount: item.product.pickup_people_count ?? 1,
    });
  });

  const productsSubtotal = pricingBreakdowns.reduce((sum, b) => sum + b.productSubtotal, 0);
  const surchargesTotal = pricingBreakdowns.reduce((sum, b) => sum + b.surchargesTotal, 0);
  const finalTotal = isPickup
    ? productsSubtotal + surchargesTotal
    : productsSubtotal + calculatedDeliveryFee + surchargesTotal;

  const deliveryDateIsWeekendOrHoliday = !!delivery.date && isWeekendOrHoliday(delivery.date);
  const pickupDateIsWeekendOrHoliday = !!delivery.pickupDate && isWeekendOrHoliday(delivery.pickupDate);
  const pricingInfoMessage = pricingBreakdowns.find(b => b.infoMessage)?.infoMessage;

  // Calculate delivery fee from address via ORS
  const calculateDeliveryFeeFromAddress = useCallback(async () => {
    if (isPickup || !delivery.address || !delivery.city || !delivery.postalCode) {
      setCalculatedDeliveryFee(0);
      setDeliveryDistance(0);
      setDeliveryError('');
      return;
    }

    setIsCalculatingFee(true);
    setDeliveryError('');
    try {
      const result = await DistanceService.calculateDeliveryFee(
        delivery.address,
        delivery.city,
        delivery.postalCode,
      );

      if (result.success) {
        setDeliveryDistance(result.distanceKm);
        setCalculatedDeliveryFee(result.deliveryFee);
        setDeliveryError('');
      } else {
        setDeliveryDistance(result.distanceKm);
        setCalculatedDeliveryFee(0);
        setDeliveryError(result.error ?? 'Erreur de calcul');
      }
    } catch (error) {
      logger.error('Erreur calcul frais', error);
      setDeliveryError('Erreur lors du calcul des frais de livraison');
      setCalculatedDeliveryFee(0);
    } finally {
      setIsCalculatingFee(false);
    }
  }, [delivery.address, delivery.city, delivery.postalCode, isPickup]);

  // Debounced address fee calculation (500ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (delivery.address && delivery.city && delivery.postalCode) {
        calculateDeliveryFeeFromAddress();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [delivery.address, delivery.city, delivery.postalCode, calculateDeliveryFeeFromAddress]);

  // Instant calculation from autocomplete coords (skip geocoding)
  const calculateFromCoords = useCallback(async (lat: number, lng: number) => {
    setIsCalculatingFee(true);
    setDeliveryError('');
    try {
      const result = await calculateDeliveryFeeFromCoords(lat, lng);
      if (result.success) {
        setDeliveryDistance(result.distanceKm);
        setCalculatedDeliveryFee(result.deliveryFee);
        setDeliveryError('');
      } else {
        setDeliveryDistance(result.distanceKm);
        setCalculatedDeliveryFee(0);
        setDeliveryError(result.error ?? 'Erreur de calcul');
      }
    } catch (error) {
      logger.error('Erreur calcul frais coords', error);
      setDeliveryError('Erreur lors du calcul des frais');
      setCalculatedDeliveryFee(0);
    } finally {
      setIsCalculatingFee(false);
    }
  }, []);

  return {
    pricingBreakdowns,
    productsSubtotal,
    surchargesTotal,
    finalTotal,
    calculatedDeliveryFee,
    deliveryDistance,
    isCalculatingFee,
    deliveryError,
    deliveryDateIsWeekendOrHoliday,
    pickupDateIsWeekendOrHoliday,
    pricingInfoMessage,
    calculateFromCoords,
  };
}
