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

// Horaires d'ouverture de l'entrepot
const WAREHOUSE_HOURS = {
  weekday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
  saturday: ['09:00', '10:00', '11:00', '12:00'],
  sunday: [],
};

// Adresse de l'entrepot LOCAGAME
const WAREHOUSE_ADDRESS = {
  name: "Entrepôt LOCAGAME",
  street: "553 rue St Pierre",
  city: "13012 Marseille",
  phone: "04 30 22 03 83",
  hours: "Lun-Ven: 9h-12h / 14h-18h | Sam: 9h-12h",
};

function getAvailableSlots(dateStr: string): string[] {
  if (!dateStr) return [];
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0) return []; // Dimanche
  if (dayOfWeek === 6) return WAREHOUSE_HOURS.saturday;
  return WAREHOUSE_HOURS.weekday;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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

  useEffect(() => {
    setPickupSlots(getAvailableSlots(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    setReturnSlots(getAvailableSlots(endDate));
  }, [endDate]);

  const isSunday = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr).getDay() === 0;
  };

  return (
    <div className="space-y-6">
      {/* Adresse de l'entrepot */}
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

      {/* Retrait du materiel */}
      <div className="space-y-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#33ffcc]" />
          Retrait du materiel
        </h3>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-2">Date de retrait</p>
          <p className="text-white font-medium">{formatDate(selectedDate)}</p>
        </div>

        {isSunday(selectedDate) ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              L'entrepot est ferme le dimanche. Veuillez choisir une autre date de debut.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 text-sm mb-3">Choisissez votre creneau de retrait *</p>
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

      {/* Retour du materiel */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#fe1979]" />
          Retour du materiel
        </h3>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-2">Date de retour</p>
          <p className="text-white font-medium">{formatDate(endDate)}</p>
        </div>

        {isSunday(endDate) ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              L'entrepot est ferme le dimanche. Veuillez choisir une autre date de fin.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 text-sm mb-3">Choisissez votre creneau de retour *</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {returnSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onReturnTimeChange(slot)}
                  className={`py-3 px-4 rounded-xl border-2 text-center transition-all ${
                    returnTime === slot
                      ? 'border-[#fe1979] bg-[#fe1979]/10 text-[#fe1979] font-semibold'
                      : 'border-white/10 hover:border-white/30 text-gray-300'
                  }`}
                >
                  {slot}
                </button>
              ))}
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
            <strong>Rappel :</strong> Presentez-vous avec une piece d'identite et le numero de reservation.
            Le materiel devra etre rendu a la meme adresse dans l'etat initial.
          </span>
        </p>
      </div>
    </div>
  );
}
