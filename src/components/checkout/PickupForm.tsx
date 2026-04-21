import { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, AlertCircle, Info } from 'lucide-react';

interface PickupFormProps {
  selectedDate: string;
  endDate: string;
  pickupTime: string;
  returnTime: string;
  onPickupTimeChange: (time: string) => void;
  onReturnTimeChange: (time: string) => void;
  errors?: Record<string, string>;
}

// Horaires d'ouverture de l'entrepôt
const WAREHOUSE_HOURS = {
  weekday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
  saturday: [],
  sunday: [],
};

// Adresse de l'entrepôt LOCAGAME
const WAREHOUSE_ADDRESS = {
  name: "Entrepôt LOCAGAME",
  street: "553 rue St Pierre",
  city: "13012 Marseille",
  phone: "04 30 22 03 83",
  hours: "Lun-Ven: 9h-12h / 14h-18h | Sam-Dim: Fermé",
};

function getAvailableSlots(dateStr: string): string[] {
  if (!dateStr) return [];
  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0) return []; // Dimanche
  if (dayOfWeek === 6) return WAREHOUSE_HOURS.saturday;
  return WAREHOUSE_HOURS.weekday;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function PickupForm({
  selectedDate,
  endDate,
  pickupTime,
  returnTime,
  onPickupTimeChange,
  onReturnTimeChange,
  errors = {},
}: PickupFormProps) {
  const [pickupSlots, setPickupSlots] = useState<string[]>([]);
  const [returnSlots, setReturnSlots] = useState<string[]>([]);

  const isSameDay = selectedDate === endDate && !!selectedDate;

  useEffect(() => {
    setPickupSlots(getAvailableSlots(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    setReturnSlots(getAvailableSlots(endDate));
  }, [endDate]);

  // Auto-reset return time if it becomes invalid (same day, return <= pickup)
  useEffect(() => {
    if (!isSameDay || !pickupTime || !returnTime) return;
    if (timeToMinutes(returnTime) <= timeToMinutes(pickupTime)) {
      onReturnTimeChange('');
    }
  }, [pickupTime, isSameDay]);

  const isReturnSlotDisabled = (slot: string): boolean => {
    if (!isSameDay || !pickupTime) return false;
    return timeToMinutes(slot) <= timeToMinutes(pickupTime);
  };

  const isWeekend = (dateStr: string) => {
    if (!dateStr) return false;
    const day = new Date(dateStr + 'T00:00:00').getDay();
    return day === 0 || day === 6; // Dimanche ou Samedi
  };

  return (
    <div className="space-y-6">
      {/* Adresse de l'entrepôt */}
      <div className="bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-xl p-5">
        <h3 className="font-semibold text-[#33ffcc] mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Adresse de retrait
        </h3>
        <div className="text-white">
          <p className="font-medium">{WAREHOUSE_ADDRESS.name}</p>
          <p className="text-gray-300">{WAREHOUSE_ADDRESS.street}</p>
          <p className="text-gray-300">{WAREHOUSE_ADDRESS.city}</p>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-sm">
          <span className="text-gray-400 flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {WAREHOUSE_ADDRESS.phone}
          </span>
          <span className="text-gray-400 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {WAREHOUSE_ADDRESS.hours}
          </span>
        </div>
      </div>

      {/* Retrait du matériel */}
      <div className="space-y-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#33ffcc]" />
          Retrait du matériel
        </h3>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-2">Date de retrait</p>
          <p className="text-white font-medium">{formatDate(selectedDate)}</p>
        </div>

        {isWeekend(selectedDate) ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              L'entrepôt est fermé le week-end (samedi et dimanche). Veuillez choisir une date de début en semaine.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 text-sm mb-3">Choisissez votre créneau de retrait *</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {pickupSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onPickupTimeChange(slot)}
                  className={`py-3 px-4 rounded-xl border-2 text-center transition-all ${
                    pickupTime === slot
                      ? 'border-[#33ffcc] bg-[#33ffcc]/10 text-[#33ffcc] font-semibold'
                      : 'border-white/10 hover:border-white/30 text-gray-300'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            {errors.pickupTime && (
              <p className="text-red-400 text-xs mt-2">{errors.pickupTime}</p>
            )}
          </div>
        )}
      </div>

      {/* Retour du matériel */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#fe1979]" />
          Retour du matériel
        </h3>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-2">Date de retour</p>
          <p className="text-white font-medium">{formatDate(endDate)}</p>
        </div>

        {isWeekend(endDate) ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              L'entrepôt est fermé le week-end (samedi et dimanche). Veuillez choisir une date de retour en semaine.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 text-sm mb-3">Choisissez votre créneau de retour *</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {returnSlots.map((slot) => {
                const disabled = isReturnSlotDisabled(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={disabled}
                    onClick={() => onReturnTimeChange(slot)}
                    className={`py-3 px-4 rounded-xl border-2 text-center transition-all ${
                      disabled
                        ? 'border-white/5 text-gray-600 cursor-not-allowed opacity-40'
                        : returnTime === slot
                          ? 'border-[#fe1979] bg-[#fe1979]/10 text-[#fe1979] font-semibold'
                          : 'border-white/10 hover:border-white/30 text-gray-300'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            {errors.returnTime && (
              <p className="text-red-400 text-xs mt-2">{errors.returnTime}</p>
            )}
          </div>
        )}
      </div>

      {/* Rappel */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <p className="text-yellow-400 text-sm flex items-start gap-2">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <span>
            <strong>Rappel :</strong> Présentez-vous avec une pièce d'identité et le numéro de réservation.
            Le matériel devra être rendu à la même adresse dans l'état initial.
          </span>
        </p>
      </div>
    </div>
  );
}
