import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Filter, Loader2, X } from 'lucide-react';
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

const STATUS_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending_payment', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'completed', label: 'Terminées' },
  { value: 'cancelled', label: 'Annulées' },
];

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
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#33ffcc] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={loadReservations} className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded bg-red-500/10">
            Réessayer
          </button>
        </div>
      )}

      {/* Header + Stats — same row on desktop */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white tracking-tight">Mes réservations</h1>
          <p className="text-sm text-gray-400 mt-1 truncate">Consultez l'historique de toutes vos réservations</p>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide sm:overflow-visible">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 min-w-[120px] flex-shrink-0">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Total</p>
            <p className="text-xl font-bold text-white tabular-nums">{stats.total}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 min-w-[120px] flex-shrink-0">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Actives</p>
            <p className="text-xl font-bold text-[#33ffcc] tabular-nums">{stats.active}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 min-w-[120px] flex-shrink-0">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Terminées</p>
            <p className="text-xl font-bold text-emerald-400 tabular-nums">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Filter pills — scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === option.value
                ? 'bg-[#33ffcc]/10 text-[#33ffcc] border border-[#33ffcc]/20'
                : 'text-gray-400 border border-white/[0.06] hover:text-white hover:border-white/[0.12]'
            }`}
          >
            {option.label}
          </button>
        ))}
        {statusFilter !== 'all' && (
          <button
            onClick={() => setStatusFilter('all')}
            className="p-1.5 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Reservations list */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-12 text-center">
          <Package className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-2">Aucune réservation</h3>
          <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
            {statusFilter !== 'all'
              ? 'Aucune réservation avec ce statut'
              : "Vous n'avez pas encore de réservations"
            }
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#33ffcc] text-[#000033] text-sm font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
          >
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredReservations.map((reservation, index) => (
            <ReservationCard key={reservation.id} reservation={reservation} index={index} />
          ))}
        </div>
      )}

      {/* Footer count */}
      {filteredReservations.length > 0 && (
        <p className="text-center text-xs text-gray-600 py-2">
          {filteredReservations.length} réservation{filteredReservations.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
