import React from 'react';
import { Truck, Package, Calendar, Clock, MapPin } from 'lucide-react';
import { Order } from '../../../types';

interface DeliveryInfoCardProps {
  reservation: Order;
}

export default function DeliveryInfoCard({ reservation }: DeliveryInfoCardProps) {
  const deliveryAddress = reservation.delivery_address as any;

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
                {new Date(reservation.start_date).toLocaleDateString('fr-FR', {
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
                {new Date(reservation.end_date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Creneaux */}
        {reservation.delivery_type === 'pickup' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">Creneau retrait: </span>
                <span className="font-medium">{reservation.pickup_time || reservation.pickup_slot || 'Non specifie'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">Creneau retour: </span>
                <span className="font-medium">{reservation.return_time || 'Non specifie'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">Creneau livraison: </span>
              <span className="font-medium">{reservation.delivery_time || 'Non specifie'}</span>
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
                  {deliveryAddress.street || deliveryAddress.address}
                  {deliveryAddress.address_complement && (
                    <span className="block text-sm text-gray-600">{deliveryAddress.address_complement}</span>
                  )}
                  <span className="block">
                    {deliveryAddress.postal_code || deliveryAddress.postalCode} {deliveryAddress.city}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
