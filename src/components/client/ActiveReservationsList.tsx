import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { Order } from '../../types';

interface ActiveReservationsListProps {
  reservations: Order[];
}

export default function ActiveReservationsList({ reservations }: ActiveReservationsListProps) {
  if (reservations.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 md:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white flex items-center gap-3">
          <Package className="w-6 h-6 text-[#33ffcc]" />
          Réservations en cours
        </h2>
        <Link
          to="/client/reservations"
          className="flex items-center gap-2 px-4 py-2 bg-[#33ffcc]/20 border border-[#33ffcc]/30 rounded-xl text-[#33ffcc] hover:bg-[#33ffcc]/30 transition-all duration-300 text-sm font-medium"
        >
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 hover:border-[#33ffcc]/50 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-3 mb-3">
                  <h3 className="font-bold text-white text-lg">
                    {reservation.reservation_items?.map((item: any) => item.product?.name || 'Produit').join(', ') || 'Réservation'}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    reservation.status === 'confirmed'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {reservation.status === 'confirmed' ? '✓ Confirmé' : '⏳ En préparation'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-[#33ffcc]" />
                    <span>Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-[#66cccc]" />
                    <span>Livraison {reservation.delivery_type === 'delivery' ? 'à domicile' : 'en magasin'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CreditCard className="w-4 h-4 text-green-400" />
                    <span>{reservation.total}€ - {reservation.status === 'confirmed' ? '✓ Confirmé' : '⏳ En attente'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/client/reservations/${reservation.id}`}
                  className="flex-1 lg:flex-none px-5 py-2.5 text-sm bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105 text-center"
                >
                  Voir détails
                </Link>
                <button
                  onClick={() => {
                    // TODO: Implémenter le contact support
                    alert('📧 Message envoyé au support !');
                  }}
                  className="flex-1 lg:flex-none px-5 py-2.5 text-sm border-2 border-white/20 text-white rounded-xl hover:border-[#33ffcc] hover:bg-white/10 transition-all duration-300 font-medium"
                >
                  Contacter
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
