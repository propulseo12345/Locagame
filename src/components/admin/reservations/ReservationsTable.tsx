import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Truck, Package, Users, RefreshCw } from 'lucide-react';
import { Order, RecipientData } from '../../../types';
import ReservationStatusBadge from './ReservationStatusBadge';
import ReservationExpandedRow from './ReservationExpandedRow';

interface ReservationsTableProps {
  reservations: Order[];
  expandedRow: string | null;
  onToggleRow: (id: string | null) => void;
  onValidate: (id: string) => void;
  onReject: (id: string) => void;
  onSyncPayment?: (id: string) => void;
  syncingId?: string | null;
}

export default function ReservationsTable({
  reservations,
  expandedRow,
  onToggleRow,
  onValidate,
  onReject,
  onSyncPayment,
  syncingId,
}: ReservationsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N&deg; Commande</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => {
              const customer = reservation.customer as any;
              const items = (reservation as any).reservation_items || [];
              const recipientData = (reservation as any).recipient_data as RecipientData | null;
              const isExpanded = expandedRow === reservation.id;
              const deliveryType = (reservation as any).delivery_type;
              const isSyncing = syncingId === reservation.id;

              return (
                <>
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleRow(isExpanded ? null : reservation.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.id.substring(0, 8).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer?.first_name} {customer?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{customer?.email}</div>
                      {customer?.company_name && (
                        <div className="text-xs text-blue-600">{customer.company_name}</div>
                      )}
                      {recipientData && !recipientData.sameAsCustomer && (
                        <div className="mt-1 text-xs text-orange-600 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Recep: {recipientData.firstName} {recipientData.lastName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        deliveryType === 'pickup'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {deliveryType === 'pickup' ? (
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Pick-up
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Livraison
                          </span>
                        )}
                      </span>
                      {deliveryType === 'pickup' && (reservation as any).pickup_time && (
                        <div className="text-xs text-gray-500 mt-1">
                          Retrait: {(reservation as any).pickup_time}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{items.length} produit(s)</div>
                      {items.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {items.slice(0, 2).map((item: any, idx: number) => (
                            <span key={idx}>
                              {item.quantity}x {item.product_id?.substring(0, 8) || 'Produit'}
                              {idx < Math.min(items.length, 2) - 1 && ', '}
                            </span>
                          ))}
                          {items.length > 2 && '...'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date((reservation as any).start_date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        au {new Date((reservation as any).end_date).toLocaleDateString('fr-FR')}
                      </div>
                      {(reservation as any).delivery_time && (
                        <div className="text-xs text-gray-500">
                          Livraison: {(reservation as any).delivery_time}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xl font-bold text-gray-900">
                        {(reservation as any).total || reservation.total}&euro;
                      </div>
                      {(reservation as any).discount > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          -{(reservation as any).discount}&euro;
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ReservationStatusBadge
                        status={reservation.status}
                        paymentStatus={reservation.payment_status}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {reservation.status === 'pending_payment' && onSyncPayment && (
                          <button
                            onClick={() => onSyncPayment(reservation.id)}
                            disabled={isSyncing}
                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Sync...' : 'Verifier paiement'}
                          </button>
                        )}
                        {reservation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onValidate(reservation.id)}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              Valider
                            </button>
                            <button
                              onClick={() => onReject(reservation.id)}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        <Link
                          to={`/admin/reservations/${reservation.id}`}
                          className="text-[#33ffcc] hover:text-[#66cccc]"
                        >
                          Voir details
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <ReservationExpandedRow key={`${reservation.id}-details`} reservation={reservation} />
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      {reservations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucune reservation trouvee
        </div>
      )}
    </div>
  );
}
