import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Search, Truck, Store, Loader2 } from 'lucide-react';
import { Order } from '../../../types';
import ReservationTableRow from './ReservationTableRow';
import ReservationExpandedRow from './ReservationExpandedRow';
import ReservationStatusBadge from './ReservationStatusBadge';
import type { DeliveryTaskInfo } from './types';
import { TableRowSkeleton } from '../../ui/skeletons';

interface ReservationsTableProps {
  reservations: Order[];
  expandedRow: string | null;
  onToggleRow: (id: string | null) => void;
  onReject: (id: string) => void;
  onAssignClick: (reservation: Order) => void;
  deliveryTasksMap?: Record<string, DeliveryTaskInfo>;
  loading?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

function MobileReservationCard({ reservation, deliveryTasksMap }: { reservation: Order; deliveryTasksMap: Record<string, DeliveryTaskInfo> }) {
  const customer = reservation.customer as any;
  const items = (reservation as any).reservation_items || [];
  const deliveryType = (reservation as any).delivery_type;
  const startDate = (reservation as any).start_date;
  const total = (reservation as any).total || reservation.total;
  const customerName = customer?.first_name && customer?.last_name
    ? `${customer.first_name} ${customer.last_name}` : null;
  const taskInfo = deliveryTasksMap[reservation.id];

  return (
    <Link
      to={`/admin/reservations/${reservation.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-mono font-bold text-gray-900">{reservation.id.substring(0, 8).toUpperCase()}</p>
          <p className="text-xs text-gray-500 truncate">{customerName || 'Invité'}</p>
        </div>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          {deliveryType === 'pickup'
            ? <><Store className="w-3 h-3" /> Pick-up</>
            : <><Truck className="w-3 h-3" /> Livraison</>
          }
        </span>
        <span>{items.length} article{items.length > 1 ? 's' : ''}</span>
        {startDate && <span>{new Date(startDate).toLocaleDateString('fr-FR')}</span>}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900 tabular-nums">{total}&euro;</span>
        {taskInfo ? (
          <span className="text-xs text-gray-500">{taskInfo.technicianName}</span>
        ) : deliveryType === 'delivery' ? (
          <span className="text-xs text-red-500 font-medium">Non assigné</span>
        ) : null}
      </div>
    </Link>
  );
}

export default function ReservationsTable({
  reservations,
  expandedRow,
  onToggleRow,
  onReject,
  onAssignClick,
  deliveryTasksMap = {},
  loading = false,
  hasActiveFilters = false,
  onClearFilters,
}: ReservationsTableProps) {
  const emptyState = !loading && reservations.length === 0 && (
    <div className="text-center py-16">
      <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 font-medium">Aucune réservation ne correspond</p>
      {hasActiveFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-3 px-4 py-2 min-h-[44px] text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : reservations.length > 0 ? (
          reservations.map((reservation) => (
            <MobileReservationCard
              key={reservation.id}
              reservation={reservation}
              deliveryTasksMap={deliveryTasksMap}
            />
          ))
        ) : (
          emptyState
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Liste des réservations">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">N° Commande</th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Mode</th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Produits</th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Livreur</th>
                <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableRowSkeleton columns={9} rows={6} />
              ) : (
                reservations.map((reservation, index) => {
                  const isExpanded = expandedRow === reservation.id;
                  const taskInfo = deliveryTasksMap[reservation.id];
                  return (
                    <Fragment key={reservation.id}>
                      <ReservationTableRow
                        reservation={reservation}
                        isExpanded={isExpanded}
                        isEven={index % 2 === 0}
                        onToggleExpand={() => onToggleRow(isExpanded ? null : reservation.id)}
                        onReject={onReject}
                        onAssignClick={onAssignClick}
                        taskInfo={taskInfo}
                      />
                      {isExpanded && (
                        <ReservationExpandedRow reservation={reservation} />
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {emptyState}
      </div>
    </>
  );
}
