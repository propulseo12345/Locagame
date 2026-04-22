import { Link } from 'react-router-dom';
import { Order } from '../../types';

interface RecentReservationsTableProps {
  reservations: Order[];
}

function statusLabel(status: string): string {
  switch (status) {
    case 'completed': return 'Terminée';
    case 'confirmed': return 'Confirmée';
    case 'pending': return 'En attente paiement';
    case 'pending_payment': return 'Paiement en attente';
    case 'preparing': return 'En préparation';
    case 'delivered': return 'Livré';
    case 'cancelled': return 'Annulé';
    default: return status;
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'pending':
    case 'pending_payment':
      return 'ring-1 ring-amber-200 bg-amber-50 text-amber-700';
    case 'confirmed':
      return 'ring-1 ring-green-200 bg-green-50 text-green-700';
    case 'preparing':
      return 'ring-1 ring-violet-200 bg-violet-50 text-violet-700';
    case 'delivered':
      return 'ring-1 ring-cyan-200 bg-cyan-50 text-cyan-700';
    case 'completed':
      return 'ring-1 ring-gray-200 bg-gray-50 text-gray-700';
    case 'cancelled':
      return 'ring-1 ring-red-200 bg-red-50 text-red-700';
    default:
      return 'ring-1 ring-gray-200 bg-gray-50 text-gray-700';
  }
}

/* ------------------------------------------------------------------ */
/*  Mobile reservation card for dashboard                              */
/* ------------------------------------------------------------------ */
function MobileRecentCard({ reservation }: { reservation: Order }) {
  const customer = reservation.customer as any;
  const total = (reservation as any).total || reservation.total;
  const startDate = (reservation as any).start_date;
  const customerName = customer?.first_name && customer?.last_name
    ? `${customer.first_name} ${customer.last_name}` : 'Invité';

  return (
    <Link
      to={`/admin/reservations/${reservation.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-3 active:scale-95 transition-transform"
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="min-w-0">
          <p className="text-xs font-mono font-bold text-gray-900">{reservation.id.substring(0, 8).toUpperCase()}</p>
          <p className="text-xs text-gray-500 truncate">{customerName}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${statusBadgeClass(reservation.status)}`}>
          {statusLabel(reservation.status)}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        {startDate && <span>{new Date(startDate).toLocaleDateString('fr-FR')}</span>}
        <span className="text-sm font-bold text-gray-900 tabular-nums">{total}&nbsp;&euro;</span>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function RecentReservationsTable({ reservations }: RecentReservationsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Réservations récentes</h3>
        <Link
          to="/admin/reservations"
          className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors min-h-[44px] flex items-center active:scale-95"
        >
          Voir tout &rarr;
        </Link>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2 p-3">
        {reservations.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">Aucune réservation récente</p>
        ) : (
          reservations.map((reservation) => (
            <MobileRecentCard key={reservation.id} reservation={reservation} />
          ))
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full" aria-label="Réservations récentes">
          <thead>
            <tr className="bg-gray-50 text-left border-b border-gray-100">
              <th scope="col" className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">N° Commande</th>
              <th scope="col" className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Produits</th>
              <th scope="col" className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
              <th scope="col" className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                  Aucune réservation récente
                </td>
              </tr>
            ) : (
              reservations.map((reservation, idx) => {
                const customer = reservation.customer as any;
                const items = (reservation as any).reservation_items || [];
                return (
                  <tr
                    key={reservation.id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-100/60 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 tabular-nums">
                      {reservation.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {customer?.first_name} {customer?.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {items.length} produit(s)
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date((reservation as any).start_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold tabular-nums text-gray-900">
                      {(reservation as any).total || reservation.total} &euro;
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${statusBadgeClass(reservation.status)}`}>
                        {statusLabel(reservation.status)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
