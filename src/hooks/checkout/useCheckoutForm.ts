import { useState, useEffect } from 'react';
import type { DaySlot } from '../../types';
import {
  EventTypesService,
  TimeSlotsService,
  AccessDifficultyService,
  type EventType,
  type TimeSlot,
  type AccessDifficultyType,
} from '../../services';
import type {
  CustomerState,
  BillingAddressState,
  RecipientState,
  DeliveryState,
  PickupState,
  EventDetailsState,
  PaymentState,
  CheckoutFormReturn,
} from './types';

export function useCheckoutForm(): CheckoutFormReturn {
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<'pickup' | 'delivery'>('delivery');
  const isPickup = selectedDeliveryMode === 'pickup';

  // Step 1: Customer
  const [customer, setCustomer] = useState<CustomerState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isProfessional: false,
    companyName: '',
    siret: '',
  });

  // Billing address (professional)
  const [billingAddress, setBillingAddress] = useState<BillingAddressState>({
    companyName: '',
    vatNumber: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    country: 'FR',
  });

  // Step 2: Recipient
  const [recipient, setRecipient] = useState<RecipientState>({
    sameAsCustomer: true,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  // Step 3: Delivery
  const [delivery, setDelivery] = useState<DeliveryState>({
    address: '',
    addressComplement: '',
    postalCode: '',
    city: '',
    date: '',
    timeSlot: '',
    pickupDate: '',
    pickupTimeSlot: '',
  });

  // Mandatory delivery/pickup options
  const [deliveryIsMandatory, setDeliveryIsMandatory] = useState(false);
  const [pickupIsMandatory, setPickupIsMandatory] = useState(false);

  // Slots AM/PM for pricing
  const [startSlot, setStartSlot] = useState<DaySlot>('AM');
  const [endSlot, setEndSlot] = useState<DaySlot>('AM');

  // Pickup mode state
  const [pickup, setPickup] = useState<PickupState>({
    pickupTime: '',
    returnTime: '',
  });

  // Step 4: Event details
  const [eventDetails, setEventDetails] = useState<EventDetailsState>({
    eventType: '',
    guestCount: '',
    venueName: '',
    accessDifficulty: 'none',
    accessDetails: '',
    hasElevator: false,
    floorNumber: '',
    parkingAvailable: true,
    parkingDetails: '',
    electricityAvailable: true,
    setupSpace: '',
    specialRequests: '',
  });

  // Step 5: Payment
  const [payment, setPayment] = useState<PaymentState>({
    method: 'card',
    acceptCGV: false,
    acceptNewsletter: false,
  });

  // Dynamic lookup data from Supabase
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [accessDifficulties, setAccessDifficulties] = useState<AccessDifficultyType[]>([]);

  useEffect(() => {
    async function fetchLookupData() {
      try {
        const [types, slots, difficulties] = await Promise.all([
          EventTypesService.getEventTypes(),
          TimeSlotsService.getTimeSlots(),
          AccessDifficultyService.getAccessDifficulties(),
        ]);
        setEventTypes(types);
        setTimeSlots(slots);
        setAccessDifficulties(difficulties);
      } catch (error) {
        console.error('Failed to load checkout data:', error);
      }
    }
    fetchLookupData();
  }, []);

  return {
    customer, setCustomer,
    billingAddress, setBillingAddress,
    recipient, setRecipient,
    delivery, setDelivery,
    pickup, setPickup,
    eventDetails, setEventDetails,
    payment, setPayment,
    selectedDeliveryMode, setSelectedDeliveryMode,
    isPickup,
    deliveryIsMandatory, setDeliveryIsMandatory,
    pickupIsMandatory, setPickupIsMandatory,
    startSlot, setStartSlot,
    endSlot, setEndSlot,
    eventTypes,
    timeSlots,
    accessDifficulties,
  };
}
