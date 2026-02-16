import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Star, Package, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ReservationsService, StatsService, CustomersService } from '../../services';
import { Order, Customer } from '../../types';
import ActiveReservationsList from '../../components/client/ActiveReservationsList';
import QuickActions from '../../components/client/QuickActions';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerReservations, setCustomerReservations] = useState<Order[]>([]);
  const [stats, setStats] = useState<{
    total_reservations: number;
    total_spent: number;
    loyalty_points: number;
    favorite_categories: string[];
  } | null>(null);
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
  const upcomingReservations = customerReservations.filter(
    r => new Date(r.start_date) > new Date() && r.status !== 'cancelled'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#33ffcc] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-white/60">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'client') {
    return (
      <div className="space-y-5 mt-6 md:mt-8">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-white">Veuillez vous connecter en tant que client</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 mt-6 md:mt-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
          <p className="text-red-300">{error}</p>
          <button onClick={loadData} className="px-4 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium">Réessayer</button>
        </div>
      )}
      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#33ffcc]/20 via-[#66cccc]/10 to-transparent backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#33ffcc]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#66cccc]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33ffcc]/20 border border-[#33ffcc]/30 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#33ffcc]" />
                <span className="text-sm text-[#33ffcc] font-medium">Espace Personnel</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                Bonjour {user.firstName} ! 👋
              </h1>
              <p className="text-base text-gray-300 max-w-2xl">
                Bienvenue dans votre espace personnel LOCAGAME
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-[#33ffcc]/50 transition-all duration-500 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#33ffcc]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#33ffcc]/20 rounded-xl"><Package className="w-6 h-6 text-[#33ffcc]" /></div>
              <div className="px-3 py-1 bg-[#33ffcc]/20 border border-[#33ffcc]/30 rounded-full">
                <span className="text-xs text-[#33ffcc] font-bold">{activeReservations.length}</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Réservations actives</h3>
            <p className="text-2xl md:text-3xl font-black text-white">{activeReservations.length}</p>
            <Link to="/client/reservations" className="inline-flex items-center gap-1 mt-3 text-sm text-[#33ffcc] hover:text-[#66cccc] transition-colors group/link">
              Voir tout <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-[#fe1979]/50 transition-all duration-500 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fe1979]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#fe1979]/20 rounded-xl"><TrendingUp className="w-6 h-6 text-[#fe1979]" /></div>
              <div className="px-3 py-1 bg-[#fe1979]/20 border border-[#fe1979]/30 rounded-full">
                <span className="text-xs text-[#fe1979] font-bold">Total</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Total locations</h3>
            <p className="text-2xl md:text-3xl font-black text-white">{stats?.total_reservations || 0}</p>
            <p className="text-sm text-gray-400 mt-2">
              {customer?.created_at ? `Depuis ${new Date(customer.created_at).toLocaleDateString('fr-FR', { year: 'numeric' })}` : 'Membre fidèle'}
            </p>
          </div>
        </div>

        <div className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-yellow-500/50 transition-all duration-500 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl"><Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /></div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Membre depuis</h3>
            <p className="text-2xl md:text-3xl font-black text-white">
              {customer?.created_at ? new Date(customer.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'N/A'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {customer?.created_at ? `${Math.floor((new Date().getTime() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))} mois de fidélité` : 'Client fidèle'}
            </p>
          </div>
        </div>
      </div>

      {/* Réservations en cours */}
      <ActiveReservationsList reservations={activeReservations} />

      {/* Prochaines réservations & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {upcomingReservations.length > 0 && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#33ffcc]" />
                Prochaines réservations
              </h2>
              <Link to="/client/reservations" className="text-sm text-[#33ffcc] hover:text-[#66cccc] font-medium transition-colors flex items-center gap-1">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingReservations.slice(0, 3).map((reservation) => (
                <Link
                  key={reservation.id}
                  to={`/client/reservations/${reservation.id}`}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 border border-white/10 hover:border-[#33ffcc]/50 transition-all duration-300 group"
                >
                  <div className="flex-1">
                    <p className="font-bold text-white mb-1 group-hover:text-[#33ffcc] transition-colors">
                      {reservation.reservation_items?.map((item: any) => item.product?.name || 'Produit').join(', ') || 'Réservation'}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(reservation.start_date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="text-[#33ffcc] font-bold">{reservation.total}€</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#33ffcc] group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <QuickActions />
      </div>
    </div>
  );
}
