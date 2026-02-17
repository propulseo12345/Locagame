import { Calendar as CalendarIcon, MapPin, Building, Car, Zap } from 'lucide-react';
import { Order } from '../../../types';

interface TaskEventDetailsProps {
  reservation: Order;
}

export function TaskEventDetails({ reservation }: TaskEventDetailsProps) {
  if (!reservation.event_details) return null;

  const details = reservation.event_details as any;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-purple-500" />
        {"D\u00e9tails de l'\u00e9v\u00e9nement"}
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {reservation.event_type && (
          <div>
            <p className="text-sm text-gray-600 mb-1">{"Type d'\u00e9v\u00e9nement"}</p>
            <p className="text-base font-semibold text-gray-900">{reservation.event_type}</p>
          </div>
        )}
        {details.guestCount && (
          <div>
            <p className="text-sm text-gray-600 mb-1">{"Nombre d'invit\u00e9s"}</p>
            <p className="text-base font-semibold text-gray-900">{details.guestCount} personnes</p>
          </div>
        )}
        {details.venueName && (
          <div className="col-span-2">
            <p className="text-sm text-gray-600 mb-1">Lieu / Salle</p>
            <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {details.venueName}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t border-gray-200">
        <div className={`flex items-center gap-2 p-2 rounded-lg ${details.hasElevator ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          <Building className="w-4 h-4" />
          <span className="text-sm">{"Ascenseur "}{details.hasElevator ? '\u2713' : '\u2717'}</span>
        </div>
        <div className={`flex items-center gap-2 p-2 rounded-lg ${details.parkingAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          <Car className="w-4 h-4" />
          <span className="text-sm">{"Parking "}{details.parkingAvailable ? '\u2713' : '\u2717'}</span>
        </div>
        <div className={`flex items-center gap-2 p-2 rounded-lg ${details.electricityAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          <Zap className="w-4 h-4" />
          <span className="text-sm">{"\u00c9lectricit\u00e9 "}{details.electricityAvailable ? '\u2713' : '\u2717'}</span>
        </div>
        {details.floorNumber && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-700">
            <span className="text-sm">{"\u00c9tage "}{details.floorNumber}</span>
          </div>
        )}
      </div>

      {details.accessDifficulty && details.accessDifficulty !== 'Aucune' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800">
            {"Difficult\u00e9 d'acc\u00e8s: "}{details.accessDifficulty}
          </p>
          {details.accessDetails && (
            <p className="text-sm text-yellow-700 mt-1">{details.accessDetails}</p>
          )}
        </div>
      )}
    </div>
  );
}
