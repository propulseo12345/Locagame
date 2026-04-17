import { useState, useEffect, useMemo } from 'react';
import { Product, PriceCalculation } from '../types';
import { calculateDurationDays } from '../utils/pricing';
import { calculatePricingBreakdown } from '../utils/pricingRulesEngine';
import { DeliveryModeSelector } from './price-calculator/DeliveryModeSelector';
import { PriceSummary } from './price-calculator/PriceSummary';

interface PriceCalculatorProps {
  product: Product;
  startDate?: string;
  endDate?: string;
  quantity: number;
  onPriceChange: (calculation: PriceCalculation) => void;
}

export default function PriceCalculator({
  product, startDate, endDate, quantity, onPriceChange
}: PriceCalculatorProps) {
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup');

  const durationDays = startDate && endDate
    ? calculateDurationDays(startDate, endDate)
    : 1;

  // Calcul via le vrai moteur de pricing (paliers, coefficient, forfait WE…)
  const breakdown = useMemo(() => {
    if (!startDate || !endDate) return null;
    return calculatePricingBreakdown({
      product,
      startDate,
      endDate,
      quantity,
    });
  }, [product, startDate, endDate, quantity]);

  const productPrice = breakdown?.productSubtotal ?? 0;
  const deliveryFee = 0; // Calculé au checkout avec l'adresse réelle
  const totalPrice = productPrice + (breakdown?.surchargesTotal ?? 0);

  // Mettre a jour le prix parent
  useEffect(() => {
    if (startDate && endDate && breakdown) {
      const calculation: PriceCalculation = {
        product_price: productPrice,
        delivery_fee: deliveryFee,
        total: totalPrice,
        duration_days: durationDays,
        delivery_mode: deliveryMode,
      };
      onPriceChange(calculation);
    }
  }, [productPrice, deliveryFee, totalPrice, durationDays, startDate, endDate, deliveryMode]);

  if (!startDate || !endDate || !breakdown) return null;

  return (
    <div className="space-y-5">
      <DeliveryModeSelector deliveryMode={deliveryMode} setDeliveryMode={setDeliveryMode} />

      <PriceSummary
        deliveryMode={deliveryMode}
        durationDays={durationDays}
        quantity={quantity}
        productPrice={productPrice}
        deliveryFee={deliveryFee}
        totalPrice={totalPrice}
        distance={null}
        breakdown={breakdown}
      />
    </div>
  );
}
