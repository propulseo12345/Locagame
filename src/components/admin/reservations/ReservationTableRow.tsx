import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Store, Trash2, Users, UserPlus } from 'lucide-react';
import { Order, RecipientData } from '../../../types';
import ReservationStatusBadge from './ReservationStatusBadge';
import type { DeliveryTaskInfo } from './types';

const STATUS_BORDER_COLORS: Record<string, string> = {
  pending_payment: 'border-l-orange-500',
  pending: 'border-l-amber-500',
  confirmed: 'border-l-blue-500',
  preparing: 'border-l-violet-500',
  delivered: 'border-l-cyan-500',
  completed: 'border-l-green-500',
  cancelled: 'border-l-red-500',
};

const DELIVERY_STATUS_BADGE: Record<string, { label: string; color: string }> = {
  assigned: { label: 'Assigné', color: 'bg-yellow-100 text-yellow-800' },
  en_route: { label: 'En route', color: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'Livré', color: 'bg-green-100 text-green-800' },
  scheduled: { label: 'Planifié', color: 'bg-gray-100 text-gray-600' },
};

const INITIALS_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
];

function getInitialsColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length];
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD < 2) return 'hier';
  if (diffD < 7) return `il y a ${diffD}j`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

interface ReservationTableRowProps {
  reservation: Order;
  isExpanded: boolean;
  isEven: boolean;
  onToggleExpand: () => void;
  onReject: (id: string) => void;
  onAssignClick: (reservation: Order) => void;
  taskInfo?: DeliveryTaskInfo;
}

const ReservationTableRow = memo(function ReservationTableRow({
  reservation,
  isExpanded,
  isEven,
  onToggleExpand,
  onReject,
  onAssignClick,
  taskInfo,
}: ReservationTableRowProps) {
  const customer = reservation.customer as any;
  const items = (reservation as any).reservation_items || [];
  const recipientData = (reservation as any).recipient_data as RecipientData | null;
  const deliveryType = (reservation as any).delivery_type;
  const startDate = (reservation as any).start_date;
  const endDate = (reservation as any).end_date;
  const borderColor = STATUS_BORDER_COLORS[reservation.status] || 'border-l-gray-300';
  const customerName = customer?.first_name && customer?.last_name
    ? `${customer.first_name} ${customer.last_name}`
    : null;
  const initials = customerName
    ? `${customer.first_name[0]}${customer.last_name[0]}`.toUpperCase()
    : '?';

  // Duration calculation
  const durationDays = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)
    : null;

  // Is delivery within 24h?
  const isUrgentDelivery = startDate
    ? (new Date(startDate).getTime() - Date.now()) < 86400000 && (new Date(startDate).getTime() - Date.now()) > 0
    : false;

  const total = (reservation as any).total || reservation.total;

  return (
    <tr
      onClick={onToggleExpand}
      className={`border-l-4 ${borderColor} hover:bg-gray-100/60 cursor-pointer transition-colors ${
        isEven ? 'bg-gray-50/40' : 'bg-white'
      }`}
    >
      {/* N° Commande */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
          <div>
            <div className="text-sm font-mono font-bold text-gray-900">
              {reservation.id.substring(0, 8).toUpperCase()}
            </div>
            <div className="text-xs text-gray-400">
              {reservation.created_at ? formatRelativeDate(reservation.created_at) : '—'}
            </div>
          </div>
        </div>
      </td>

      {/* Client */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {customerName ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getInitialsColor(customerName)}`}>
              {initials}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-gray-100 text-gray-400">
              ?
            </div>
          )}
          <div className="min-w-0">
            {customerName ? (
              <>
                <div className="text-sm font-medium text-gray-900 truncate">{customerName}</div>
                <div className="text-xs text-gray-500 truncate">{customer?.email}</div>
              </>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-500">
                Invité
              </span>
            )}
            {recipientData && !recipientData.sameAsCustomer && (
              <div className="text-xs text-orange-600 flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3" />
                {recipientData.firstName} {recipientData.lastName}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Mode */}
      <td className="px-4 py-3 whitespace-nowrap">
        {deliveryType === 'pickup' ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-200">
            <Store className="w-3 h-3" />
            Pick-up
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <Truck className="w-3 h-3" />
            Livraison
          </span>
        )}
      </td>

      {/* Produits */}
      <td className="px-4 py-3">
        <div className="text-sm text-gray-900">{items.length} article{items.length > 1 ? 's' : ''}</div>
        {items.length > 0 && items[0]?.product?.name && (
          <div className="text-xs text-gray-500 truncate max-w-[150px]">
            {items[0].product.name}
          </div>
        )}
      </td>

      {/* Dates */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {startDate ? new Date(startDate).toLocaleDateString('fr-FR') : '—'}
        </div>
        {durationDays !== null && (
          <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded mt-0.5 ${
            durationDays <= 0 ? 'bg-gray-100 text-gray-500' : isUrgentDelivery ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {durationDays <= 0 ? 'Terminée' : `${durationDays}j`}
          </span>
        )}
      </td>

      {/* Montant */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className={`text-sm font-bold tabular-nums ${total >= 1000 ? 'bg-green-50 rounded px-1' : ''}`}>
          {total}&euro;
        </div>
        <div className="text-xs text-gray-400">{items.length} art.</div>
      </td>

      {/* Statut */}
      <td className="px-4 py-3 whitespace-nowrap">
        <ReservationStatusBadge status={reservation.status} />
      </td>

      {/* Livreur */}
      <td className="px-4 py-3 whitespace-nowrap">
        {taskInfo ? (
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getInitialsColor(taskInfo.technicianName || '')}`}>
              {taskInfo.technicianName?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">{taskInfo.technicianName}</p>
              {taskInfo.vehicleName && (
                <p className="text-[10px] text-gray-500 mt-0.5">{taskInfo.vehicleName}</p>
              )}
              <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                DELIVERY_STATUS_BADGE[taskInfo.status]?.color || 'bg-gray-100 text-gray-600'
              }`}>
                {DELIVERY_STATUS_BADGE[taskInfo.status]?.label || taskInfo.status}
              </span>
            </div>
          </div>
        ) : deliveryType === 'delivery' ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-red-50 text-red-600 ring-1 ring-red-200">
              Non assigné
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onAssignClick(reservation); }}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Assigner"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">&mdash;</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {reservation.status === 'pending_payment' && (
            <button
              onClick={() => onReject(reservation.id)}
              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Annuler"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <Link
            to={`/admin/reservations/${reservation.id}`}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Voir
          </Link>
        </div>
      </td>
    </tr>
  );
});

export default ReservationTableRow;
