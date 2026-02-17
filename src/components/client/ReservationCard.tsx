import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, Euro, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

interface ReservationCardProps {
  reservation: Reservation;
  index: number;
}

function getStatusConfig(status: string) {
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
}

export default function ReservationCard({ reservation, index }: ReservationCardProps) {
  const statusConfig = getStatusConfig(reservation.status);
  const items = reservation.reservation_items || [];

  return (
    <div
      className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-[#33ffcc]/50 hover:bg-white/10 transition-all duration-300 shadow-xl"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header de la réservation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center flex-wrap gap-3 mb-2">
            <h3 className="text-xl font-black text-white">
              #{reservation.id.substring(0, 8).toUpperCase()}
            </h3>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full border ${statusConfig.style}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Réservée le {new Date(reservation.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-[#33ffcc]">
            {reservation.total}€
          </div>
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-[#33ffcc] mb-3">
            <Package className="w-5 h-5" />
            <span className="text-sm font-bold">Produits</span>
          </div>
          <div className="text-white font-medium mb-2">{items.length} produit(s)</div>
          <div className="text-xs text-gray-400">
            {items.length > 0 && `${items[0].duration_days} jour(s)`}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-[#66cccc] mb-3">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-bold">Dates</span>
          </div>
          <div className="text-white text-sm mb-1">
            <strong>Du:</strong> {new Date(reservation.start_date).toLocaleDateString('fr-FR')}
          </div>
          <div className="text-white text-sm mb-2">
            <strong>Au:</strong> {new Date(reservation.end_date).toLocaleDateString('fr-FR')}
          </div>
          {reservation.delivery_time && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              {reservation.delivery_type === 'delivery' ? 'Livraison' : 'Retrait'}: {reservation.delivery_time}
            </div>
          )}
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-green-400 mb-3">
            <Euro className="w-5 h-5" />
            <span className="text-sm font-bold">Total</span>
          </div>
          <div className="text-2xl font-black text-white mb-2">{reservation.total}€</div>
          {reservation.discount > 0 && (
            <div className="text-xs text-green-400 mb-1">-{reservation.discount}€ de réduction</div>
          )}
          <div className="text-xs text-gray-400">
            {reservation.delivery_type === 'delivery' ? '🚚 Livraison' : '📦 Retrait'}
          </div>
        </div>
      </div>

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
          Dernière MAJ: {new Date(reservation.updated_at).toLocaleDateString('fr-FR')}
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
}
