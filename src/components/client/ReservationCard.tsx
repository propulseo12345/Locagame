import { Link } from 'react-router-dom';
import { Package, Calendar, Truck, MapPin, ChevronRight, Clock } from 'lucide-react';

interface ReservationProduct {
  name: string;
  images?: string[];
}

interface ReservationItem {
  id: string;
  product_id: string;
  quantity: number;
  duration_days: number;
  unit_price: number;
  subtotal: number;
  product?: ReservationProduct;
}

interface Reservation {
  id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  delivery_time?: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_address?: { address_line1?: string; city?: string } | null;
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

// ── Status config ──

const STATUS_CONFIG: Record<string, {
  label: string;
  bg: string;
  text: string;
  dot?: string;
  glow?: string;
}> = {
  pending_payment: {
    label: 'Paiement en attente',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    dot: 'bg-orange-400 animate-pulse',
  },
  confirmed: {
    label: 'Confirmée',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.15)]',
  },
  preparing: {
    label: 'En préparation',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    dot: 'bg-violet-400 animate-pulse',
  },
  delivered: {
    label: 'Livrée',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    dot: 'bg-cyan-400',
  },
  completed: {
    label: 'Terminée',
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
  },
  cancelled: {
    label: 'Annulée',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
  },
  expired: {
    label: 'Expirée',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
  },
  pending: {
    label: 'Paiement en attente',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    dot: 'bg-orange-400 animate-pulse',
  },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
  };
}

// ── Helpers ──

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatCreatedAt(dateStr: string): string {
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Hier';
  if (diffD < 7) return `Il y a ${diffD}j`;
  return created.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDurationDays(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
}

function getProductsLabel(items: ReservationItem[]): string {
  if (items.length === 0) return 'Aucun produit';
  const firstName = items[0].product?.name || 'Produit';
  if (items.length === 1) {
    const qty = items[0].quantity;
    return qty > 1 ? `${firstName} ×${qty}` : firstName;
  }
  return `${firstName} +${items.length - 1} autre${items.length > 2 ? 's' : ''}`;
}

// ── Border color by status ──

function getStatusBorderClass(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'completed':
    case 'delivered':
      return 'border-l-4 border-l-emerald-500';
    case 'pending':
    case 'pending_payment':
    case 'preparing':
      return 'border-l-4 border-l-amber-500';
    case 'cancelled':
    case 'expired':
      return 'border-l-4 border-l-red-500';
    default:
      return 'border-l-4 border-l-gray-300';
  }
}

// ── Component ──

export default function ReservationCard({ reservation, index }: ReservationCardProps) {
  const sc = getStatusConfig(reservation.status);
  const items = reservation.reservation_items || [];
  const duration = getDurationDays(reservation.start_date, reservation.end_date);
  const firstImage = items[0]?.product?.images?.[0];
  const borderClass = getStatusBorderClass(reservation.status);

  return (
    <Link
      to={`/client/reservations/${reservation.id}`}
      className={`group block bg-white/[0.03] border border-white/[0.06] ${borderClass} rounded-xl hover:bg-white/[0.07] hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/20 transition-all duration-200 ${sc.glow || ''}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-stretch">
        {/* Product thumbnail */}
        <div className="hidden sm:flex w-24 flex-shrink-0 items-center justify-center bg-white/[0.02] rounded-l-xl border-r border-white/[0.04]">
          {firstImage ? (
            <img src={firstImage} alt="" className="w-16 h-16 object-cover rounded-lg" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-5 py-4">
          {/* Top row: product + status + amount */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-semibold text-white truncate">
                  {getProductsLabel(items)}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-md ${sc.bg} ${sc.text}`}>
                  {sc.dot && <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />}
                  {sc.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                #{reservation.id.substring(0, 8).toUpperCase()}
                <span className="mx-1.5">·</span>
                {formatCreatedAt(reservation.created_at)}
              </p>
            </div>

            {/* Amount — prominent */}
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-bold text-[#33ffcc] tabular-nums leading-none">
                {Number(reservation.total).toFixed(2)}&nbsp;€
              </p>
              <p className="text-[10px] text-gray-500 mt-1">TTC</p>
            </div>
          </div>

          {/* Meta row — structured with separators */}
          <div className="flex items-center flex-wrap text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              {formatShortDate(reservation.start_date)} → {formatShortDate(reservation.end_date)}
            </span>

            <span className="mx-2.5 text-white/10">|</span>

            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              {duration} jour{duration > 1 ? 's' : ''}
            </span>

            <span className="mx-2.5 text-white/10">|</span>

            <span className="inline-flex items-center gap-1.5">
              {reservation.delivery_type === 'delivery' ? (
                <>
                  <Truck className="w-3.5 h-3.5 text-gray-500" />
                  Livraison{reservation.delivery_address?.city ? ` · ${reservation.delivery_address.city}` : ''}
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  Retrait
                </>
              )}
            </span>

          </div>
        </div>

        {/* Chevron */}
        <div className="hidden sm:flex items-center px-5 flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
