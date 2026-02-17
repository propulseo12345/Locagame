import { Truck } from 'lucide-react';
import ReservationStatusBadge from './ReservationStatusBadge';
import type { UnassignedReservation } from './types';

interface UnassignedReservationsTableProps {
  reservations: UnassignedReservation[];
  onAssignClick: (reservation: UnassignedReservation) => void;
}

export default function UnassignedReservationsTable({
  reservations,
  onAssignClick,
}: UnassignedReservationsTableProps) {
  if (reservations.length === 0) return null;

  return (
    <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-600" />
            Commandes a assigner ({reservations.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Ces reservations necessitent une assignation a un technicien
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-orange-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">N&deg; Commande</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date livraison</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Adresse</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statut</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => {
              const customer = reservation.customer as any;
              const address = reservation.delivery_address as any;
              return (
                <tr key={reservation.id} className="hover:bg-orange-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.id.substring(0, 8).toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {customer?.first_name} {customer?.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{customer?.email}</div>
                    {customer?.company_name && (
                      <div className="text-xs text-blue-600">{customer.company_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date((reservation as any).start_date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(reservation as any).delivery_time || 'Non specifie'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {address ? (
                      <div className="text-sm text-gray-900">
                        {address.address_line1}
                        {address.address_line2 && `, ${address.address_line2}`}
                        <div className="text-xs text-gray-500">
                          {address.postal_code} {address.city}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">Adresse non disponible</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {(reservation as any).total || reservation.total}&euro;
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => onAssignClick(reservation)}
                      className="px-4 py-2 bg-[#33ffcc] hover:bg-[#66cccc] text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Assigner
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
