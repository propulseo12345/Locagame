import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react';
import { useCheckout } from '../hooks/checkout/useCheckout';
import { CheckoutStepper } from '../components/checkout/CheckoutStepper';
import { CheckoutNavigation } from '../components/checkout/CheckoutNavigation';
import { CheckoutLayout } from '../components/checkout/CheckoutLayout';
import { CheckoutCustomerStep } from '../components/checkout/CheckoutCustomerStep';
import { CheckoutRecipientStep } from '../components/checkout/CheckoutRecipientStep';
import { CheckoutDeliveryStep } from '../components/checkout/CheckoutDeliveryStep';
import { CheckoutSummaryStep } from '../components/checkout/CheckoutSummaryStep';
import { AuthModal } from '../components/auth/AuthModal';

export default function CheckoutPage() {
  const c = useCheckout();
  if (c.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Panier vide</h2>
          <p className="text-gray-400 mb-6">Ajoutez des produits avant de commander</p>
          <Link to="/catalogue" className="inline-flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] transition-colors">Voir le catalogue</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/panier" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" />Panier</Link>
          <h1 className="text-2xl font-bold text-white">Finaliser la commande</h1>
        </div>
        <CheckoutStepper steps={c.steps} currentStepIndex={c.currentStepIndex} />
        <CheckoutLayout
          cartItems={c.cartItems} finalTotal={c.pricing.finalTotal} checkingAvailability={c.checkingAvailability} unavailableProducts={c.unavailableProducts}
          pricingBreakdowns={c.pricing.pricingBreakdowns} productsSubtotal={c.pricing.productsSubtotal} surchargesTotal={c.pricing.surchargesTotal}
          calculatedDeliveryFee={c.pricing.calculatedDeliveryFee} deliveryDistance={c.pricing.deliveryDistance} isPickup={c.form.isPickup}
        >
          <div className="bg-white/5 rounded-2xl border border-white/10 p-4 md:p-6">
            {c.currentStep === 'customer' && (
              <CheckoutCustomerStep customer={c.form.customer} setCustomer={c.form.setCustomer} billingAddress={c.form.billingAddress} setBillingAddress={c.form.setBillingAddress} errors={c.validation.errors} />
            )}
            {c.currentStep === 'recipient' && (
              <CheckoutRecipientStep customer={c.form.customer} recipient={c.form.recipient} setRecipient={c.form.setRecipient} errors={c.validation.errors} />
            )}
            {c.currentStep === 'delivery' && (
              <CheckoutDeliveryStep
                isPickup={c.form.isPickup} selectedDeliveryMode={c.form.selectedDeliveryMode} setSelectedDeliveryMode={c.form.setSelectedDeliveryMode}
                delivery={c.form.delivery} setDelivery={c.form.setDelivery} pickup={c.form.pickup} setPickup={c.form.setPickup}
                eventDetails={c.form.eventDetails} setEventDetails={c.form.setEventDetails} errors={c.validation.errors} cartItems={c.cartItems}
                isCalculatingFee={c.pricing.isCalculatingFee} deliveryDistance={c.pricing.deliveryDistance}
                calculatedDeliveryFee={c.pricing.calculatedDeliveryFee} deliveryError={c.pricing.deliveryError} calculateFromCoords={c.pricing.calculateFromCoords}
                timeSlots={c.form.timeSlots} eventTypes={c.form.eventTypes} accessDifficulties={c.form.accessDifficulties}
                deliveryDateIsWeekendOrHoliday={c.pricing.deliveryDateIsWeekendOrHoliday} pickupDateIsWeekendOrHoliday={c.pricing.pickupDateIsWeekendOrHoliday}
                deliveryIsMandatory={c.form.deliveryIsMandatory} setDeliveryIsMandatory={c.form.setDeliveryIsMandatory}
                pickupIsMandatory={c.form.pickupIsMandatory} setPickupIsMandatory={c.form.setPickupIsMandatory}
              />
            )}
            {c.currentStep === 'payment' && (
              <CheckoutSummaryStep
                cartItems={c.cartItems} pricingBreakdowns={c.pricing.pricingBreakdowns} productsSubtotal={c.pricing.productsSubtotal}
                surchargesTotal={c.pricing.surchargesTotal} finalTotal={c.pricing.finalTotal} calculatedDeliveryFee={c.pricing.calculatedDeliveryFee}
                deliveryDistance={c.pricing.deliveryDistance} isPickup={c.form.isPickup} pricingInfoMessage={c.pricing.pricingInfoMessage}
                payment={c.form.payment} setPayment={c.form.setPayment} errors={c.validation.errors} submitError={c.submitError}
              />
            )}
          </div>
          <CheckoutNavigation currentStepIndex={c.currentStepIndex} isLastStep={c.currentStep === 'payment'} isProcessing={c.isProcessing} hasUnavailableProducts={c.unavailableProducts.length > 0} onNext={c.handleNext} onPrevious={c.handlePrevious} onSubmit={c.handleSubmit} />
        </CheckoutLayout>
      </div>
      <AuthModal isOpen={c.showAuthModal} onClose={c.handleAuthModalClose} onAuthSuccess={() => {}} title="Connexion requise" subtitle="Pour finaliser votre commande, creez un compte ou connectez-vous." headerIcon={<div className="p-2.5 bg-[#33ffcc]/20 rounded-xl"><Lock className="w-6 h-6 text-[#33ffcc]" /></div>} />
    </div>
  );
}
