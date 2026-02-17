import { Package, Truck } from 'lucide-react';
import type { CartItem } from '../../types';
import type {
  DeliveryState,
  PickupState,
  EventDetailsState,
} from '../../hooks/checkout/types';
import type { EventType, TimeSlot, AccessDifficultyType } from '../../services';
import PickupForm from './PickupForm';
import { CheckoutDeliveryAddress } from './CheckoutDeliveryAddress';
import { CheckoutDeliverySlots } from './CheckoutDeliverySlots';
import { CheckoutEventDetails } from './CheckoutEventDetails';
import { CheckoutAccessDetails } from './CheckoutAccessDetails';

interface CheckoutDeliveryStepProps {
  isPickup: boolean;
  selectedDeliveryMode: 'pickup' | 'delivery';
  setSelectedDeliveryMode: React.Dispatch<React.SetStateAction<'pickup' | 'delivery'>>;
  delivery: DeliveryState;
  setDelivery: React.Dispatch<React.SetStateAction<DeliveryState>>;
  pickup: PickupState;
  setPickup: React.Dispatch<React.SetStateAction<PickupState>>;
  eventDetails: EventDetailsState;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetailsState>>;
  errors: Record<string, string>;
  cartItems: CartItem[];
  // Delivery fee
  isCalculatingFee: boolean;
  deliveryDistance: number;
  calculatedDeliveryFee: number;
  // Time slots
  timeSlots: TimeSlot[];
  eventTypes: EventType[];
  accessDifficulties: AccessDifficultyType[];
  // Weekend/holiday
  deliveryDateIsWeekendOrHoliday: boolean;
  pickupDateIsWeekendOrHoliday: boolean;
  deliveryIsMandatory: boolean;
  setDeliveryIsMandatory: React.Dispatch<React.SetStateAction<boolean>>;
  pickupIsMandatory: boolean;
  setPickupIsMandatory: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CheckoutDeliveryStep({
  isPickup,
  selectedDeliveryMode,
  setSelectedDeliveryMode,
  delivery,
  setDelivery,
  pickup,
  setPickup,
  eventDetails,
  setEventDetails,
  errors,
  cartItems,
  isCalculatingFee,
  deliveryDistance,
  calculatedDeliveryFee,
  timeSlots,
  eventTypes,
  accessDifficulties,
  deliveryDateIsWeekendOrHoliday,
  pickupDateIsWeekendOrHoliday,
  deliveryIsMandatory,
  setDeliveryIsMandatory,
  pickupIsMandatory,
  setPickupIsMandatory,
}: CheckoutDeliveryStepProps) {
  const startDate = cartItems[0]?.start_date || '';
  const endDate = cartItems[0]?.end_date || '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Mode de recuperation</h2>
        <p className="text-gray-400 text-sm">Comment souhaitez-vous recuperer le materiel ?</p>
      </div>

      {/* Toggle Pickup / Delivery */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setSelectedDeliveryMode('pickup')}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            isPickup
              ? 'border-[#33ffcc] bg-[#33ffcc]/10'
              : 'border-white/10 hover:border-white/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Package className={`w-6 h-6 ${isPickup ? 'text-[#33ffcc]' : 'text-gray-400'}`} />
            <span className={`font-semibold ${isPickup ? 'text-[#33ffcc]' : 'text-white'}`}>
              Retrait a l'entrepot
            </span>
          </div>
          <p className="text-gray-500 text-sm">Gratuit - Venez chercher le materiel</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDeliveryMode('delivery')}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            !isPickup
              ? 'border-[#33ffcc] bg-[#33ffcc]/10'
              : 'border-white/10 hover:border-white/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Truck className={`w-6 h-6 ${!isPickup ? 'text-[#33ffcc]' : 'text-gray-400'}`} />
            <span className={`font-semibold ${!isPickup ? 'text-[#33ffcc]' : 'text-white'}`}>
              Livraison
            </span>
          </div>
          <p className="text-gray-500 text-sm">Nous livrons sur le lieu de l'evenement</p>
        </button>
      </div>

      {isPickup ? (
        <PickupForm
          selectedDate={startDate}
          endDate={endDate}
          pickupTime={pickup.pickupTime}
          returnTime={pickup.returnTime}
          onPickupTimeChange={(time) => setPickup({ ...pickup, pickupTime: time })}
          onReturnTimeChange={(time) => setPickup({ ...pickup, returnTime: time })}
          errors={errors}
        />
      ) : (
        <>
          <CheckoutDeliveryAddress
            delivery={delivery}
            setDelivery={setDelivery}
            errors={errors}
            isCalculatingFee={isCalculatingFee}
            deliveryDistance={deliveryDistance}
            calculatedDeliveryFee={calculatedDeliveryFee}
          />
          <CheckoutDeliverySlots
            delivery={delivery}
            setDelivery={setDelivery}
            errors={errors}
            timeSlots={timeSlots}
            deliveryDateIsWeekendOrHoliday={deliveryDateIsWeekendOrHoliday}
            pickupDateIsWeekendOrHoliday={pickupDateIsWeekendOrHoliday}
            deliveryIsMandatory={deliveryIsMandatory}
            setDeliveryIsMandatory={setDeliveryIsMandatory}
            pickupIsMandatory={pickupIsMandatory}
            setPickupIsMandatory={setPickupIsMandatory}
          />
          <CheckoutEventDetails
            eventDetails={eventDetails}
            setEventDetails={setEventDetails}
            errors={errors}
            eventTypes={eventTypes}
          />
          <CheckoutAccessDetails
            eventDetails={eventDetails}
            setEventDetails={setEventDetails}
            errors={errors}
            accessDifficulties={accessDifficulties}
          />
        </>
      )}
    </div>
  );
}
