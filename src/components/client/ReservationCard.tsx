import { Link } from 'react-router-dom';
import { Package, Calendar, Truck, MapPin, ChevronRight, FileText } from 'lucide-react';

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
  ring: string;
  border: string;
  dot?: string;
}> = {
  pending_payment: {
    label: 'Paiement en attente',
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    ring: 'ring-orange-500/30',
    border: 'border-l-orange-500',
    dot: 'bg-orange-400 animate-pulse',
  },
  confirmed: {
    label: 'Payée',
    bg: 'bg-green-500/15',
    text: 'text-green-400',
    ring: 'ring-green-500/30',
    border: 'border-l-green-500',
    dot: 'bg-green-400 animate-pulse',
  },
  preparing: {
    label: 'En preparation',
    bg: 'bg-violet-500/15',
    text: 'text-violet-400',
    ring: 'ring-violet-500/30',
    border: 'border-l-violet-500',
  },
  delivered: {
    label: 'Livrée',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-400',
    ring: 'ring-cyan-500/30',
    border: 'border-l-cyan-500',
  },
  completed: {
    label: 'Terminée',
    bg: 'bg-gray-500/15',
    text: 'text-gray-400',
    ring: 'ring-gray-500/30',
    border: 'border-l-gray-500',
  },
  cancelled: {
    label: 'Annulée',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    ring: 'ring-red-500/30',
    border: 'border-l-red-500',
  },
  expired: {
    label: 'Expiré',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    ring: 'ring-amber-500/30',
    border: 'border-l-amber-500',
  },
  pending: {
    label: 'Paiement en attente',
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    ring: 'ring-orange-500/30',
    border: 'border-l-orange-500',
    dot: 'bg-orange-400 animate-pulse',
  },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-gray-500/15',
    text: 'text-gray-400',
    ring: 'ring-gray-500/30',
    border: 'border-l-gray-500',
  };
}

// ── Helpers ──

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatYear(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').getFullYear().toString();
}

function formatCreatedAt(dateStr: string): string {
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Hier';
  if (diffD < 7) return `Il y a ${diffD} jours`;
  return created.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getDurationDays(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
}

function containsWeekend(start: string, end: string): boolean {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const d = new Date(s);
  while (d <= e) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return true;
    d.setDate(d.getDate() + 1);
  }
  return false;
}

function getProductsLabel(items: ReservationItem[]): string {
  if (items.length === 0) return 'Aucun produit';
  const firstName = items[0].product?.name || 'Produit';
  if (items.length === 1) {
    const qty = items[0].quantity;
    return qty > 1 ? `${firstName} x${qty}` : firstName;
  }
  return `${firstName} + ${items.length - 1} autre${items.length > 2 ? 's' : ''}`;
}

function pluralize(n: number, singular: string, plural: string): string {
  return n <= 1 ? `${n} ${singular}` : `${n} ${plural}`;
}

// ── Component ──

export default function ReservationCard({ reservation, index }: ReservationCardProps) {
  const sc = getStatusConfig(reservation.status);
  const items = reservation.reservation_items || [];
  const duration = getDurationDays(reservation.start_date, reservation.end_date);
  const hasWeekend = containsWeekend(reservation.start_date, reservation.end_date);
  const endYear = formatYear(reservation.end_date);

  return (
    <div
      className={`group bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/10 border-l-4 ${sc.border} hover:bg-white/[0.08] hover:shadow-lg hover:shadow-black/20 transition-all duration-300`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center flex-wrap gap-3">
          <h3 className="text-lg font-mono font-bold text-white tracking-wide">
            #{reservation.id.substring(0, 8).toUpperCase()}
          </h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ring-1 ${sc.bg} ${sc.text} ${sc.ring}`}>
            {sc.dot && <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />}
            {sc.label}
          </span>
          <span className="text-xs text-gray-500">{formatCreatedAt(reservation.created_at)}</span>
        </div>
        <div className="text-2xl font-black text-white tabular-nums">
          {Number(reservation.total).toFixed(2)}&euro;
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04] mx-px">
        {/* Produits */}
        <div className="bg-[#000033]/60 px-6 py-4 flex items-start gap-3">
          <Package className="w-4.5 h-4.5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{getProductsLabel(items)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{pluralize(duration, 'jour', 'jours')}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-[#000033]/60 px-6 py-4 flex items-start gap-3">
          <Calendar className="w-4.5 h-4.5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">
              {formatShortDate(reservation.start_date)} &rarr; {formatShortDate(reservation.end_date)} {endYear}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {reservation.delivery_time && (
                <span className="text-xs text-gray-500">{reservation.delivery_time}</span>
              )}
              {hasWeekend && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25">
                  Weekend
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Livraison */}
        <div className="bg-[#000033]/60 px-6 py-4 flex items-start gap-3">
          {reservation.delivery_type === 'delivery' ? (
            <>
              <Truck className="w-4.5 h-4.5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">Livraison</p>
                {reservation.delivery_address ? (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {reservation.delivery_address.address_line1}
                    {reservation.delivery_address.city ? `, ${reservation.delivery_address.city}` : ''}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-0.5">Adresse en attente</p>
                )}
              </div>
            </>
          ) : (
            <>
              <MapPin className="w-4.5 h-4.5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Retrait en entrepot</p>
                <p className="text-xs text-gray-500 mt-0.5">Click & Collect</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-600">
            MAJ {new Date(reservation.updated_at).toLocaleDateString('fr-FR')}
          </span>
          {reservation.status === 'confirmed' && (
            <button
              onClick={() => {/* TODO: download invoice */}}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Facture
            </button>
          )}
        </div>
        <Link
          to={`/client/reservations/${reservation.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-all"
        >
          Voir les details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
