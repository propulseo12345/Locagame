
import { Truck, Package, Calendar, Clock, MapPin } from 'lucide-react';
import { Order } from '../../../types';

interface DeliveryInfoCardProps {
  reservation: Order;
  deliveryTasks?: any[];
}

export default function DeliveryInfoCard({ reservation, deliveryTasks }: DeliveryInfoCardProps) {
  const deliveryAddress = reservation.delivery_address as any;

  // Find the delivery task with vehicle info
  const deliveryTask = deliveryTasks?.find((t: any) => t.type === 'delivery') || deliveryTasks?.[0];
  const vehicle = deliveryTask?.vehicle;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {reservation.delivery_type === 'delivery' ? (
          <Truck className="w-5 h-5 text-blue-500" />
        ) : (
          <Package className="w-5 h-5 text-green-500" />
        )}
        {reservation.delivery_type === 'delivery' ? 'Livraison' : 'Retrait sur place'}
      </h2>

      <div className="space-y-4">
        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Date de debut</div>
              <div className="font-medium text-gray-900">
                {new Date(reservation.start_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Date de fin</div>
              <div className="font-medium text-gray-900">
                {new Date(reservation.end_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Créneaux */}
        {reservation.delivery_type === 'pickup' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">Créneau retrait: </span>
                <span className="font-medium">{reservation.pickup_time || reservation.pickup_slot || 'Non specifie'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">Créneau retour: </span>
                <span className="font-medium">{reservation.return_time || 'Non specifie'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">Créneau livraison: </span>
                <span className="font-medium">{reservation.delivery_time || 'Non specifie'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">Créneau reprise: </span>
                <span className="font-medium">{reservation.return_time || reservation.pickup_time || 'Non specifie'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Adresse de livraison */}
        {reservation.delivery_type === 'delivery' && deliveryAddress && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 mb-1">Adresse de livraison</div>
                <div className="font-medium text-gray-900">
                  {deliveryAddress.address_line1}
                  {deliveryAddress.address_line2 && (
                    <span className="block text-sm text-gray-600">{deliveryAddress.address_line2}</span>
                  )}
                  <span className="block">
                    {deliveryAddress.postal_code} {deliveryAddress.city}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Véhicule assigné */}
        {reservation.delivery_type === 'delivery' && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 mb-1">Véhicule assigné</div>
                {vehicle ? (
                  <div className="font-medium text-gray-900">
                    {vehicle.name}
                    {vehicle.license_plate && (
                      <span className="ml-2 text-sm text-gray-500">({vehicle.license_plate})</span>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">Aucun véhicule assigné</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
