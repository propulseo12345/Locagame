import { ClipboardList } from 'lucide-react';
import type { EventDetailsState } from '../../hooks/checkout/types';
import type { EventType } from '../../services';
import { inputClass, labelClass, errorClass } from '../../hooks/checkout/types';

interface CheckoutEventDetailsProps {
  eventDetails: EventDetailsState;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetailsState>>;
  errors: Record<string, string>;
  eventTypes: EventType[];
}

export function CheckoutEventDetails({
  eventDetails,
  setEventDetails,
  errors,
  eventTypes,
}: CheckoutEventDetailsProps) {
  return (
    <div className="pt-4 border-t border-white/10">
      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-[#33ffcc]" />
        Details de l'evenement
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Type d'evenement *</label>
            <select
              value={eventDetails.eventType}
              onChange={(e) => setEventDetails({ ...eventDetails, eventType: e.target.value })}
              className={inputClass}
            >
              <option value="" className="bg-[#000033]">Selectionnez</option>
              {eventTypes.map(type => (
                <option key={type.id} value={type.name} className="bg-[#000033]">{type.name}</option>
              ))}
            </select>
            {errors.eventType && <p className={errorClass}>{errors.eventType}</p>}
          </div>
          <div>
            <label className={labelClass}>Nombre d'invites estime</label>
            <input
              type="number"
              value={eventDetails.guestCount}
              onChange={(e) => setEventDetails({ ...eventDetails, guestCount: e.target.value })}
              className={inputClass}
              placeholder="50"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Nom du lieu / Salle</label>
          <input
            type="text"
            value={eventDetails.venueName}
            onChange={(e) => setEventDetails({ ...eventDetails, venueName: e.target.value })}
            className={inputClass}
            placeholder="Chateau de..., Salle des fetes de..."
          />
        </div>
      </div>
    </div>
  );
}
