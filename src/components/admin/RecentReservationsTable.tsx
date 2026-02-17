import { Link } from 'react-router-dom';
import { Order } from '../../types';

interface RecentReservationsTableProps {
  reservations: Order[];
}

export default function RecentReservationsTable({ reservations }: RecentReservationsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Réservations récentes</h3>
        <Link
          to="/admin/reservations"
          className="text-sm text-[#33ffcc] hover:text-[#66cccc] font-medium transition-colors"
        >
          Voir tout →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600 border-b">
              <th className="pb-3 font-medium">N° Commande</th>
              <th className="pb-3 font-medium">Client</th>
              <th className="pb-3 font-medium">Produits</th>
              <th className="pb-3 font-medium">Dates</th>
              <th className="pb-3 font-medium">Montant</th>
              <th className="pb-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Aucune réservation récente
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => {
                const customer = reservation.customer as any;
                const items = (reservation as any).reservation_items || [];
                return (
                  <tr key={reservation.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 text-sm font-medium text-gray-900">
                      {reservation.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {customer?.first_name} {customer?.last_name}
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {items.length} produit(s)
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {new Date((reservation as any).start_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4">
                      <div className="text-xl font-bold text-gray-900">
                        {(reservation as any).total || reservation.total}€
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reservation.status === 'completed' ? 'Terminé' :
                         reservation.status === 'confirmed' ? 'Confirmé' :
                         reservation.status === 'pending' ? 'En attente' :
                         reservation.status}
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
