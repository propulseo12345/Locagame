import { Truck, Calendar, Clock } from 'lucide-react';
import { isWeekend, getHolidayName } from '../../utils/dateHolidays';
import type { DeliveryState } from '../../hooks/checkout/types';
import type { TimeSlot } from '../../services';
import { inputClass, labelClass, errorClass } from '../../hooks/checkout/types';

interface CheckoutDeliverySlotsProps {
  delivery: DeliveryState;
  setDelivery: React.Dispatch<React.SetStateAction<DeliveryState>>;
  errors: Record<string, string>;
  timeSlots: TimeSlot[];
  deliveryDateIsWeekendOrHoliday: boolean;
  pickupDateIsWeekendOrHoliday: boolean;
  deliveryIsMandatory: boolean;
  setDeliveryIsMandatory: React.Dispatch<React.SetStateAction<boolean>>;
  pickupIsMandatory: boolean;
  setPickupIsMandatory: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CheckoutDeliverySlots({
  delivery,
  setDelivery,
  errors,
  timeSlots,
  deliveryDateIsWeekendOrHoliday,
  pickupDateIsWeekendOrHoliday,
  deliveryIsMandatory,
  setDeliveryIsMandatory,
  pickupIsMandatory,
  setPickupIsMandatory,
}: CheckoutDeliverySlotsProps) {
  return (
    <>
      {/* Delivery slots */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#33ffcc]" />
          Creneau de livraison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date de livraison *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={delivery.date}
                onChange={(e) => setDelivery({ ...delivery, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`${inputClass} pl-10 [color-scheme:dark]`}
              />
            </div>
            {errors.date && <p className={errorClass}>{errors.date}</p>}
          </div>
          <div>
            <label className={labelClass}>Creneau horaire *</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={delivery.timeSlot}
                onChange={(e) => setDelivery({ ...delivery, timeSlot: e.target.value })}
                className={`${inputClass} pl-10`}
              >
                <option value="" className="bg-[#000033]">Selectionnez</option>
                {timeSlots.map(slot => (
                  <option key={slot.id} value={slot.label} className="bg-[#000033]">{slot.label}</option>
                ))}
              </select>
            </div>
            {errors.timeSlot && <p className={errorClass}>{errors.timeSlot}</p>}
          </div>
        </div>

        {/* Mandatory delivery option */}
        {deliveryDateIsWeekendOrHoliday && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryIsMandatory}
                onChange={(e) => setDeliveryIsMandatory(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 text-amber-500 focus:ring-amber-500 bg-white/5"
              />
              <div>
                <span className="text-amber-400 font-medium">
                  Livraison imperative le {isWeekend(delivery.date) ? 'week-end' : getHolidayName(delivery.date)}
                </span>
                <p className="text-amber-400/70 text-sm mt-1">
                  {deliveryIsMandatory
                    ? 'Une majoration de 50\u20AC sera appliquee pour garantir cette date.'
                    : 'Sans cette option, nous vous contacterons pour planifier la livraison en semaine.'}
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Pickup/return slots */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#33ffcc] rotate-180" />
          Creneau de recuperation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date de recuperation</label>
            <input
              type="date"
              value={delivery.pickupDate}
              onChange={(e) => setDelivery({ ...delivery, pickupDate: e.target.value })}
              min={delivery.date || new Date().toISOString().split('T')[0]}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </div>
          <div>
            <label className={labelClass}>Creneau horaire</label>
            <select
              value={delivery.pickupTimeSlot}
              onChange={(e) => setDelivery({ ...delivery, pickupTimeSlot: e.target.value })}
              className={inputClass}
            >
              <option value="" className="bg-[#000033]">Selectionnez</option>
              {timeSlots.map(slot => (
                <option key={slot.id} value={slot.label} className="bg-[#000033]">{slot.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mandatory pickup option */}
        {pickupDateIsWeekendOrHoliday && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pickupIsMandatory}
                onChange={(e) => setPickupIsMandatory(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 text-amber-500 focus:ring-amber-500 bg-white/5"
              />
              <div>
                <span className="text-amber-400 font-medium">
                  Reprise imperative le {isWeekend(delivery.pickupDate) ? 'week-end' : getHolidayName(delivery.pickupDate)}
                </span>
                <p className="text-amber-400/70 text-sm mt-1">
                  {pickupIsMandatory
                    ? 'Une majoration de 50\u20AC sera appliquee pour garantir cette date.'
                    : 'Sans cette option, nous vous contacterons pour planifier la reprise en semaine.'}
                </p>
              </div>
            </label>
          </div>
        )}
      </div>
    </>
  );
}
