import { DeliveryTask } from '../../../types';

interface TaskAddressInfoProps {
  address: DeliveryTask['address'];
  scheduledDate: string;
  scheduledTime: string;
}

export function TaskAddressInfo({ address, scheduledDate, scheduledTime }: TaskAddressInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Adresse de livraison</h2>
      <div className="space-y-2">
        <p className="text-base font-semibold text-gray-900">
          {address.street}
        </p>
        <p className="text-base text-gray-600">
          {address.postalCode} {address.city}
        </p>
        <p className="text-base text-gray-600">
          {address.country}
        </p>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">{"Date et heure pr\u00e9vues"}</p>
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
