import { Link } from 'react-router-dom';
import {
  Info,
  CheckCircle,
  AlertCircle,
  Shield,
  Lock,
} from 'lucide-react';
import { formatPrice } from '../../utils/pricing';
import { PRICE_PER_KM } from '../../services/distance.service';
import type { PricingBreakdown } from '../../utils/pricingRules';
import type { CartItem } from '../../types';
import type { PaymentState } from '../../hooks/checkout/types';
import { errorClass } from '../../hooks/checkout/types';

interface CheckoutSummaryStepProps {
  cartItems: CartItem[];
  pricingBreakdowns: PricingBreakdown[];
  productsSubtotal: number;
  surchargesTotal: number;
  finalTotal: number;
  calculatedDeliveryFee: number;
  deliveryDistance: number;
  isPickup: boolean;
  pricingInfoMessage: string | undefined;
  payment: PaymentState;
  setPayment: React.Dispatch<React.SetStateAction<PaymentState>>;
  errors: Record<string, string>;
  submitError: string | null;
}

export function CheckoutSummaryStep({
  cartItems,
  pricingBreakdowns,
  productsSubtotal,
  surchargesTotal,
  finalTotal,
  calculatedDeliveryFee,
  deliveryDistance,
  isPickup,
  pricingInfoMessage,
  payment,
  setPayment,
  errors,
  submitError,
}: CheckoutSummaryStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Recapitulatif de votre commande</h2>
        <p className="text-gray-400 text-sm">Verifiez les details avant de proceder au paiement</p>
      </div>

      {/* Payment info */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-blue-400 text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Vous serez redirige vers notre plateforme de paiement securisee Stripe pour finaliser votre commande.
        </p>
      </div>

      {/* Cart items recap */}
      <div className="space-y-3">
        {cartItems.map((item, index) => (
          <div key={index} className="flex gap-4 p-3 bg-white/5 rounded-xl">
            <img
              src={item.product.images[0] || '/placeholder.jpg'}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{item.product.name}</p>
              <p className="text-gray-500 text-sm">
                {new Date(item.start_date).toLocaleDateString('fr-FR')} &rarr; {new Date(item.end_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <p className="text-white font-bold">{formatPrice(item.total_price)}</p>
          </div>
        ))}
      </div>

      {/* Total with details */}
      <div className="p-4 bg-[#33ffcc]/10 rounded-xl border border-[#33ffcc]/20 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Sous-total produits</span>
          <span className="text-white font-medium">{formatPrice(productsSubtotal)}</span>
        </div>

        {pricingBreakdowns.some(b => b.weekendFlatRateApplied) && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-purple-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Forfait week-end applique
            </span>
            <span className="text-purple-400">Inclus</span>
          </div>
        )}

        {surchargesTotal > 0 && (
          <div className="space-y-2 py-2 border-y border-white/10">
            {pricingBreakdowns.flatMap(b => b.rulesApplied.filter(r => r.type === 'surcharge')).map((rule, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-amber-400">{rule.name}</span>
                <span className="text-amber-400">+{formatPrice(rule.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {!isPickup && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">
              Frais de livraison
              {deliveryDistance > 0 && (
                <span className="text-xs ml-1">({deliveryDistance} km x {PRICE_PER_KM.toFixed(2)}&euro;)</span>
              )}
            </span>
            <span className="text-white font-medium">
              {calculatedDeliveryFee > 0 ? formatPrice(calculatedDeliveryFee) : 'A calculer'}
            </span>
          </div>
        )}

        {isPickup && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Retrait a l'entrepot</span>
            <span className="text-green-400 font-medium">Gratuit</span>
          </div>
        )}

        {pricingInfoMessage && (
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <p className="text-blue-400 text-xs flex items-center gap-1">
              <Info className="w-3 h-3" />
              {pricingInfoMessage}
            </p>
          </div>
        )}

        <div className="border-t border-white/10 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold">Total</span>
            <span className="text-2xl font-bold text-[#33ffcc]">{formatPrice(finalTotal)}</span>
          </div>
        </div>

        <p className="text-gray-500 text-xs">* Paiement securise par Stripe. Vous recevrez une confirmation par email.</p>
      </div>

      {/* CGV */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={payment.acceptCGV}
            onChange={(e) => setPayment({ ...payment, acceptCGV: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
          />
          <span className="text-gray-400 text-sm">
            J'accepte les{' '}
            <Link to="/cgv" className="text-[#33ffcc] hover:underline">conditions generales de vente</Link>
            {' '}et la{' '}
            <Link to="/confidentialite" className="text-[#33ffcc] hover:underline">politique de confidentialite</Link> *
          </span>
        </label>
        {errors.acceptCGV && <p className={errorClass}>{errors.acceptCGV}</p>}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={payment.acceptNewsletter}
            onChange={(e) => setPayment({ ...payment, acceptNewsletter: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
          />
          <span className="text-gray-400 text-sm">
            Je souhaite recevoir les offres et nouveautes par email
          </span>
        </label>
      </div>

      {/* Error */}
      {submitError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {submitError}
          </p>
        </div>
      )}

      {/* Security */}
      <div className="flex items-center gap-4 text-gray-500 text-sm">
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4" />
          <span>Paiement securise Stripe</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="w-4 h-4" />
          <span>Donnees chiffrees SSL</span>
        </div>
      </div>
    </div>
  );
}
