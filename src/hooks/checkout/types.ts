import type { DaySlot, CartItem } from '../../types';
import type { PricingBreakdown } from '../../utils/pricingRules';
import type { EventType, TimeSlot, AccessDifficultyType } from '../../services';

// --- Form state types ---

export interface CustomerState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isProfessional: boolean;
  companyName: string;
  siret: string;
}

export interface BillingAddressState {
  companyName: string;
  vatNumber: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface RecipientState {
  sameAsCustomer: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface DeliveryState {
  address: string;
  addressComplement: string;
  postalCode: string;
  city: string;
  date: string;
  timeSlot: string;
  pickupDate: string;
  pickupTimeSlot: string;
}

export interface PickupState {
  pickupTime: string;
  returnTime: string;
}

export interface EventDetailsState {
  eventType: string;
  guestCount: string;
  venueName: string;
  accessDifficulty: string;
  accessDetails: string;
  hasElevator: boolean;
  floorNumber: string;
  parkingAvailable: boolean;
  parkingDetails: string;
  electricityAvailable: boolean;
  setupSpace: string;
  specialRequests: string;
}

export interface PaymentState {
  method: string;
  acceptCGV: boolean;
  acceptNewsletter: boolean;
}

export type CheckoutStep = 'customer' | 'recipient' | 'delivery' | 'payment';

// --- Hook return types ---

export interface CheckoutFormReturn {
  customer: CustomerState;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerState>>;
  billingAddress: BillingAddressState;
  setBillingAddress: React.Dispatch<React.SetStateAction<BillingAddressState>>;
  recipient: RecipientState;
  setRecipient: React.Dispatch<React.SetStateAction<RecipientState>>;
  delivery: DeliveryState;
  setDelivery: React.Dispatch<React.SetStateAction<DeliveryState>>;
  pickup: PickupState;
  setPickup: React.Dispatch<React.SetStateAction<PickupState>>;
  eventDetails: EventDetailsState;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetailsState>>;
  payment: PaymentState;
  setPayment: React.Dispatch<React.SetStateAction<PaymentState>>;
  selectedDeliveryMode: 'pickup' | 'delivery';
  setSelectedDeliveryMode: React.Dispatch<React.SetStateAction<'pickup' | 'delivery'>>;
  isPickup: boolean;
  deliveryIsMandatory: boolean;
  setDeliveryIsMandatory: React.Dispatch<React.SetStateAction<boolean>>;
  pickupIsMandatory: boolean;
  setPickupIsMandatory: React.Dispatch<React.SetStateAction<boolean>>;
  startSlot: DaySlot;
  setStartSlot: React.Dispatch<React.SetStateAction<DaySlot>>;
  endSlot: DaySlot;
  setEndSlot: React.Dispatch<React.SetStateAction<DaySlot>>;
  eventTypes: EventType[];
  timeSlots: TimeSlot[];
  accessDifficulties: AccessDifficultyType[];
}

export interface CheckoutPricingReturn {
  pricingBreakdowns: PricingBreakdown[];
  productsSubtotal: number;
  surchargesTotal: number;
  finalTotal: number;
  calculatedDeliveryFee: number;
  deliveryDistance: number;
  isCalculatingFee: boolean;
  deliveryDateIsWeekendOrHoliday: boolean;
  pickupDateIsWeekendOrHoliday: boolean;
  pricingInfoMessage: string | undefined;
}

export interface CheckoutValidationReturn {
  errors: Record<string, string>;
  validateStep: (step: CheckoutStep) => boolean;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

// --- Shared CSS classes ---

export const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none transition-colors";
export const labelClass = "block text-sm text-gray-400 mb-1.5";
export const errorClass = "text-red-400 text-xs mt-1";
