import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Package, TrendingUp, Star, ArrowRight, Sparkles, User, Mail, Phone, Pencil } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ReservationsService, StatsService, CustomersService } from '../../services';
import { Order, Customer } from '../../types';
import ReservationCard from '../../components/client/ReservationCard';
import QuickActions from '../../components/client/QuickActions';

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
  const recentReservations = customerReservations.slice(0, 5);

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

  const statsCards = [
    { label: 'Reservations actives', value: activeReservations.length, icon: Package, color: '#33ffcc', link: '/client/reservations' },
    { label: 'Total locations', value: stats?.total_reservations || 0, icon: TrendingUp, color: '#fe1979' },
    { label: 'Membre depuis', value: customer?.created_at ? new Date(customer.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'N/A', icon: Star, color: '#eab308' },
  ];

  return (
    <div className="space-y-5 mt-6 md:mt-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
          <p className="text-red-300">{error}</p>
          <button onClick={loadData} className="px-4 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium">Reessayer</button>
        </div>
      )}

      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#33ffcc]/20 via-[#66cccc]/10 to-transparent backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#33ffcc]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#33ffcc]/20 border border-[#33ffcc]/30 flex items-center justify-center text-xl font-black text-[#33ffcc] flex-shrink-0">
            {user.firstName?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#33ffcc]/20 border border-[#33ffcc]/30 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#33ffcc]" />
              <span className="text-xs text-[#33ffcc] font-medium">Espace Personnel</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
              Bonjour {user.firstName} !
            </h1>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${card.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">{card.label}</h3>
              <p className="text-2xl font-black text-white">{card.value}</p>
              {card.link && (
                <Link to={card.link} className="inline-flex items-center gap-1 mt-2 text-sm text-[#33ffcc] hover:text-[#66cccc] transition-colors">
                  Voir tout <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Reservations recentes */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 md:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#33ffcc]" />
            Reservations recentes
          </h2>
          <Link to="/client/reservations" className="flex items-center gap-1 text-sm text-[#33ffcc] hover:text-[#66cccc] font-medium transition-colors">
            Voir toutes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentReservations.length > 0 ? (
          <div className="space-y-4">
            {recentReservations.map((reservation, index) => (
              <ReservationCard key={reservation.id} reservation={reservation as any} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucune reservation pour le moment</p>
            <Link to="/catalogue" className="inline-flex items-center gap-1 mt-3 text-sm text-[#33ffcc] hover:text-[#66cccc] transition-colors">
              Parcourir le catalogue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Mes informations + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#33ffcc]" />
              Mes informations
            </h2>
            <Link to="/client/profile" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#33ffcc] border border-[#33ffcc]/30 rounded-lg hover:bg-[#33ffcc]/10 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
              Modifier
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Nom</p>
                <p className="text-sm font-medium text-white">{customer?.first_name} {customer?.last_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-white">{customer?.email || user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Telephone</p>
                <p className="text-sm font-medium text-white">{customer?.phone || 'Non renseigne'}</p>
              </div>
            </div>
          </div>
        </div>
        <QuickActions />
      </div>
    </div>
  );
}
