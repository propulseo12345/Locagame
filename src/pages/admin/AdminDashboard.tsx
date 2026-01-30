import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { StatsService, ReservationsService } from '../../services';
import { DashboardStats } from '../../services/stats.service';
import { Order } from '../../types';

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
      // Prendre les 5 plus récentes
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

  // Calculer min et max pour le graphique
  const revenueValues = stats.revenue.byMonth.map(m => m.amount);
  const maxRevenue = Math.max(...revenueValues, 1); // Au moins 1 pour éviter division par 0
  const minRevenue = Math.min(...revenueValues, 0);

  // Réservations du jour (vide pour l'instant, à charger depuis l'API si nécessaire)
  const todayReservations: any[] = [];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chiffre d'affaires */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">CA du mois</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.revenue.month.toLocaleString()}€
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.revenue.today.toLocaleString()}€ aujourd'hui
          </p>
        </div>

        {/* Réservations */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Réservations</h3>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.reservations.total}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.reservations.pending} en attente
          </p>
        </div>

        {/* Produits */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Produits</h3>
            <span className="text-2xl">🎮</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.products.total}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.products.available} disponibles
          </p>
        </div>

        {/* Clients */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Clients</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.customers.total}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.customers.new_this_month} nouveaux ce mois
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique CA */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution du chiffre d'affaires
          </h3>
          <div className="space-y-2">
            {/* Valeur max */}
            <div className="text-xs text-gray-500 text-right pr-2">
              {maxRevenue.toLocaleString()}€
            </div>

            {/* Conteneur du graphique */}
            <div className="relative h-56 border-b-2 border-l-2 border-gray-200 bg-white">
              {/* Grille horizontale */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-b border-gray-100"></div>
                <div className="border-b border-gray-100"></div>
                <div className="border-b border-gray-100"></div>
                <div className="border-b border-gray-100"></div>
              </div>

              {/* SVG de la courbe */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#33ffcc" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#33ffcc" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Zone sous la courbe */}
                <path
                  d={(() => {
                    const points = stats.revenue.byMonth.map((monthData, i) => {
                      const x = (i / (stats.revenue.byMonth.length - 1)) * 100;
                      const normalizedValue = (monthData.amount - minRevenue) / (maxRevenue - minRevenue);
                      const y = (1 - normalizedValue) * 100;
                      return `${x},${y}`;
                    });
                    return `M 0,100 L ${points.join(' L ')} L 100,100 Z`;
                  })()}
                  fill="url(#chartGradient)"
                />

                {/* Ligne de la courbe */}
                <polyline
                  points={stats.revenue.byMonth.map((monthData, i) => {
                    const x = (i / (stats.revenue.byMonth.length - 1)) * 100;
                    const normalizedValue = (monthData.amount - minRevenue) / (maxRevenue - minRevenue);
                    const y = (1 - normalizedValue) * 100;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#33ffcc"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Points sur la courbe avec tooltips */}
              {stats.revenue.byMonth.map((monthData, i) => {
                const x = (i / (stats.revenue.byMonth.length - 1)) * 100;
                const normalizedValue = (monthData.amount - minRevenue) / (maxRevenue - minRevenue);
                const y = (1 - normalizedValue) * 100;
                return (
                  <div
                    key={i}
                    className="absolute group cursor-pointer"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '16px',
                      height: '16px'
                    }}
                  >
                    {/* Point visible */}
                    <div className="absolute inset-0 rounded-full border-2 border-[#33ffcc] bg-white group-hover:scale-125 transition-transform"></div>
                    <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#33ffcc]"></div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-6 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl">
                      <div className="font-semibold text-white">{monthData.month}</div>
                      <div className="text-[#33ffcc] font-bold">{monthData.amount.toLocaleString()}€</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Valeur min */}
            <div className="text-xs text-gray-500 text-right pr-2">
              {minRevenue.toLocaleString()}€
            </div>

            {/* Labels des mois */}
            <div className="flex justify-between text-xs text-gray-600 font-medium pt-2 pl-2">
              {stats.revenue.byMonth.map((monthData, i) => (
                <span key={i} className="flex-1 text-center">{monthData.month}</span>
              ))}
            </div>
          </div>
        </div>

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
              {recentReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Aucune réservation récente
                  </td>
                </tr>
              ) : (
                recentReservations.map((reservation) => {
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
    </div>
  );
}
