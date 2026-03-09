import { Package, Calendar, Truck } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils/pricing';

interface ConfirmationSummaryProps {
  reservation: any;
}

export default function ConfirmationSummary({ reservation }: ConfirmationSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#33ffcc]" />
          Recapitulatif
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#33ffcc]" />
              <p className="font-medium text-white text-sm">Periode</p>
            </div>
            <p className="text-xs text-gray-400">
              {formatDate(reservation.start_date)} &rarr; {formatDate(reservation.end_date)}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-[#33ffcc]" />
              <p className="font-medium text-white text-sm">
                {reservation.delivery_type === 'delivery' ? 'Livraison' : 'Retrait'}
              </p>
            </div>
            <p className="text-xs text-gray-400">
              {reservation.delivery_type === 'pickup'
                ? '553 rue St Pierre, 13012'
                : reservation.delivery_time || 'A confirmer'}
            </p>
          </div>
        </div>

        {reservation.reservation_items && reservation.reservation_items.length > 0 && (
          <div className="space-y-2">
            {reservation.reservation_items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg text-sm">
                <div>
                  <p className="font-medium text-white">{item.product_name || `Produit ${index + 1}`}</p>
                  <p className="text-xs text-gray-400">Qte: {item.quantity}</p>
                </div>
                <p className="font-semibold text-white">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-[#33ffcc]/10 rounded-2xl border border-[#33ffcc]/30 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Sous-total</span>
            <span className="text-white">{formatPrice(reservation.subtotal)}</span>
          </div>
          {reservation.delivery_fee > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Livraison</span>
              <span className="text-white">{formatPrice(reservation.delivery_fee)}</span>
            </div>
          )}
          {reservation.delivery_type === 'pickup' && (
            <div className="flex justify-between text-gray-400">
              <span>Retrait</span>
              <span className="text-green-400">Gratuit</span>
            </div>
          )}
          <div className="pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="font-semibold text-white">Total</span>
            <span className="text-xl font-bold text-[#33ffcc]">{formatPrice(reservation.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
