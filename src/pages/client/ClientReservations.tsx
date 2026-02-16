import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Filter } from 'lucide-react';
import { ReservationsService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import ReservationCard from '../../components/client/ReservationCard';

interface ReservationItem {
  id: string;
  product_id: string;
  quantity: number;
  duration_days: number;
  unit_price: number;
  subtotal: number;
}

interface Reservation {
  id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  delivery_time?: string;
  delivery_type: 'delivery' | 'pickup';
  status: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: any;
  reservation_items?: ReservationItem[];
}

export default function ClientReservations() {
  const { user } = useAuth();
  const [customerReservations, setCustomerReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    if (!user) return;
    setError(null);

    try {
      setLoading(true);
      const reservations = await ReservationsService.getCustomerReservations(user.id);
      setCustomerReservations(reservations as unknown as Reservation[]);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('Impossible de charger vos réservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [user]);

  const filteredReservations = customerReservations.filter(reservation => {
    return statusFilter === 'all' || reservation.status === statusFilter;
  });

  const stats = {
    total: customerReservations.length,
    active: customerReservations.filter(r => r.status === 'confirmed' || r.status === 'preparing').length,
    completed: customerReservations.filter(r => r.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#33ffcc] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-white/60">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="mt-6 md:mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
          <p className="text-red-300">{error}</p>
          <button onClick={loadReservations} className="px-4 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium">Réessayer</button>
        </div>
      )}
      {/* Header avec stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#33ffcc]/20 via-[#66cccc]/10 to-transparent backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl mt-6 md:mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#33ffcc]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">Mes réservations</h1>
          <p className="text-base text-gray-300 mb-6">Consultez l'historique de toutes vos réservations</p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-gray-300 mb-1">Total</p>
              <p className="text-2xl font-black text-white">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-gray-300 mb-1">Actives</p>
              <p className="text-2xl font-black text-[#33ffcc]">{stats.active}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-gray-300 mb-1">Terminées</p>
              <p className="text-2xl font-black text-green-400">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[#33ffcc]" />
            <label className="text-sm font-bold text-white">Filtrer par statut:</label>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:ring-2 focus:ring-[#33ffcc] focus:border-[#33ffcc] focus:outline-none transition-all font-medium"
          >
            <option value="all" className="bg-[#000033]">Toutes les réservations</option>
            <option value="pending" className="bg-[#000033]">En attente</option>
            <option value="confirmed" className="bg-[#000033]">Confirmées</option>
            <option value="preparing" className="bg-[#000033]">En préparation</option>
            <option value="delivered" className="bg-[#000033]">Livrées</option>
            <option value="completed" className="bg-[#000033]">Terminées</option>
            <option value="cancelled" className="bg-[#000033]">Annulées</option>
          </select>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-sm text-[#fe1979] hover:text-[#ff3399] font-medium transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center shadow-xl">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-[#33ffcc]/20 rounded-full mb-6">
              <Package className="w-12 h-12 text-[#33ffcc]" />
            </div>
            <h3 className="text-xl font-black text-white mb-3">Aucune réservation</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {statusFilter !== 'all'
                ? `Vous n'avez pas de réservation avec le statut sélectionné`
                : `Vous n'avez pas encore de réservations`
              }
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105"
            >
              <Package className="w-5 h-5" />
              Parcourir le catalogue
            </Link>
          </div>
        ) : (
          filteredReservations.map((reservation, index) => (
            <ReservationCard key={reservation.id} reservation={reservation} index={index} />
          ))
        )}
      </div>

      {/* Message de fin */}
      {filteredReservations.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">
            Vous avez consulté {filteredReservations.length} réservation(s)
          </p>
        </div>
      )}
    </div>
  );
}
