import { useState, useRef } from 'react';
import type { CartItem, DaySlot } from '../../types';
import { calculateDurationDays } from '../../utils/pricing';
import { serializeBreakdown, type PricingBreakdown } from '../../utils/pricingRules';
import { CheckoutService, type CheckoutPayload } from '../../services';
import { logger } from '../../lib/logger';
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
  deliveryDistance: number;
  clearCart: () => void;
  validatePayment: () => boolean;
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
  deliveryDistance,
  clearCart: _clearCart,
  validatePayment,
}: UseCheckoutSubmitArgs) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const isSubmittingRef = useRef(false);
  // Garde la reservation_id si le checkout a réussi mais le paiement a échoué (ex: guest→login)
  const pendingReservationIdRef = useRef<string | null>(null);

  const startDate = cartItems[0]?.start_date || '';
  const endDate = cartItems[0]?.end_date || '';

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!validatePayment()) return;

    isSubmittingRef.current = true;
    setIsProcessing(true);
    setSubmitError(null);

    try {
      // Si une réservation a déjà été créée (ex: guest checkout OK mais Stripe KO),
      // on skip la création et on retente directement le paiement.
      let reservationId = pendingReservationIdRef.current;

      if (!reservationId) {
        const reservationItems = cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          duration_days: item.end_date ? calculateDurationDays(item.start_date, item.end_date) : 1,
          unit_price: item.product.pricing?.oneDay || item.product_price || 0,
          subtotal: item.total_price,
          delivery_people_count: item.product.delivery_people_count ?? 1,
          pickup_people_count: item.product.pickup_people_count ?? 1,
        }));

        const subtotal = productsSubtotal;
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
          surcharges_total: surchargesTotal,
          delivery_fee: finalDeliveryFee,
          delivery_distance_km: isPickup ? undefined : deliveryDistance,
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

        reservationId = result.reservation_id!;
        pendingReservationIdRef.current = reservationId;
        sessionStorage.setItem('lastReservationId', reservationId);
      }

      // Créer la session Stripe Checkout et rediriger
      const baseUrl = `${window.location.origin}/confirmation/${reservationId}`;
      const { session_url } = await CheckoutService.createStripeCheckoutSession(
        reservationId,
        `${baseUrl}?payment=success`,
        `${baseUrl}?payment=cancelled`
      );

      // Rediriger vers Stripe (ne pas clearCart ici, ce sera fait sur la page de confirmation)
      window.location.href = session_url;
    } catch (error) {
      logger.error('Erreur creation reservation', error);
      const message = error instanceof Error ? error.message : '';
      const msgLower = message.toLowerCase();
      const isAuthErr = msgLower.includes('token')
        || msgLower.includes('jwt')
        || msgLower.includes('unauthorized')
        || msgLower.includes('401')
        || msgLower.includes('not authenticated')
        || msgLower.includes('invalid claim');

      if (isAuthErr) {
        setNeedsAuth(true);
      } else if (msgLower.includes('introuvable ou inactif') || msgLower.includes('not found')) {
        setSubmitError(
          'Un ou plusieurs produits de votre panier ne sont plus disponibles. Veuillez retourner au panier et retirer les articles concernes.'
        );
      } else if (message) {
        setSubmitError(message);
      } else {
        setSubmitError('Une erreur est survenue lors de la creation de votre reservation. Veuillez reessayer.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      isSubmittingRef.current = false;
      setIsProcessing(false);
    }
  };

  const clearNeedsAuth = () => setNeedsAuth(false);

  return { handleSubmit, isProcessing, submitError, needsAuth, clearNeedsAuth };
}
