import { useState } from 'react';
import { Truck, Calendar, Clock } from 'lucide-react';
import { isWeekendOrHoliday, isWeekend, getHolidayName, toLocalISODate } from '../../utils/dateHolidays';
import type { DeliveryState } from '../../hooks/checkout/types';
import type { TimeSlot } from '../../services';
import { inputClass, labelClass, errorClass } from '../../hooks/checkout/types';
import { WeekendWarningModal } from './WeekendWarningModal';

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
  cartStartDate?: string;
  cartEndDate?: string;
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
  cartStartDate,
  cartEndDate,
}: CheckoutDeliverySlotsProps) {
  // Les dates sont verrouillées si elles viennent du panier
  const datesLocked = !!(cartStartDate && cartEndDate);
  const [showModal, setShowModal] = useState(false);
  const [modalTarget, setModalTarget] = useState<'delivery' | 'pickup'>('delivery');
  const [pendingDate, setPendingDate] = useState('');

  // Quand l'utilisateur sélectionne une date de livraison
  const handleDeliveryDateChange = (dateStr: string) => {
    if (dateStr && isWeekendOrHoliday(dateStr)) {
      setPendingDate(dateStr);
      setModalTarget('delivery');
      setShowModal(true);
    } else {
      setDelivery({ ...delivery, date: dateStr });
      // Réinitialiser si date normale
      if (deliveryIsMandatory) setDeliveryIsMandatory(false);
    }
  };

  // Quand l'utilisateur sélectionne une date de reprise
  const handlePickupDateChange = (dateStr: string) => {
    if (dateStr && isWeekendOrHoliday(dateStr)) {
      setPendingDate(dateStr);
      setModalTarget('pickup');
      setShowModal(true);
    } else {
      setDelivery({ ...delivery, pickupDate: dateStr });
      if (pickupIsMandatory) setPickupIsMandatory(false);
    }
  };

  // Confirmation : appliquer la date + activer la majoration
  const handleModalConfirm = () => {
    if (modalTarget === 'delivery') {
      setDelivery({ ...delivery, date: pendingDate });
      setDeliveryIsMandatory(true);
    } else {
      setDelivery({ ...delivery, pickupDate: pendingDate });
      setPickupIsMandatory(true);
    }
    setShowModal(false);
    setPendingDate('');
  };

  // Annulation : ne pas appliquer la date
  const handleModalCancel = () => {
    setShowModal(false);
    setPendingDate('');
  };

  const getModalDateLabel = () => {
    if (!pendingDate) return '';
    const date = new Date(pendingDate + 'T00:00:00');
    const dayStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const holidayName = getHolidayName(pendingDate);
    if (holidayName) return `${dayStr} — ${holidayName}`;
    if (isWeekend(pendingDate)) return `${dayStr} — week-end`;
    return dayStr;
  };

  return (
    <>
      <WeekendWarningModal
        isOpen={showModal}
        dateLabel={getModalDateLabel()}
        context={modalTarget}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      {/* Delivery slots */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#33ffcc]" />
          Creneau de livraison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date de livraison *</label>
            {datesLocked ? (
              <div className={`${inputClass} pl-10 relative flex items-center opacity-80 cursor-not-allowed`}>
                <Calendar className="absolute left-3 w-4 h-4 text-gray-500" />
                <span>{new Date(delivery.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            ) : (
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={delivery.date}
                  onChange={(e) => handleDeliveryDateChange(e.target.value)}
                  min={toLocalISODate(new Date())}
                  className={`${inputClass} pl-10 [color-scheme:dark]`}
                />
              </div>
            )}
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

        {/* Badge de confirmation majoration livraison */}
        {deliveryDateIsWeekendOrHoliday && deliveryIsMandatory && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-amber-400 font-medium">
                  Livraison {isWeekend(delivery.date) ? 'week-end' : getHolidayName(delivery.date)} confirmée
                </span>
                <p className="text-amber-400/70 text-sm mt-1">
                  Une majoration sera appliquée pour garantir ce créneau.
                </p>
              </div>
            </div>
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
            {datesLocked ? (
              <div className={`${inputClass} pl-10 relative flex items-center opacity-80 cursor-not-allowed`}>
                <Calendar className="absolute left-3 w-4 h-4 text-gray-500" />
                <span>{new Date(delivery.pickupDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            ) : (
              <input
                type="date"
                value={delivery.pickupDate}
                onChange={(e) => handlePickupDateChange(e.target.value)}
                min={delivery.date || toLocalISODate(new Date())}
                className={`${inputClass} [color-scheme:dark]`}
              />
            )}
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

        {/* Badge de confirmation majoration reprise */}
        {pickupDateIsWeekendOrHoliday && pickupIsMandatory && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-amber-400 font-medium">
                  Reprise {isWeekend(delivery.pickupDate) ? 'week-end' : getHolidayName(delivery.pickupDate)} confirmée
                </span>
                <p className="text-amber-400/70 text-sm mt-1">
                  Une majoration sera appliquée pour garantir ce créneau.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
