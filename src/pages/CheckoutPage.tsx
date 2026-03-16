import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  User,
  UserCheck,
  MapPin,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Lock,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ProductsService } from '../services';
import {
  useCheckoutForm,
  useCheckoutPricing,
  useCheckoutValidation,
  useCheckoutSubmit,
  type CheckoutStep,
} from '../hooks/checkout';
import { CheckoutCustomerStep } from '../components/checkout/CheckoutCustomerStep';
import { CheckoutRecipientStep } from '../components/checkout/CheckoutRecipientStep';
import { CheckoutDeliveryStep } from '../components/checkout/CheckoutDeliveryStep';
import { CheckoutSummaryStep } from '../components/checkout/CheckoutSummaryStep';
import { AuthModal } from '../components/auth/AuthModal';
import { isWeekendOrHoliday } from '../utils/dateHolidays';

const steps = [
  { id: 'customer', label: 'Vos coordonnees', icon: User },
  { id: 'recipient', label: 'Reception', icon: UserCheck },
  { id: 'delivery', label: 'Livraison', icon: MapPin },
  { id: 'payment', label: 'Recapitulatif', icon: ClipboardList },
];

export default function CheckoutPage() {
  const { items: cartItems = [], clearCart } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(() => {
    const redirect = sessionStorage.getItem('checkout_redirect');
    if (redirect === 'payment') {
      sessionStorage.removeItem('checkout_redirect');
      return 'payment';
    }
    return 'customer';
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [unavailableProducts, setUnavailableProducts] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(true);

  // Vérifier la disponibilité ET le statut actif de tous les produits au chargement
  useEffect(() => {
    if (cartItems.length === 0) return;
    let cancelled = false;

    const checkAll = async () => {
      setCheckingAvailability(true);
      const unavailable: string[] = [];

      try {
        // 1. Vérifier que tous les produits sont encore actifs
        const productIds = [...new Set(cartItems.map((i) => i.product.id))];
        const activeIds = await ProductsService.getActiveProductIds(productIds);

        for (const item of cartItems) {
          if (!activeIds.has(item.product.id)) {
            unavailable.push(item.product.name);
            continue;
          }

          // 2. Vérifier la dispo par dates/quantité
          if (!item.start_date || !item.end_date) continue;
          try {
            const available = await ProductsService.checkAvailability(
              item.product.id,
              item.start_date,
              item.end_date,
              item.quantity
            );
            if (!available) {
              unavailable.push(item.product.name);
            }
          } catch {
            // En cas d'erreur RPC, on laisse passer (le serveur validera)
          }
        }
      } catch {
        // Si la vérification échoue, on laisse passer (le serveur validera)
      }

      if (!cancelled) {
        setUnavailableProducts(unavailable);
        setCheckingAvailability(false);
      }
    };

    checkAll();
    return () => { cancelled = true; };
  }, [cartItems]);

  const form = useCheckoutForm();

  // Pré-remplir les dates de livraison et flags de majoration dès le montage
  // (pas seulement quand le step delivery s'affiche) pour que le pricing soit correct
  const cartStartDate = cartItems[0]?.start_date || '';
  const cartEndDate = cartItems[0]?.end_date || '';
  useEffect(() => {
    if (!cartStartDate || !cartEndDate) return;
    if (form.delivery.date && form.delivery.pickupDate) return;

    const updates: Partial<typeof form.delivery> = {};
    if (!form.delivery.date) updates.date = cartStartDate;
    if (!form.delivery.pickupDate) updates.pickupDate = cartEndDate;

    if (Object.keys(updates).length > 0) {
      form.setDelivery(prev => ({ ...prev, ...updates }));
    }

    if (isWeekendOrHoliday(cartStartDate) && !form.deliveryIsMandatory) {
      form.setDeliveryIsMandatory(true);
    }
    if (isWeekendOrHoliday(cartEndDate) && !form.pickupIsMandatory) {
      form.setPickupIsMandatory(true);
    }
  }, [cartStartDate, cartEndDate]);

  const pricing = useCheckoutPricing({
    cartItems,
    delivery: form.delivery,
    isPickup: form.isPickup,
    deliveryIsMandatory: form.deliveryIsMandatory,
    pickupIsMandatory: form.pickupIsMandatory,
    startSlot: form.startSlot,
    endSlot: form.endSlot,
  });
  const validation = useCheckoutValidation({
    customer: form.customer,
    billingAddress: form.billingAddress,
    recipient: form.recipient,
    delivery: form.delivery,
    pickup: form.pickup,
    eventDetails: form.eventDetails,
    payment: form.payment,
    isPickup: form.isPickup,
  });
  const { handleSubmit, isProcessing, submitError, needsAuth, clearNeedsAuth } = useCheckoutSubmit({
    cartItems,
    user: user ? { id: user.id, email: user.email || '' } : null,
    customer: form.customer,
    billingAddress: form.billingAddress,
    recipient: form.recipient,
    delivery: form.delivery,
    pickup: form.pickup,
    eventDetails: form.eventDetails,
    payment: form.payment,
    isPickup: form.isPickup,
    startSlot: form.startSlot,
    endSlot: form.endSlot,
    deliveryIsMandatory: form.deliveryIsMandatory,
    pickupIsMandatory: form.pickupIsMandatory,
    selectedDeliveryMode: form.selectedDeliveryMode,
    pricingBreakdowns: pricing.pricingBreakdowns,
    productsSubtotal: pricing.productsSubtotal,
    surchargesTotal: pricing.surchargesTotal,
    finalTotal: pricing.finalTotal,
    calculatedDeliveryFee: pricing.calculatedDeliveryFee,
    clearCart,
    validatePayment: () => validation.validateStep('payment'),
  });

  // When auth error detected, show modal
  useEffect(() => {
    if (needsAuth) {
      sessionStorage.setItem('checkout_redirect', 'payment');
      setShowAuthModal(true);
    }
  }, [needsAuth]);

  // When user authenticates while modal is open, close and clear
  useEffect(() => {
    if (user && needsAuth) {
      setShowAuthModal(false);
      clearNeedsAuth();
    }
  }, [user, needsAuth, clearNeedsAuth]);

  // Pre-fill customer form from user profile (on login or mount)
  // Only fills empty fields — never overwrites what the user already typed
  useEffect(() => {
    if (!user) return;
    form.setCustomer(prev => ({
      ...prev,
      firstName: prev.firstName || user.firstName || '',
      lastName: prev.lastName || user.lastName || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
      companyName: prev.companyName || user.companyName || '',
    }));
  }, [user]);

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    clearNeedsAuth();
  };

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (!validation.validateStep(currentStep)) return;
    const stepIndex = getCurrentStepIndex();
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id as CheckoutStep);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    const stepIndex = getCurrentStepIndex();
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id as CheckoutStep);
      window.scrollTo(0, 0);
    }
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Panier vide</h2>
          <p className="text-gray-400 mb-6">Ajoutez des produits avant de commander</p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] transition-colors"
          >
            Voir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/panier" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Panier
          </Link>
          <h1 className="text-2xl font-bold text-white">Finaliser la commande</h1>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between sm:justify-start">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = getCurrentStepIndex() > index;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive ? 'bg-[#33ffcc] text-[#000033]' : isCompleted ? 'bg-[#33ffcc]/20 text-[#33ffcc]' : 'bg-white/5 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`hidden sm:block text-xs mt-2 whitespace-nowrap ${isActive ? 'text-[#33ffcc]' : isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-6 sm:w-12 h-0.5 mx-2 ${isCompleted ? 'bg-[#33ffcc]/50' : 'bg-white/10'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Availability warning */}
        {checkingAvailability && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#33ffcc] border-t-transparent rounded-full animate-spin" />
            <span className="text-white/60 text-sm">Verification de la disponibilite...</span>
          </div>
        )}

        {unavailableProducts.length > 0 && (
          <div className="mb-6 p-5 bg-red-500/10 rounded-xl border border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-red-400 font-bold mb-1">Produit{unavailableProducts.length > 1 ? 's' : ''} indisponible{unavailableProducts.length > 1 ? 's' : ''}</h3>
                <p className="text-red-300/80 text-sm mb-3">
                  {unavailableProducts.length === 1
                    ? `Le produit "${unavailableProducts[0]}" n'est plus disponible pour les dates selectionnees.`
                    : `Les produits suivants ne sont plus disponibles : ${unavailableProducts.join(', ')}.`
                  }
                </p>
                <Link
                  to="/panier"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Modifier mon panier
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-4 md:p-6">
          {currentStep === 'customer' && (
            <CheckoutCustomerStep customer={form.customer} setCustomer={form.setCustomer} billingAddress={form.billingAddress} setBillingAddress={form.setBillingAddress} errors={validation.errors} />
          )}
          {currentStep === 'recipient' && (
            <CheckoutRecipientStep customer={form.customer} recipient={form.recipient} setRecipient={form.setRecipient} errors={validation.errors} />
          )}
          {currentStep === 'delivery' && (
            <CheckoutDeliveryStep
              isPickup={form.isPickup} selectedDeliveryMode={form.selectedDeliveryMode} setSelectedDeliveryMode={form.setSelectedDeliveryMode}
              delivery={form.delivery} setDelivery={form.setDelivery} pickup={form.pickup} setPickup={form.setPickup}
              eventDetails={form.eventDetails} setEventDetails={form.setEventDetails} errors={validation.errors} cartItems={cartItems}
              isCalculatingFee={pricing.isCalculatingFee} deliveryDistance={pricing.deliveryDistance} calculatedDeliveryFee={pricing.calculatedDeliveryFee}
              timeSlots={form.timeSlots} eventTypes={form.eventTypes} accessDifficulties={form.accessDifficulties}
              deliveryDateIsWeekendOrHoliday={pricing.deliveryDateIsWeekendOrHoliday} pickupDateIsWeekendOrHoliday={pricing.pickupDateIsWeekendOrHoliday}
              deliveryIsMandatory={form.deliveryIsMandatory} setDeliveryIsMandatory={form.setDeliveryIsMandatory}
              pickupIsMandatory={form.pickupIsMandatory} setPickupIsMandatory={form.setPickupIsMandatory}
            />
          )}
          {currentStep === 'payment' && (
            <CheckoutSummaryStep
              cartItems={cartItems} pricingBreakdowns={pricing.pricingBreakdowns} productsSubtotal={pricing.productsSubtotal}
              surchargesTotal={pricing.surchargesTotal} finalTotal={pricing.finalTotal} calculatedDeliveryFee={pricing.calculatedDeliveryFee}
              deliveryDistance={pricing.deliveryDistance} isPickup={form.isPickup} pricingInfoMessage={pricing.pricingInfoMessage}
              payment={form.payment} setPayment={form.setPayment} errors={validation.errors} submitError={submitError}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="sticky bottom-0 z-30 bg-[#000033]/95 backdrop-blur-lg border-t border-white/10 -mx-4 px-4 py-4 mt-6 md:static md:bg-transparent md:border-0 md:mx-0 md:px-0 md:py-0 md:mt-6">
          <div className="flex justify-between">
            <button onClick={handlePrevious} disabled={getCurrentStepIndex() === 0} className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Precedent</span>
            </button>
            {currentStep === 'payment' ? (
              <button onClick={handleSubmit} disabled={isProcessing || unavailableProducts.length > 0} className="flex-1 sm:flex-none flex items-center justify-center gap-2 ml-3 px-8 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors">
                {isProcessing ? (
                  <><div className="w-5 h-5 border-2 border-[#000033] border-t-transparent rounded-full animate-spin" />Redirection...</>
                ) : (
                  <><CreditCard className="w-5 h-5" />Proceder au paiement</>
                )}
              </button>
            ) : (
              <button onClick={handleNext} disabled={unavailableProducts.length > 0} className="flex-1 sm:flex-none flex items-center justify-center gap-2 ml-3 px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors">
                Continuer
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth modal for checkout auth errors */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
        onAuthSuccess={() => {}}
        title="Connexion requise"
        subtitle="Pour finaliser votre commande, creez un compte ou connectez-vous."
        headerIcon={
          <div className="p-2.5 bg-[#33ffcc]/20 rounded-xl">
            <Lock className="w-6 h-6 text-[#33ffcc]" />
          </div>
        }
      />
    </div>
  );
}
