import { Navigation } from 'lucide-react';
import { DeliveryTask } from '../../../types';

interface TaskAddressInfoProps {
  address: DeliveryTask['address'];
  scheduledDate: string;
  scheduledTime: string;
}

export function TaskAddressInfo({ address, scheduledDate, scheduledTime }: TaskAddressInfoProps) {
  const fullAddress = `${address.street}, ${address.postalCode} ${address.city}, ${address.country}`;
  const mapsUrl = `https://maps.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Adresse de livraison</h2>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block space-y-2 hover:opacity-80 transition-opacity"
      >
        <p className="text-base font-semibold text-gray-900">
          {address.street}
        </p>
        <p className="text-base text-gray-600">
          {address.postalCode} {address.city}
        </p>
        <p className="text-base text-gray-600">
          {address.country}
        </p>
      </a>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 min-h-[48px] mt-4 bg-[#000033] text-white font-medium rounded-lg hover:bg-[#000044] transition-colors active:scale-95"
      >
        <Navigation className="w-5 h-5" />
        <span>Ouvrir dans Maps</span>
      </a>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">{"Date et heure prévues"}</p>
        <p className="text-lg font-semibold text-gray-900">
          {new Date(scheduledDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-lg font-semibold text-[#33ffcc]">
          {scheduledTime}
        </p>
      </div>
    </div>
  );
}
