import { Truck, Calendar, Clock } from 'lucide-react';

interface DeliveryData {
  address: string;
  addressComplement: string;
  postalCode: string;
  city: string;
  date: string;
  timeSlot: string;
  pickupDate: string;
  pickupTimeSlot: string;
}

interface DeliveryStepProps {
  delivery: DeliveryData;
  errors: Record<string, string>;
  onChange: (data: DeliveryData) => void;
}

const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none transition-colors";
const labelClass = "block text-sm text-gray-400 mb-1.5";
const errorClass = "text-red-400 text-xs mt-1";

const timeSlots = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00'
];

export function DeliveryStep({ delivery, errors, onChange }: DeliveryStepProps) {
  const updateField = (field: keyof DeliveryData, value: string) => {
    onChange({ ...delivery, [field]: value });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Adresse de livraison</h2>
        <p className="text-gray-400 text-sm">Lieu de l'événement</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Adresse *</label>
          <input
            type="text"
            value={delivery.address}
            onChange={(e) => updateField('address', e.target.value)}
            className={inputClass}
            placeholder="123 rue de la Paix"
          />
          {errors.address && <p className={errorClass}>{errors.address}</p>}
        </div>
        <div>
          <label className={labelClass}>Complément d'adresse</label>
          <input
            type="text"
            value={delivery.addressComplement}
            onChange={(e) => updateField('addressComplement', e.target.value)}
            className={inputClass}
            placeholder="Bâtiment, étage, digicode..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Code postal *</label>
            <input
              type="text"
              value={delivery.postalCode}
              onChange={(e) => updateField('postalCode', e.target.value)}
              className={inputClass}
              placeholder="13001"
            />
            {errors.postalCode && <p className={errorClass}>{errors.postalCode}</p>}
          </div>
          <div>
            <label className={labelClass}>Ville *</label>
            <input
              type="text"
              value={delivery.city}
              onChange={(e) => updateField('city', e.target.value)}
              className={inputClass}
              placeholder="Marseille"
            />
            {errors.city && <p className={errorClass}>{errors.city}</p>}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#33ffcc]" />
          Créneau de livraison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date de livraison *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={delivery.date}
                onChange={(e) => updateField('date', e.target.value)}
                min={today}
                className={`${inputClass} pl-10 [color-scheme:dark]`}
              />
            </div>
            {errors.date && <p className={errorClass}>{errors.date}</p>}
          </div>
          <div>
            <label className={labelClass}>Créneau horaire *</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={delivery.timeSlot}
                onChange={(e) => updateField('timeSlot', e.target.value)}
                className={`${inputClass} pl-10`}
              >
                <option value="" className="bg-[#000033]">Sélectionnez</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot} className="bg-[#000033]">{slot}</option>
                ))}
              </select>
            </div>
            {errors.timeSlot && <p className={errorClass}>{errors.timeSlot}</p>}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#33ffcc] rotate-180" />
          Créneau de récupération
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date de récupération</label>
            <input
              type="date"
              value={delivery.pickupDate}
              onChange={(e) => updateField('pickupDate', e.target.value)}
              min={delivery.date || today}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </div>
          <div>
            <label className={labelClass}>Créneau horaire</label>
            <select
              value={delivery.pickupTimeSlot}
              onChange={(e) => updateField('pickupTimeSlot', e.target.value)}
              className={inputClass}
            >
              <option value="" className="bg-[#000033]">Sélectionnez</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot} className="bg-[#000033]">{slot}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { DeliveryData };
