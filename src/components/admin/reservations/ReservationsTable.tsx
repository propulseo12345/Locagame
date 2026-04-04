import { Fragment } from 'react';
import { Search } from 'lucide-react';
import { Order } from '../../../types';
import ReservationTableRow from './ReservationTableRow';
import ReservationExpandedRow from './ReservationExpandedRow';
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
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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

      {!loading && reservations.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Aucune réservation ne correspond</p>
          {hasActiveFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="mt-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
