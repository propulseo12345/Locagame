import { Truck, Package, MapPin, Tag, AlertTriangle, Info } from 'lucide-react';
import { formatPrice } from '../../utils/pricing';
import { WAREHOUSE } from './constants';
import type { PricingBreakdown } from '../../utils/pricingRulesTypes';

interface PriceSummaryProps {
  deliveryMode: 'pickup' | 'delivery';
  durationDays: number;
  quantity: number;
  productPrice: number;
  deliveryFee: number;
  totalPrice: number;
  distance: number | null;
  breakdown: PricingBreakdown;
}

export function PriceSummary({
  deliveryMode, durationDays, quantity,
  productPrice, deliveryFee, totalPrice, distance,
  breakdown,
}: PriceSummaryProps) {
  const hasDiscount = breakdown.rulesApplied.some(r => r.type === 'discount');
  const hasSurcharges = breakdown.surchargesTotal > 0;

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
        {/* Ligne produit : label du palier + prix */}
        <div className="flex items-center justify-between">
          <span className="text-white/70">
            {breakdown.basePriceLabel}
            {quantity > 1 && ` \u00d7 ${quantity}`}
          </span>
          <span className="text-white font-bold">{formatPrice(productPrice)}</span>
        </div>

        {/* Badge réduction si applicable */}
        {hasDiscount && breakdown.rulesApplied
          .filter(r => r.type === 'discount')
          .map(rule => (
            <div key={rule.id} className="flex items-center gap-1.5 text-[#33ffcc]">
              <Tag className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{rule.name}</span>
            </div>
          ))}

        {/* Forfait week-end */}
        {breakdown.weekendFlatRateApplied && (
          <div className="flex items-center gap-1.5 text-amber-300">
            <Info className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Forfait week-end appliqué</span>
          </div>
        )}

        {/* Majorations week-end / jour férié */}
        {hasSurcharges && breakdown.rulesApplied
          .filter(r => r.type === 'surcharge')
          .map(rule => (
            <div key={rule.id} className="flex items-center justify-between">
              <span className="text-amber-300/80 flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                {rule.name}
              </span>
              <span className="text-amber-300 font-bold text-sm">+{formatPrice(rule.amount)}</span>
            </div>
          ))}

        {/* Livraison */}
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

        {/* Info UX */}
        {breakdown.infoMessage && (
          <div className="text-xs text-white/50 italic">
            {breakdown.infoMessage}
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-lg font-bold text-white">Total TTC</span>
          <span className="text-2xl font-black text-[#33ffcc]">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </>
  );
}
