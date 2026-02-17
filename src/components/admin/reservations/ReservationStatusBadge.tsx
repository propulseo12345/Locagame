import { CreditCard, CheckCircle } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending_payment: 'bg-orange-100 text-orange-800',
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  delivered: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: '\uD83D\uDCB3 Paiement en attente',
  pending: '\u23F3 En attente validation',
  confirmed: '\u2705 Confirm\u00E9',
  preparing: '\uD83D\uDCE6 En pr\u00E9paration',
  delivered: '\uD83D\uDE9A Livr\u00E9',
  completed: '\u2714\uFE0F Termin\u00E9',
  cancelled: '\u274C Annul\u00E9',
  rejected: '\uD83D\uDEAB Refus\u00E9',
};

const PAYMENT_STYLES: Record<string, { bg: string; label: string }> = {
  paid: { bg: 'bg-green-100 text-green-800', label: 'Paye' },
  failed: { bg: 'bg-red-100 text-red-800', label: 'Echoue' },
  expired: { bg: 'bg-gray-100 text-gray-600', label: 'Expire' },
  refunded: { bg: 'bg-purple-100 text-purple-800', label: 'Rembourse' },
};

interface ReservationStatusBadgeProps {
  status: string;
  paymentStatus?: string;
}

export default function ReservationStatusBadge({ status, paymentStatus }: ReservationStatusBadgeProps) {
  const paymentInfo = paymentStatus ? PAYMENT_STYLES[paymentStatus] : null;

  return (
    <div className="flex flex-col gap-1">
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[status] || 'bg-gray-100'}`}>
        {STATUS_LABELS[status] || status}
      </span>
      {paymentInfo && (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full inline-flex items-center gap-1 w-fit ${paymentInfo.bg}`}>
          {paymentStatus === 'paid' ? <CheckCircle className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
          {paymentInfo.label}
        </span>
      )}
    </div>
  );
}
