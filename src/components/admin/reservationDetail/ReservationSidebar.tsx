import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Receipt, CreditCard } from 'lucide-react';
import { Order } from '../../../types';

interface ReservationSidebarProps {
  reservation: Order;
  updating: boolean;
  onStatusChange: (status: Order['status']) => Promise<void>;
}

export default function ReservationSidebar({ reservation, updating, onStatusChange }: ReservationSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Recapitulatif financier */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recapitulatif</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total</span>
            <span className="text-gray-900">{reservation.subtotal || 0}€</span>
          </div>
          {(reservation.delivery_fee || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frais de livraison</span>
              <span className="text-gray-900">{reservation.delivery_fee}€</span>
            </div>
          )}
          {(reservation.discount || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Reduction</span>
              <span className="text-green-600">-{reservation.discount}€</span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-200 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-[#33ffcc]">{reservation.total || 0}€</span>
          </div>
        </div>
      </div>

      {/* Statut paiement */}
      <PaymentStatusCard reservation={reservation} />

      {/* Regles tarifaires appliquees */}
      <PricingRulesCard reservation={reservation} />

      {/* Statut et Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="space-y-3">
          <select
            value={reservation.status}
            onChange={(e) => onStatusChange(e.target.value as Order['status'])}
            disabled={updating}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
          >
            <option value="pending_payment">Paiement en attente</option>
            <option value="pending">En attente validation</option>
            <option value="confirmed">Confirmee</option>
            <option value="preparing">En preparation</option>
            <option value="delivered">Livree</option>
            <option value="returned">Retournee</option>
            <option value="completed">Terminee</option>
            <option value="cancelled">Annulee</option>
          </select>
        </div>
      </div>

      {/* Informations legales */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Consentements</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {reservation.cgv_accepted ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-gray-600">CGV acceptees</span>
          </div>
          <div className="flex items-center gap-2">
            {reservation.newsletter_accepted ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-gray-600">Newsletter</span>
          </div>
        </div>
      </div>

      {/* Dates systeme */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Informations</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            Creee le: {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'N/A'}
          </div>
          {reservation.updated_at && (
            <div>
              Modifiee le: {new Date(reservation.updated_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  unpaid: { label: 'Non paye', color: 'text-gray-600', bg: 'bg-gray-50' },
  pending_payment: { label: 'En cours', color: 'text-orange-600', bg: 'bg-orange-50' },
  paid: { label: 'Paye', color: 'text-green-600', bg: 'bg-green-50' },
  failed: { label: 'Echoue', color: 'text-red-600', bg: 'bg-red-50' },
  expired: { label: 'Expire', color: 'text-gray-600', bg: 'bg-gray-50' },
  refunded: { label: 'Rembourse', color: 'text-purple-600', bg: 'bg-purple-50' },
};

function PaymentStatusCard({ reservation }: { reservation: Order }) {
  const paymentStatus = reservation.payment_status || 'unpaid';
  const config = PAYMENT_STATUS_CONFIG[paymentStatus] || PAYMENT_STATUS_CONFIG.unpaid;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-blue-500" />
        Paiement
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Statut</span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
        {reservation.payment_method && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Methode</span>
            <span className="text-gray-900 capitalize">{reservation.payment_method}</span>
          </div>
        )}
        {reservation.paid_at && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Paye le</span>
            <span className="text-gray-900">
              {new Date(reservation.paid_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
        )}
        {reservation.payment_intent_id && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ref. Stripe</span>
            <span className="text-gray-500 text-xs font-mono truncate max-w-[140px]">
              {reservation.payment_intent_id}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function PricingRulesCard({ reservation }: { reservation: Order }) {
  const pricingBreakdown = reservation.pricing_breakdown as any;

  if (!pricingBreakdown) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Receipt className="w-5 h-5 text-purple-500" />
        Regles tarifaires
      </h2>
      <div className="space-y-3 text-sm">
        {/* Forfait week-end */}
        {pricingBreakdown?.items?.some((item: any) => item.weekend_flat_rate_applied) && (
          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
            <span className="text-purple-700 font-medium">Forfait week-end applique</span>
          </div>
        )}

        {/* Majorations */}
        {pricingBreakdown?.items?.flatMap((item: any) =>
          (item.rules_applied || []).filter((r: any) => r.type === 'surcharge')
        ).map((rule: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
            <span className="text-amber-700">{rule.name}</span>
            <span className="text-amber-700 font-medium">+{rule.amount}€</span>
          </div>
        ))}

        {/* Livraison/reprise imperative */}
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <span>Creneau debut:</span>
            <span className="font-medium">{reservation.start_slot || 'AM'}</span>
            <span className="mx-2">{'\u2192'}</span>
            <span>Creneau fin:</span>
            <span className="font-medium">{reservation.end_slot || 'AM'}</span>
          </div>
          {reservation.delivery_is_mandatory && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Livraison imperative demandee</span>
            </div>
          )}
          {reservation.pickup_is_mandatory && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Reprise imperative demandee</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
