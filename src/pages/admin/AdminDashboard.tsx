import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Euro, Package, Gamepad2, Users, TrendingUp, Truck } from 'lucide-react';
import { StatsService, ReservationsService, DeliveryService } from '../../services';
import { DashboardStats } from '../../services/stats.service';
import { Order, DeliveryTask } from '../../types';
import { toLocalISODate } from '../../utils/dateHolidays';
import RevenueChart from '../../components/admin/RevenueChart';
import RecentReservationsTable from '../../components/admin/RecentReservationsTable';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-100 rounded" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<Order[]>([]);
  const [todayTasks, setTodayTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadRecentReservations();
    loadTodayDeliveries();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await StatsService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
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
      setRecentReservations([]);
    }
  };

  const loadTodayDeliveries = async () => {
    try {
      const today = toLocalISODate(new Date());
      const tasks = await DeliveryService.getTasksByDate(today);
      setTodayTasks(tasks);
    } catch {
      setTodayTasks([]);
    }
  };

  if (loading || !stats) {
    return <DashboardSkeleton />;
  }

  const rankColors = [
    'bg-yellow-400 text-yellow-900',
    'bg-gray-300 text-gray-700',
    'bg-orange-400 text-orange-900',
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-0.5">Vue d'ensemble de l'activité Locagame</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* CA du mois */}
        <div className="group bg-white rounded-xl border border-gray-200 border-l-4 border-l-green-500 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">CA du mois</p>
            <Euro className="w-4 h-4 text-green-400 shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900">
            {stats.revenue.month.toLocaleString('fr-FR')} €
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.revenue.today.toLocaleString('fr-FR')} € aujourd'hui
          </p>
        </div>

        {/* Réservations */}
        <div className="group bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Réservations</p>
            <Package className="w-4 h-4 text-blue-400 shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900">
            {stats.reservations.total}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.reservations.pending} en attente
          </p>
        </div>

        {/* Produits */}
        <div className="group bg-white rounded-xl border border-gray-200 border-l-4 border-l-violet-500 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Produits</p>
            <Gamepad2 className="w-4 h-4 text-violet-400 shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900">
            {stats.products.total}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.products.available} disponibles
          </p>
        </div>

        {/* Clients */}
        <div className="group bg-white rounded-xl border border-gray-200 border-l-4 border-l-orange-500 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Clients</p>
            <Users className="w-4 h-4 text-orange-400 shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900">
            {stats.customers.total}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.customers.new_this_month} nouveaux ce mois
          </p>
        </div>
      </div>

      {/* Chart + Top produits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart byMonth={stats.revenue.byMonth} />

        {/* Top produits */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">Top produits</h3>
          </div>
          <div className="space-y-3">
            {stats.products.mostRented && stats.products.mostRented.length > 0 ? (
              stats.products.mostRented.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rankColors[index] ?? 'bg-gray-100 text-gray-600'}`}>
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.rentals} locations</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">Aucun produit loué pour le moment</p>
            )}
          </div>
        </div>
      </div>

      {/* Livraisons du jour */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">
            Livraisons aujourd'hui
            <span className="ml-2 text-gray-400 font-normal">({todayTasks.length})</span>
          </h3>
        </div>
        <div className="space-y-2">
          {todayTasks.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune livraison prévue aujourd'hui</p>
          ) : (
            todayTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {task.customer.firstName} {task.customer.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {task.products.length} produit(s) — {task.scheduledTime || 'Horaire non défini'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {task.address.city} {task.address.postalCode}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-md ring-1 ${
                    task.type === 'delivery'
                      ? 'ring-blue-200 bg-blue-50 text-blue-700'
                      : 'ring-orange-200 bg-orange-50 text-orange-700'
                  }`}>
                    {task.type === 'delivery' ? 'Livraison' : 'Retrait'}
                  </span>
                  {task.reservationId && (
                    <Link
                      to={`/admin/reservations/${task.reservationId}`}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Détails
                    </Link>
                  )}
                </div>
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
