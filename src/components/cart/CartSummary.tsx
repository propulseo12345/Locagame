import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../../utils/pricing';
import type { PricingRuleApplied } from '../../utils/pricingRulesTypes';

interface CartSummaryProps {
  productsTotal: number;
  deliveryFee: number;
  totalPrice: number;
  surchargesTotal?: number;
  surchargeRules?: PricingRuleApplied[];
}

export default function CartSummary({
  productsTotal, deliveryFee, totalPrice,
  surchargesTotal = 0, surchargeRules = []
}: CartSummaryProps) {
  const total = totalPrice + surchargesTotal;

  return (
    <div className="sticky top-[calc(var(--header-height)+1rem)] bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      {/* Header récapitulatif */}
      <div className="px-6 py-5 border-b border-white/10">
        <h3 className="text-lg font-bold text-white">Récapitulatif</h3>
      </div>

      <div className="p-6">
        {/* Détail des prix */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Location</span>
            <span className="text-white">{formatPrice(productsTotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/60 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Livraison
            </span>
            <span className="text-white">
              {deliveryFee > 0 ? formatPrice(deliveryFee) : (
                <span className="text-white/40 text-xs">Calculé à l'étape suivante</span>
              )}
            </span>
          </div>
          <p className="text-[11px] text-white/40 pl-6">
            0,80 €/km depuis notre entrepôt
          </p>

          {surchargesTotal > 0 && (
            <div className="space-y-2 py-3 border-t border-white/10">
              {surchargeRules.map((rule, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {rule.name}
                  </span>
                  <span className="text-amber-400 font-medium">+{formatPrice(rule.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-white/10 pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Total TTC</span>
            <span className="text-2xl md:text-3xl font-bold text-white">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Bouton commander */}
        <Link
          to="/checkout"
          className="group w-full flex items-center justify-center gap-3 py-4 bg-[#33ffcc] hover:bg-[#4fffdd] text-[#000033] font-bold text-lg rounded-xl transition-all duration-200 hover:shadow-[0_0_30px_rgba(51,255,204,0.3)]"
        >
          Commander
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Badges de confiance */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="w-8 h-8 rounded-lg bg-[#33ffcc]/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#33ffcc]" />
            </div>
            <span>Paiement 100% sécurisé</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="w-8 h-8 rounded-lg bg-[#33ffcc]/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-[#33ffcc]" />
            </div>
            <span>Assistance 7j/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
