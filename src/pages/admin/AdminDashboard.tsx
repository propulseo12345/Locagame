import { useEffect, useState } from 'react';
import { StatsService, ReservationsService } from '../../services';
import { DashboardStats } from '../../services/stats.service';
import { Order } from '../../types';
import RevenueChart from '../../components/admin/RevenueChart';
import RecentReservationsTable from '../../components/admin/RecentReservationsTable';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadRecentReservations();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await StatsService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Mettre des valeurs par défaut pour éviter le blocage
      const defaultByMonth = Array.from({ length: 12 }, (_, i) => {
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return { month: monthNames[date.getMonth()], amount: 0 };
      });

      setStats({
        revenue: { today: 0, week: 0, month: 0, byMonth: defaultByMonth },
        reservations: { total: 0, pending: 0, confirmed: 0, delivered: 0 },
        products: { total: 0, available: 0, reserved: 0, mostRented: [] },
        customers: { total: 0, new_this_month: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentReservations = async () => {
    try {
      const reservations = await ReservationsService.getAllReservations();
      setRecentReservations(reservations.slice(0, 5));
    } catch (error) {
      console.error('Error loading recent reservations:', error);
      setRecentReservations([]);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-600">Chargement des statistiques...</div>
      </div>
    );
  }

  // Réservations du jour (vide pour l'instant, à charger depuis l'API si nécessaire)
  const todayReservations: any[] = [];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">CA du mois</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.revenue.month.toLocaleString()}€</p>
          <p className="text-sm text-gray-500 mt-1">{stats.revenue.today.toLocaleString()}€ aujourd'hui</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Réservations</h3>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.reservations.total}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.reservations.pending} en attente</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Produits</h3>
            <span className="text-2xl">🎮</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.products.total}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.products.available} disponibles</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Clients</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.customers.total}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.customers.new_this_month} nouveaux ce mois</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique CA */}
        <RevenueChart byMonth={stats.revenue.byMonth} />

        {/* Produits les plus loués */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top produits</h3>
          <div className="space-y-4">
            {stats.products.mostRented && stats.products.mostRented.length > 0 ? (
              stats.products.mostRented.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.rentals} locations</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun produit loué pour le moment</p>
            )}
          </div>
        </div>
      </div>

      {/* Livraisons du jour */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Livraisons aujourd'hui ({todayReservations.length})
          </h3>
          <span className="text-2xl">🚚</span>
        </div>
        <div className="space-y-3">
          {todayReservations.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune livraison prévue aujourd'hui</p>
          ) : (
            todayReservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {reservation.customer.firstName} {reservation.customer.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {reservation.products.length} produit(s) - {reservation.dates.deliveryTime}
                  </p>
                </div>
                <button className="px-3 py-1 text-sm bg-[#33ffcc] text-[#000033] rounded-lg hover:bg-[#66cccc] transition-colors">
                  Détails
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Réservations récentes */}
      <RecentReservationsTable reservations={recentReservations} />
    </div>
  );
}
