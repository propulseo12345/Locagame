import { useState, useEffect } from 'react';
import { Product, PriceCalculation } from '../types';
import { PRICE_PER_KM, estimateDistance, calculateHaversineDistance } from './price-calculator/constants';
import { DeliveryModeSelector } from './price-calculator/DeliveryModeSelector';
import { DeliveryForm } from './price-calculator/DeliveryForm';
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
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const durationDays = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  const getProductPrice = () => {
    const { pricing } = product;
    if (durationDays === 1) return pricing.oneDay;
    if (durationDays >= 2 && durationDays <= 3) return pricing.weekend;
    if (durationDays >= 4 && durationDays <= 7) return pricing.week;
    return pricing.custom * durationDays;
  };

  const productPrice = getProductPrice() * quantity;
  const deliveryFee = deliveryMode === 'delivery' && distance ? Math.round(distance * PRICE_PER_KM * 100) / 100 : 0;
  const totalPrice = productPrice + deliveryFee;

  // Calculer la distance quand le code postal change
  useEffect(() => {
    if (deliveryMode === 'delivery' && postalCode.length === 5) {
      calculateDistance();
    } else if (deliveryMode === 'pickup') {
      setDistance(null);
    }
  }, [postalCode, deliveryMode]);

  // Mettre a jour le prix parent
  useEffect(() => {
    if (startDate && endDate) {
      const calculation: PriceCalculation = {
        product_price: productPrice,
        delivery_fee: deliveryFee,
        total: totalPrice,
        duration_days: durationDays,
        delivery_mode: deliveryMode,
        delivery_address: address || undefined,
        delivery_city: city || undefined,
        delivery_postal_code: postalCode || undefined,
        delivery_distance: distance || undefined
      };
      onPriceChange(calculation);
    }
  }, [productPrice, deliveryFee, totalPrice, durationDays, startDate, endDate, deliveryMode, distance, address, city, postalCode]);

  const calculateDistance = () => {
    setIsCalculating(true);
    setGeoError('');

    setTimeout(() => {
      const estimated = estimateDistance(postalCode);
      if (estimated !== null) {
        setDistance(estimated);
      } else {
        setGeoError('Zone de livraison tres eloignee. Contactez-nous pour un devis.');
        setDistance(null);
      }
      setIsCalculating(false);
    }, 500);
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('La geolocalisation n\'est pas disponible');
      return;
    }

    setIsCalculating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const roadDistance = calculateHaversineDistance(latitude, longitude);
        setDistance(roadDistance);
        setIsCalculating(false);
      },
      () => {
        setGeoError('Impossible d\'obtenir votre position');
        setIsCalculating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!startDate || !endDate) return null;

  return (
    <div className="space-y-5">
      <DeliveryModeSelector deliveryMode={deliveryMode} setDeliveryMode={setDeliveryMode} />

      {deliveryMode === 'delivery' && (
        <DeliveryForm
          postalCode={postalCode}
          setPostalCode={setPostalCode}
          address={address}
          setAddress={setAddress}
          city={city}
          setCity={setCity}
          distance={distance}
          isCalculating={isCalculating}
          geoError={geoError}
          deliveryFee={deliveryFee}
          onUseGeolocation={handleUseGeolocation}
        />
      )}

      <PriceSummary
        deliveryMode={deliveryMode}
        durationDays={durationDays}
        quantity={quantity}
        productPrice={productPrice}
        deliveryFee={deliveryFee}
        totalPrice={totalPrice}
        distance={distance}
      />
    </div>
  );
}
