import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Package, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ReservationsService, StatsService, CustomersService } from '../../services';
import { Order, Customer } from '../../types';
import ReservationCard from '../../components/client/ReservationCard';
import { DashboardHero, DashboardStatCards, DashboardInfoCard, DashboardQuickActions } from '../../components/client/dashboard';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerReservations, setCustomerReservations] = useState<Order[]>([]);
  const [stats, setStats] = useState<{ total_reservations: number; total_spent: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setError(null);
    try {
      setLoading(true);
      const [customerData, reservationsData, statsData] = await Promise.all([
        CustomersService.getCustomerById(user.id),
        ReservationsService.getCustomerReservations(user.id),
        StatsService.getCustomerStats(user.id),
      ]);
      setCustomer(customerData);
      setCustomerReservations(reservationsData || []);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Impossible de charger votre tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'client') return;
    loadData();
  }, [user]);

  const activeReservations = customerReservations.filter(
    r => r.status === 'confirmed' || r.status === 'preparing'
  );
  const recentReservations = customerReservations.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#33ffcc] animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'client') {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400">Veuillez vous connecter en tant que client</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={loadData} className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded bg-red-500/10">
            Réessayer
          </button>
        </div>
      )}

      {/* Hero */}
      <DashboardHero
        firstName={user.firstName || 'Client'}
        reservations={customerReservations}
      />

      {/* Stats */}
      <DashboardStatCards
        activeReservations={activeReservations.length}
        totalReservations={stats?.total_reservations || 0}
        totalSpent={stats?.total_spent || 0}
      />

      {/* Recent reservations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Réservations récentes</h2>
          {customerReservations.length > 3 && (
            <Link
              to="/client/reservations"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#33ffcc] transition-colors"
            >
              Voir toutes <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {recentReservations.length > 0 ? (
          <div className="space-y-2">
            {recentReservations.map((reservation, index) => (
              <ReservationCard key={reservation.id} reservation={reservation as any} index={index} />
            ))}
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-10 text-center">
            <Package className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-4">Aucune réservation pour le moment</p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#33ffcc] text-[#000033] text-sm font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
            >
              Parcourir le catalogue
            </Link>
          </div>
        )}
      </section>

      {/* Info + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <DashboardInfoCard customer={customer} email={user.email} />
        <DashboardQuickActions />
      </div>
    </div>
  );
}
