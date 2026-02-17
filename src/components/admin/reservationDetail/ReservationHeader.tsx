import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Order } from '../../../types';
import { StatusBadge } from './reservationBadges';

interface ReservationHeaderProps {
  reservation: Order;
  updating: boolean;
  onStatusChange: (status: Order['status']) => Promise<void>;
}

export default function ReservationHeader({ reservation, updating, onStatusChange }: ReservationHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/reservations"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Details de la reservation</h1>
            <p className="text-gray-600 mt-1">Commande #{reservation.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={reservation.status || 'pending'} />
        </div>
      </div>

      {/* Actions rapides */}
      {reservation.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Cette reservation est en attente de validation</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange('confirmed')}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Valider
            </button>
            <button
              onClick={() => onStatusChange('cancelled')}
              disabled={updating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Refuser
            </button>
          </div>
        </div>
      )}
    </>
  );
}
