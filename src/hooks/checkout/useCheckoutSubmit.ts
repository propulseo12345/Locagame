import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartItem, DaySlot } from '../../types';
import { serializeBreakdown, type PricingBreakdown } from '../../utils/pricingRules';
import { CheckoutService, type CheckoutPayload } from '../../services';
import type {
  CustomerState,
  BillingAddressState,
  RecipientState,
  DeliveryState,
  PickupState,
  EventDetailsState,
  PaymentState,
} from './types';

interface UseCheckoutSubmitArgs {
  cartItems: CartItem[];
  user: { id: string; email: string } | null;
  customer: CustomerState;
  billingAddress: BillingAddressState;
  recipient: RecipientState;
  delivery: DeliveryState;
  pickup: PickupState;
  eventDetails: EventDetailsState;
  payment: PaymentState;
  isPickup: boolean;
  startSlot: DaySlot;
  endSlot: DaySlot;
  deliveryIsMandatory: boolean;
  pickupIsMandatory: boolean;
  selectedDeliveryMode: 'pickup' | 'delivery';
  pricingBreakdowns: PricingBreakdown[];
  productsSubtotal: number;
  surchargesTotal: number;
  finalTotal: number;
  calculatedDeliveryFee: number;
  clearCart: () => void;
  validatePayment: () => boolean;
}

function calculateDurationDays(startDateStr: string, endDateStr: string | null): number {
  if (!endDateStr) return 1;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 1);
}

export function useCheckoutSubmit({
  cartItems,
  user,
  customer,
  billingAddress,
  recipient,
  delivery,
  pickup,
  eventDetails,
  payment,
  isPickup,
  startSlot,
  endSlot,
  deliveryIsMandatory,
  pickupIsMandatory,
  selectedDeliveryMode,
  pricingBreakdowns,
  productsSubtotal,
  surchargesTotal,
  finalTotal,
  calculatedDeliveryFee,
  clearCart,
  validatePayment,
}: UseCheckoutSubmitArgs) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startDate = cartItems[0]?.start_date || '';
  const endDate = cartItems[0]?.end_date || '';

  const handleSubmit = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);
    setSubmitError(null);

    try {
      const reservationItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        duration_days: calculateDurationDays(item.start_date, item.end_date),
        unit_price: item.product.pricing?.oneDay || item.product_price || 0,
        subtotal: item.total_price,
      }));

      const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
      const finalDeliveryFee = isPickup ? 0 : calculatedDeliveryFee;

      const combinedPricingBreakdown = {
        items: pricingBreakdowns.map((b, i) => ({
          product_id: cartItems[i].product.id,
          product_name: cartItems[i].product.name,
          ...serializeBreakdown(b),
        })),
        products_subtotal: productsSubtotal,
        surcharges_total: surchargesTotal,
        delivery_fee: finalDeliveryFee,
        total: finalTotal,
      };

      const checkoutPayload: CheckoutPayload = {
        email: user?.email || customer.email,
        first_name: customer.firstName,
        last_name: customer.lastName,
        phone: customer.phone,
        customer_type: customer.isProfessional ? 'professional' : 'individual',
        company_name: customer.companyName || undefined,
        siret: customer.isProfessional ? customer.siret : undefined,
        address: !isPickup && delivery.address ? {
          address_line1: delivery.address,
          address_line2: delivery.addressComplement || undefined,
          city: delivery.city,
          postal_code: delivery.postalCode,
        } : undefined,
        start_date: isPickup ? startDate : delivery.date,
        end_date: isPickup ? endDate : (delivery.pickupDate || delivery.date),
        start_slot: startSlot,
        end_slot: endSlot,
        delivery_type: selectedDeliveryMode,
        delivery_time: isPickup ? undefined : delivery.timeSlot,
        pickup_time: isPickup ? pickup.pickupTime : undefined,
        return_time: isPickup ? pickup.returnTime : undefined,
        event_type: eventDetails.eventType,
        event_details: !isPickup ? {
          guestCount: eventDetails.guestCount || undefined,
          venueName: eventDetails.venueName || undefined,
          accessDifficulty: eventDetails.accessDifficulty || undefined,
          accessDetails: eventDetails.accessDetails || undefined,
          hasElevator: eventDetails.hasElevator,
          floorNumber: eventDetails.floorNumber || undefined,
          parkingAvailable: eventDetails.parkingAvailable,
          parkingDetails: eventDetails.parkingDetails || undefined,
          electricityAvailable: eventDetails.electricityAvailable,
          setupSpace: eventDetails.setupSpace || undefined,
        } : undefined,
        recipient_data: !recipient.sameAsCustomer ? {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          phone: recipient.phone,
          email: recipient.email || undefined,
          sameAsCustomer: false,
        } : { firstName: '', lastName: '', phone: '', sameAsCustomer: true },
        notes: eventDetails.specialRequests || undefined,
        subtotal,
        delivery_fee: finalDeliveryFee,
        discount: 0,
        total: finalTotal,
        pricing_breakdown: combinedPricingBreakdown,
        items: reservationItems,
        cgv_accepted: payment.acceptCGV,
        newsletter_accepted: payment.acceptNewsletter,
        is_business: customer.isProfessional,
        delivery_is_mandatory: !isPickup && deliveryIsMandatory,
        pickup_is_mandatory: !isPickup && pickupIsMandatory,
        billing_company_name: customer.isProfessional ? billingAddress.companyName : undefined,
        billing_vat_number: customer.isProfessional && billingAddress.vatNumber ? billingAddress.vatNumber : undefined,
        billing_address_line1: customer.isProfessional ? billingAddress.addressLine1 : undefined,
        billing_address_line2: customer.isProfessional && billingAddress.addressLine2 ? billingAddress.addressLine2 : undefined,
        billing_postal_code: customer.isProfessional ? billingAddress.postalCode : undefined,
        billing_city: customer.isProfessional ? billingAddress.city : undefined,
        billing_country: customer.isProfessional ? billingAddress.country : undefined,
      };

      const result = await CheckoutService.checkout(user?.id || null, checkoutPayload);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la creation de la reservation');
      }

      // Créer la session Stripe Checkout et rediriger
      const confirmationUrl = `${window.location.origin}/confirmation/${result.reservation_id}`;
      const { session_url } = await CheckoutService.createStripeCheckoutSession(
        result.reservation_id!,
        confirmationUrl,
        confirmationUrl
      );

      // Rediriger vers Stripe (ne pas clearCart ici, ce sera fait sur la page de confirmation)
      window.location.href = session_url;
    } catch (error) {
      console.error('Erreur creation reservation:', error);
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Une erreur est survenue lors de la creation de votre reservation. Veuillez reessayer.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsProcessing(false);
    }
  };

  return { handleSubmit, isProcessing, submitError };
}
