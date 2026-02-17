import { AlertCircle, Info } from 'lucide-react';
import type { EventDetailsState } from '../../hooks/checkout/types';
import type { AccessDifficultyType } from '../../services';
import { inputClass, labelClass, errorClass } from '../../hooks/checkout/types';

interface CheckoutAccessDetailsProps {
  eventDetails: EventDetailsState;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetailsState>>;
  errors: Record<string, string>;
  accessDifficulties: AccessDifficultyType[];
}

export function CheckoutAccessDetails({
  eventDetails,
  setEventDetails,
  errors,
  accessDifficulties,
}: CheckoutAccessDetailsProps) {
  return (
    <>
      {/* Access details */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#fe1979]" />
          Acces au lieu
        </h3>

        {/* Equipment dimensions warning */}
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-amber-400 text-sm flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Veillez a verifier que les dimensions de vos acces (portes, couloirs, escaliers)
              permettent le passage du materiel commande afin d'assurer une livraison sans encombre.
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Difficulte d'acces</label>
            <select
              value={eventDetails.accessDifficulty}
              onChange={(e) => setEventDetails({ ...eventDetails, accessDifficulty: e.target.value })}
              className={inputClass}
            >
              {accessDifficulties.map(d => (
                <option key={d.value} value={d.value} className="bg-[#000033]">{d.label}</option>
              ))}
            </select>
          </div>

          {eventDetails.accessDifficulty !== 'none' && (
            <div>
              <label className={labelClass}>Precisions sur l'acces</label>
              <textarea
                value={eventDetails.accessDetails}
                onChange={(e) => setEventDetails({ ...eventDetails, accessDetails: e.target.value })}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Decrivez les difficultes d'acces..."
              />
              {errors.accessDetails && <p className={errorClass}>{errors.accessDetails}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={eventDetails.hasElevator}
                onChange={(e) => setEventDetails({ ...eventDetails, hasElevator: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
              />
              <span className="text-gray-300">Ascenseur disponible</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={eventDetails.parkingAvailable}
                onChange={(e) => setEventDetails({ ...eventDetails, parkingAvailable: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
              />
              <span className="text-gray-300">Parking disponible</span>
            </label>
          </div>

          {eventDetails.hasElevator && (
            <div>
              <label className={labelClass}>Etage</label>
              <input
                type="text"
                value={eventDetails.floorNumber}
                onChange={(e) => setEventDetails({ ...eventDetails, floorNumber: e.target.value })}
                className={inputClass}
                placeholder="2eme etage"
              />
            </div>
          )}

          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={eventDetails.electricityAvailable}
              onChange={(e) => setEventDetails({ ...eventDetails, electricityAvailable: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
            />
            <span className="text-gray-300">Electricite disponible sur place</span>
          </label>
        </div>
      </div>

      {/* Special requests */}
      <div className="pt-4 border-t border-white/10">
        <label className={labelClass}>Demandes particulieres / Notes</label>
        <textarea
          value={eventDetails.specialRequests}
          onChange={(e) => setEventDetails({ ...eventDetails, specialRequests: e.target.value })}
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Instructions speciales, demandes particulieres..."
        />
      </div>
    </>
  );
}
