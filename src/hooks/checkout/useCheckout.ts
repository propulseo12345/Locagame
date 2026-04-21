import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProductsService } from '../../services';
import { useCheckoutForm, useCheckoutPricing, useCheckoutValidation, useCheckoutSubmit, type CheckoutStep } from './index';
import { isWeekendOrHoliday } from '../../utils/dateHolidays';

export const CHECKOUT_STEPS: { id: CheckoutStep; label: string }[] = [
  { id: 'customer', label: 'Vos coordonnées' },
  { id: 'recipient', label: 'Réception' },
  { id: 'delivery', label: 'Livraison' },
  { id: 'payment', label: 'Récapitulatif' },
];

interface PromoState {
  code: string;
  label: string;
  discount_type: 'percentage' | 'fixed' | '';
  discount_value: number;
}

const EMPTY_PROMO: PromoState = { code: '', label: '', discount_type: '', discount_value: 0 };

export function useCheckout() {
  const { items: cartItems = [], clearCart } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('customer');
  const [unavailableProducts, setUnavailableProducts] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(true);

  // Promo state is local to the checkout session — user must enter it manually
  const [promo, setPromo] = useState<PromoState>(EMPTY_PROMO);
  const promoCode = promo.code;
  const promoLabel = promo.label;

  const applyPromo = (code: string, discountType: 'percentage' | 'fixed', discountValue: number, label: string) => {
    setPromo({ code, label, discount_type: discountType, discount_value: discountValue });
  };

  const removePromo = () => {
    setPromo(EMPTY_PROMO);
  };

  useEffect(() => {
    if (cartItems.length === 0) return;
    let cancelled = false;
    const check = async () => {
      setCheckingAvailability(true);
      const unavail: string[] = [];
      try {
        const ids = [...new Set(cartItems.map(i => i.product.id))];
        const activeIds = await ProductsService.getActiveProductIds(ids);
        for (const item of cartItems) {
          if (!activeIds.has(item.product.id)) { unavail.push(item.product.name); continue; }
          if (!item.start_date || !item.end_date) continue;
          try {
            if (!await ProductsService.checkAvailability(item.product.id, item.start_date, item.end_date, item.quantity))
              unavail.push(item.product.name);
          } catch { /* server validates */ }
        }
      } catch { /* server validates */ }
      if (!cancelled) { setUnavailableProducts(unavail); setCheckingAvailability(false); }
    };
    check();
    return () => { cancelled = true; };
  }, [cartItems]);

  const form = useCheckoutForm();
  const cartStart = cartItems[0]?.start_date || '';
  const cartEnd = cartItems[0]?.end_date || '';
  useEffect(() => {
    if (!cartStart || !cartEnd || (form.delivery.date && form.delivery.pickupDate)) return;
    const u: Partial<typeof form.delivery> = {};
    if (!form.delivery.date) u.date = cartStart;
    if (!form.delivery.pickupDate) u.pickupDate = cartEnd;
    if (Object.keys(u).length > 0) form.setDelivery(prev => ({ ...prev, ...u }));
    if (isWeekendOrHoliday(cartStart) && !form.deliveryIsMandatory) form.setDeliveryIsMandatory(true);
    if (isWeekendOrHoliday(cartEnd) && !form.pickupIsMandatory) form.setPickupIsMandatory(true);
  }, [cartStart, cartEnd]);

  const pricing = useCheckoutPricing({
    cartItems, delivery: form.delivery, isPickup: form.isPickup,
    deliveryIsMandatory: form.deliveryIsMandatory, pickupIsMandatory: form.pickupIsMandatory,
    startSlot: form.startSlot, endSlot: form.endSlot,
  });

  // Compute promo discount dynamically from stored type/value + current subtotal
  // This is the single source of truth for the frontend display
  const subtotalForPromo = pricing.productsSubtotal + pricing.surchargesTotal;
  const promoDiscount = useMemo(() => {
    if (!promo.code || !promo.discount_type || !promo.discount_value) return 0;
    let d: number;
    if (promo.discount_type === 'percentage') {
      d = Math.round(subtotalForPromo * promo.discount_value / 100 * 100) / 100;
    } else {
      d = Math.min(promo.discount_value, subtotalForPromo);
    }
    return Math.min(d, pricing.finalTotal);
  }, [promo.code, promo.discount_type, promo.discount_value, subtotalForPromo, pricing.finalTotal]);

  const validation = useCheckoutValidation({
    customer: form.customer, billingAddress: form.billingAddress, recipient: form.recipient,
    delivery: form.delivery, pickup: form.pickup, eventDetails: form.eventDetails,
    payment: form.payment, isPickup: form.isPickup, timeSlots: form.timeSlots,
  });
  const submit = useCheckoutSubmit({
    cartItems, user: user ? { id: user.id, email: user.email || '' } : null,
    customer: form.customer, billingAddress: form.billingAddress, recipient: form.recipient,
    delivery: form.delivery, pickup: form.pickup, eventDetails: form.eventDetails,
    payment: form.payment, isPickup: form.isPickup, startSlot: form.startSlot, endSlot: form.endSlot,
    deliveryIsMandatory: form.deliveryIsMandatory, pickupIsMandatory: form.pickupIsMandatory,
    selectedDeliveryMode: form.selectedDeliveryMode, pricingBreakdowns: pricing.pricingBreakdowns,
    productsSubtotal: pricing.productsSubtotal, surchargesTotal: pricing.surchargesTotal,
    finalTotal: pricing.finalTotal - promoDiscount, calculatedDeliveryFee: pricing.calculatedDeliveryFee,
    deliveryDistance: pricing.deliveryDistance, clearCart,
    validatePayment: () => validation.validateStep('payment'),
    promoCode, promoDiscount,
  });

  // Pre-fill customer from user profile
  useEffect(() => {
    if (!user) return;
    form.setCustomer(prev => ({
      ...prev, firstName: prev.firstName || user.firstName || '',
      lastName: prev.lastName || user.lastName || '', email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '', companyName: prev.companyName || user.companyName || '',
    }));
  }, [user]);

  const stepIdx = CHECKOUT_STEPS.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (!validation.validateStep(currentStep)) return;
    if (stepIdx < CHECKOUT_STEPS.length - 1) { setCurrentStep(CHECKOUT_STEPS[stepIdx + 1].id); window.scrollTo(0, 0); }
  };

  const handlePrevious = () => {
    if (stepIdx > 0) { setCurrentStep(CHECKOUT_STEPS[stepIdx - 1].id); window.scrollTo(0, 0); }
  };

  const adjustedFinalTotal = pricing.finalTotal - promoDiscount;

  return {
    steps: CHECKOUT_STEPS, currentStep, currentStepIndex: stepIdx,
    handleNext, handlePrevious, cartItems, form, pricing, validation,
    handleSubmit: submit.handleSubmit, isProcessing: submit.isProcessing, submitError: submit.submitError,
    unavailableProducts, checkingAvailability,
    promoCode, promoDiscount, promoLabel,
    applyPromo, removePromo, adjustedFinalTotal,
  };
}
