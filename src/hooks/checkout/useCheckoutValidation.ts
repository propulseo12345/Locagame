import { useState } from 'react';
import type {
  CheckoutStep,
  CustomerState,
  BillingAddressState,
  RecipientState,
  DeliveryState,
  PickupState,
  EventDetailsState,
  PaymentState,
  CheckoutValidationReturn,
} from './types';

interface UseCheckoutValidationArgs {
  customer: CustomerState;
  billingAddress: BillingAddressState;
  recipient: RecipientState;
  delivery: DeliveryState;
  pickup: PickupState;
  eventDetails: EventDetailsState;
  payment: PaymentState;
  isPickup: boolean;
}

export function useCheckoutValidation({
  customer,
  billingAddress,
  recipient,
  delivery,
  pickup,
  eventDetails,
  payment,
  isPickup,
}: UseCheckoutValidationArgs): CheckoutValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: CheckoutStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'customer':
        if (!customer.firstName) newErrors.firstName = 'Prenom requis';
        if (!customer.lastName) newErrors.lastName = 'Nom requis';
        if (!customer.email) newErrors.email = 'Email requis';
        if (!customer.phone) newErrors.phone = 'Telephone requis';
        if (customer.isProfessional && !customer.companyName) newErrors.companyName = 'Nom entreprise requis';
        // Billing address validation for professionals
        if (customer.isProfessional) {
          if (!billingAddress.companyName) newErrors.billingCompanyName = 'Raison sociale requise';
          if (!billingAddress.addressLine1) newErrors.billingAddressLine1 = 'Adresse requise';
          if (!billingAddress.postalCode) newErrors.billingPostalCode = 'Code postal requis';
          if (!billingAddress.city) newErrors.billingCity = 'Ville requise';
          if (!billingAddress.country) newErrors.billingCountry = 'Pays requis';
        }
        break;

      case 'recipient':
        if (!recipient.sameAsCustomer) {
          if (!recipient.firstName) newErrors.recipientFirstName = 'Prenom requis';
          if (!recipient.lastName) newErrors.recipientLastName = 'Nom requis';
          if (!recipient.phone) newErrors.recipientPhone = 'Telephone requis';
        }
        break;

      case 'delivery':
        if (isPickup) {
          if (!pickup.pickupTime) newErrors.pickupTime = 'Creneau de retrait requis';
          if (!pickup.returnTime) newErrors.returnTime = 'Creneau de retour requis';
        } else {
          if (!delivery.address) newErrors.address = 'Adresse requise';
          if (!delivery.postalCode) newErrors.postalCode = 'Code postal requis';
          if (!delivery.city) newErrors.city = 'Ville requise';
          if (!delivery.date) newErrors.date = 'Date de livraison requise';
          if (!delivery.timeSlot) newErrors.timeSlot = 'Creneau requis';
          if (!eventDetails.eventType) newErrors.eventType = "Type d'evenement requis";
          if (eventDetails.accessDifficulty === 'other' && !eventDetails.accessDetails) {
            newErrors.accessDetails = 'Precisez la difficulte';
          }
        }
        break;

      case 'payment':
        if (!payment.acceptCGV) newErrors.acceptCGV = 'Vous devez accepter les CGV';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateStep, setErrors };
}
