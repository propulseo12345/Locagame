import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Truck, MapPin, Package, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ReservationsService } from '../../services';
import { Order } from '../../types';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot?: string }> = {
  pending_payment: { label: 'Paiement en attente', bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400 animate-pulse' },
  pending: { label: 'Paiement en attente', bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400 animate-pulse' },
  confirmed: { label: 'Confirmée', bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  preparing: { label: 'En préparation', bg: 'bg-violet-500/10', text: 'text-violet-400', dot: 'bg-violet-400 animate-pulse' },
  delivered: { label: 'Livrée', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  completed: { label: 'Terminée', bg: 'bg-gray-500/10', text: 'text-gray-400' },
  cancelled: { label: 'Annulée', bg: 'bg-red-500/10', text: 'text-red-400' },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-500/10', text: 'text-gray-400' };
}

export default function ClientReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [reservation, setReservation] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReservation = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await ReservationsService.getReservationById(id);
        if (data) {
          setReservation(data);
        } else {
          setError('Réservation introuvable');
        }
      } catch (err) {
        console.error('Erreur chargement réservation:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    loadReservation();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#33ffcc] animate-spin" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-12 text-center">
        <h3 className="text-base font-semibold text-white mb-2">Réservation introuvable</h3>
        <p className="text-sm text-gray-400 mb-5">{error || "Cette réservation n'existe pas"}</p>
        <Link
          to="/client/reservations"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#33ffcc] text-[#000033] text-sm font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
        >
          Retour aux réservations
        </Link>
      </div>
    );
  }

  const sc = getStatus(reservation.status || 'pending');
  const items = reservation.reservation_items || [];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link to="/client/reservations" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#33ffcc] transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour aux réservations
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">
              Réservation <span className="text-gray-400 font-mono">#{reservation.id.substring(0, 8).toUpperCase()}</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Créée le {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${sc.bg} ${sc.text}`}>
            {sc.dot && <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />}
            {sc.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Products */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white">Produits réservés</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.product?.name || 'Produit'}</p>
                      <p className="text-xs text-gray-500">
                        Qté: {item.quantity} · {item.duration_days || 1} jour{(item.duration_days || 1) > 1 ? 's' : ''} · {item.unit_price}€/j
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white tabular-nums flex-shrink-0 ml-3">{item.subtotal}€</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white">Livraison</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">Dates</p>
                  <p className="text-lg font-bold text-white">
                    {new Date(reservation.start_date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
                    {' → '}
                    {new Date(reservation.end_date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {reservation.delivery_time && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">Créneau</p>
                    <p className="text-lg font-bold text-white">{reservation.delivery_time}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                {reservation.delivery_type === 'delivery' ? (
                  <Truck className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">Mode</p>
                  <p className="text-sm text-white">
                    {reservation.delivery_type === 'delivery' ? 'Livraison à domicile' : 'Retrait sur place'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pricing */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white">Récapitulatif</h2>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sous-total</span>
                <span className="text-white tabular-nums">{reservation.subtotal || 0}€</span>
              </div>
              {(reservation.delivery_fee || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Livraison</span>
                  <span className="text-white tabular-nums">{reservation.delivery_fee}€</span>
                </div>
              )}
              {(reservation.discount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Réduction</span>
                  <span className="text-emerald-400 tabular-nums">-{reservation.discount}€</span>
                </div>
              )}
              <div className="pt-2.5 border-t border-white/[0.06] flex justify-between">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="text-lg font-bold text-[#33ffcc] tabular-nums">{reservation.total || 0}€</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {reservation.notes && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Notes</p>
              <p className="text-sm text-gray-300">{reservation.notes}</p>
            </div>
          )}

          {/* Actions — desktop */}
          <div className="hidden lg:block space-y-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.06] border border-white/[0.06] text-sm text-white font-medium rounded-lg hover:bg-white/[0.1] transition-colors">
              <MessageCircle className="w-4 h-4" />
              Contacter le support
            </button>
            {(reservation.status === 'pending' || reservation.status === 'pending_payment' || reservation.status === 'confirmed') && (
              <button className="w-full px-4 py-2.5 text-sm text-red-400 border border-red-500/15 rounded-lg hover:bg-red-500/10 transition-colors">
                Annuler la réservation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden bg-[#000033]/95 backdrop-blur-lg border-t border-white/[0.08] px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.06] border border-white/[0.06] text-sm text-white font-medium rounded-lg active:scale-95 transition-transform min-h-[48px]">
            <MessageCircle className="w-4 h-4" />
            Contacter
          </button>
          {(reservation.status === 'pending' || reservation.status === 'pending_payment' || reservation.status === 'confirmed') && (
            <button className="px-4 py-3 text-sm text-red-400 border border-red-500/15 rounded-lg active:scale-95 transition-transform min-h-[48px]">
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
