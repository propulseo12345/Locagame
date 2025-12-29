import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, MapPin, CreditCard, Clock, Filter, ChevronRight, CheckCircle, XCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { ReservationsService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';

export default function ClientReservations() {
  const { user } = useAuth();
  const [customerReservations, setCustomerReservations] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, [user]);

  const loadReservations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const reservations = await ReservationsService.getCustomerReservations(user.id);
      setCustomerReservations(reservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = customerReservations.filter(reservation => {
    return statusFilter === 'all' || reservation.status === statusFilter;
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        style: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: <AlertCircle className="w-4 h-4" />,
        label: '⏳ En attente'
      },
      confirmed: {
        style: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: <CheckCircle className="w-4 h-4" />,
        label: '✓ Confirmé'
      },
      preparing: {
        style: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        icon: <Package className="w-4 h-4" />,
        label: '📦 En préparation'
      },
      delivered: {
        style: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        icon: <CheckCircle className="w-4 h-4" />,
        label: '🚚 Livré'
      },
      completed: {
        style: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: <CheckCircle className="w-4 h-4" />,
        label: '✓ Terminé'
      },
      cancelled: {
        style: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: <XCircle className="w-4 h-4" />,
        label: '✗ Annulé'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

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
      {/* Header avec stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#33ffcc]/20 via-[#66cccc]/10 to-transparent backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl mt-6 md:mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#33ffcc]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
            Mes réservations
          </h1>
          <p className="text-base text-gray-300 mb-6">
            Consultez l'historique de toutes vos réservations
          </p>

          {/* Mini stats */}
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

      {/* Filter moderne */}
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
          filteredReservations.map((reservation, index) => {
            const statusConfig = getStatusConfig(reservation.status);

            return (
              <div
                key={reservation.id}
                className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-[#33ffcc]/50 hover:bg-white/10 transition-all duration-300 shadow-xl"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header de la réservation */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
                  <div>
                    <div className="flex items-center flex-wrap gap-3 mb-2">
                      <h3 className="text-xl font-black text-white">
                        {reservation.orderNumber}
                      </h3>
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full border ${statusConfig.style}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Réservée le {new Date(reservation.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-[#33ffcc] mb-1">
                      {reservation.pricing.total}€
                    </div>
                    {reservation.payment.status === 'paid' ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Payé
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        En attente
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Produits */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-[#33ffcc] mb-3">
                      <Package className="w-5 h-5" />
                      <span className="text-sm font-bold">Produits</span>
                    </div>
                    <div className="text-white font-medium mb-2">
                      {reservation.products.map(p => p.productName).join(', ')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {reservation.products.length} produit(s) • {reservation.products[0].duration} jour(s)
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-[#66cccc] mb-3">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm font-bold">Dates</span>
                    </div>
                    <div className="text-white text-sm mb-1">
                      <strong>Du:</strong> {new Date(reservation.dates.start).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-white text-sm mb-2">
                      <strong>Au:</strong> {new Date(reservation.dates.end).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      Livraison: {reservation.dates.deliveryTime}
                    </div>
                  </div>

                  {/* Paiement */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-green-400 mb-3">
                      <CreditCard className="w-5 h-5" />
                      <span className="text-sm font-bold">Paiement</span>
                    </div>
                    <div className="text-2xl font-black text-white mb-2">
                      {reservation.pricing.total}€
                    </div>
                    {reservation.pricing.discount > 0 && (
                      <div className="text-xs text-green-400 mb-1">
                        -{reservation.pricing.discount}€ de réduction
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Méthode: {reservation.payment.method === 'card' ? 'Carte bancaire' : reservation.payment.method}
                    </div>
                  </div>
                </div>

                {/* Adresse de livraison */}
                {reservation.delivery.address && (
                  <div className="mb-5 p-4 bg-gradient-to-r from-[#33ffcc]/10 to-[#66cccc]/5 rounded-xl border border-[#33ffcc]/20">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#33ffcc] mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-white mb-2">Adresse de livraison</div>
                        <div className="text-sm text-gray-300 mb-1">
                          {reservation.delivery.address.street}
                        </div>
                        <div className="text-sm text-gray-300 mb-2">
                          {reservation.delivery.address.zipCode} {reservation.delivery.address.city}
                        </div>
                        <div className="inline-block px-3 py-1 bg-[#33ffcc]/20 border border-[#33ffcc]/30 rounded-full text-xs text-[#33ffcc] font-medium">
                          Zone: {reservation.delivery.zone}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {reservation.notes && (
                  <div className="mb-5 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="text-xs font-bold text-blue-400 mb-2">📝 Notes</div>
                    <div className="text-sm text-blue-300">{reservation.notes}</div>
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-5 border-t border-white/10">
                  <div className="text-xs text-gray-500">
                    {reservation.timeline.length} étape(s) • Dernière MAJ: {new Date(reservation.updatedAt).toLocaleDateString('fr-FR')}
                  </div>
                  <Link
                    to={`/client/reservations/${reservation.id}`}
                    className="group/btn inline-flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105"
                  >
                    Voir les détails
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })
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
