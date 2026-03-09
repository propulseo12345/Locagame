import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, XCircle, AlertTriangle } from 'lucide-react';
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

      {/* Action rapide: annulation possible pour pending_payment */}
      {reservation.status === 'pending_payment' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-orange-800 font-medium">Cette reservation est en attente de paiement</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange('cancelled')}
              disabled={updating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
}
