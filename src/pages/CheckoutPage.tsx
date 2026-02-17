import { useState } from 'react';
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
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
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

const steps = [
  { id: 'customer', label: 'Vos coordonnees', icon: User },
  { id: 'recipient', label: 'Reception', icon: UserCheck },
  { id: 'delivery', label: 'Livraison', icon: MapPin },
  { id: 'payment', label: 'Recapitulatif', icon: ClipboardList },
];

export default function CheckoutPage() {
  const { items: cartItems = [], clearCart } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('customer');

  const form = useCheckoutForm();
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
  const { handleSubmit, isProcessing, submitError } = useCheckoutSubmit({
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
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center min-w-max">
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
                    <span className={`text-xs mt-2 whitespace-nowrap ${isActive ? 'text-[#33ffcc]' : isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-[#33ffcc]/50' : 'bg-white/10'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
        <div className="flex justify-between mt-6">
          <button onClick={handlePrevious} disabled={getCurrentStepIndex() === 0} className="flex items-center gap-2 px-5 py-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Precedent
          </button>
          {currentStep === 'payment' ? (
            <button onClick={handleSubmit} disabled={isProcessing} className="flex items-center gap-2 px-8 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors">
              {isProcessing ? (
                <><div className="w-5 h-5 border-2 border-[#000033] border-t-transparent rounded-full animate-spin" />Redirection vers le paiement...</>
              ) : (
                <><CreditCard className="w-5 h-5" />Proceder au paiement</>
              )}
            </button>
          ) : (
            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] transition-colors">
              Continuer
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
