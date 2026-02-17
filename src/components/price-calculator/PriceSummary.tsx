import { Truck, Package, MapPin } from 'lucide-react';
import { formatPrice } from '../../utils/pricing';
import { WAREHOUSE } from './constants';

interface PriceSummaryProps {
  deliveryMode: 'pickup' | 'delivery';
  durationDays: number;
  quantity: number;
  productPrice: number;
  deliveryFee: number;
  totalPrice: number;
  distance: number | null;
}

export function PriceSummary({
  deliveryMode, durationDays, quantity,
  productPrice, deliveryFee, totalPrice, distance,
}: PriceSummaryProps) {
  return (
    <>
      {/* Adresse Click & Collect */}
      {deliveryMode === 'pickup' && (
        <div className="p-4 bg-[#33ffcc]/10 rounded-xl border border-[#33ffcc]/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#33ffcc]/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#33ffcc]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#33ffcc] uppercase tracking-wider mb-1">
                Adresse de retrait
              </div>
              <div className="text-white font-medium">{WAREHOUSE.address}</div>
              <div className="text-xs text-white/50 mt-1">Retrait gratuit sur place</div>
            </div>
          </div>
        </div>
      )}

      {/* Recapitulatif prix */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/70">
            Location ({durationDays} jour{durationDays > 1 ? 's' : ''})
            {quantity > 1 && ` \u00d7 ${quantity}`}
          </span>
          <span className="text-white font-bold">{formatPrice(productPrice)}</span>
        </div>

        {deliveryMode === 'delivery' && distance && (
          <div className="flex items-center justify-between">
            <span className="text-white/70 flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              Livraison ({distance} km)
            </span>
            <span className="text-white font-bold">{formatPrice(deliveryFee)}</span>
          </div>
        )}

        {deliveryMode === 'pickup' && (
          <div className="flex items-center justify-between">
            <span className="text-white/70 flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              Click & Collect
            </span>
            <span className="text-[#33ffcc] font-bold">Gratuit</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-lg font-bold text-white">Total TTC</span>
          <span className="text-2xl font-black text-[#33ffcc]">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </>
  );
}
