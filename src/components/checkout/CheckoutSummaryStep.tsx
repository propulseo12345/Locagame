import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Info,
  CheckCircle,
  AlertCircle,
  Shield,
  Lock,
  Tag,
  X,
  Loader2,
} from 'lucide-react';
import { formatPrice } from '../../utils/pricing';
import { PRICE_PER_KM } from '../../services/distance.service';
import { PromoCodesService } from '../../services';
import { AnalyticsService } from '../../services/analytics.service';
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
  // Promo code
  promoCode: string;
  promoDiscount: number;
  promoLabel: string;
  onApplyPromo: (code: string, discountType: 'percentage' | 'fixed', discountValue: number, label: string) => void;
  onRemovePromo: () => void;
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
  promoCode,
  promoDiscount,
  promoLabel,
  onApplyPromo,
  onRemovePromo,
}: CheckoutSummaryStepProps) {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotalForPromo = productsSubtotal + surchargesTotal;
  const adjustedTotal = finalTotal - promoDiscount;

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    setPromoLoading(true);
    setPromoError('');

    try {
      const result = await PromoCodesService.validate(code, subtotalForPromo);

      if (!result.valid) {
        setPromoError(result.error || 'Code invalide');
        return;
      }

      const label = result.discount_type === 'percentage'
        ? `${code} (-${result.discount_value}%)`
        : `${code} (-${formatPrice(result.discount_value || 0)})`;

      // Store promo metadata — discount amount is computed dynamically by useCheckout
      onApplyPromo(code, result.discount_type || 'fixed', result.discount_value || 0, label);
      AnalyticsService.promoCodeApplied(code, result.discount_type || 'fixed', result.discount_value || 0);
      setPromoError('');
    } catch {
      setPromoError('Erreur lors de la validation');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    onRemovePromo();
    setPromoInput('');
    setPromoError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Récapitulatif de votre commande</h2>
        <p className="text-gray-400 text-sm">Vérifiez les détails avant de procéder au paiement</p>
      </div>

      {/* Payment info */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-blue-400 text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Vous serez redirigé vers notre plateforme de paiement sécurisée Stripe pour finaliser votre commande.
        </p>
      </div>

      {/* Cart items recap */}
      <div className="space-y-3">
        {cartItems.map((item, index) => (
          <div key={index} className="flex gap-4 p-3 bg-white/5 rounded-xl">
            <img
              src={item.product.images?.[0] || '/placeholder-product.svg'}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{item.product.name}</p>
              <p className="text-gray-500 text-sm">
                {new Date(item.start_date + 'T00:00:00').toLocaleDateString('fr-FR')} &rarr; {new Date(item.end_date + 'T00:00:00').toLocaleDateString('fr-FR')}
              </p>
            </div>
            <p className="text-white font-bold">{formatPrice(pricingBreakdowns[index]?.productSubtotal ?? item.total_price)}</p>
          </div>
        ))}
      </div>

      {/* Code promo */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
        <label className="block text-sm text-gray-400 mb-2">Code promo</label>
        {promoCode ? (
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium text-sm">{promoLabel}</span>
            </div>
            <button
              onClick={handleRemovePromo}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Entrez votre code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#33ffcc] transition-colors text-sm"
                />
              </div>
              <button
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoInput.trim()}
                className="px-5 py-3 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white font-medium rounded-xl transition-colors text-sm flex items-center gap-2"
              >
                {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Appliquer'}
              </button>
            </div>
            {promoError && (
              <p className="mt-2 text-sm text-red-400">{promoError}</p>
            )}
          </>
        )}
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
              Forfait week-end appliqué
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
                <span className="text-xs ml-1">({deliveryDistance} km &times; {PRICE_PER_KM.toFixed(2)}&euro;)</span>
              )}
            </span>
            <span className="text-white font-medium">
              {calculatedDeliveryFee > 0
                ? formatPrice(calculatedDeliveryFee)
                : <span className="text-orange-400 text-sm">À calculer</span>}
            </span>
          </div>
        )}

        {isPickup && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Retrait à l'entrepôt</span>
            <span className="text-green-400 font-medium">Gratuit</span>
          </div>
        )}

        {promoDiscount > 0 && (
          <div className="flex justify-between items-center py-2 border-y border-white/10">
            <span className="text-green-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              {promoLabel}
            </span>
            <span className="text-green-400 font-medium">-{formatPrice(promoDiscount)}</span>
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
            <span className="text-2xl font-bold text-[#33ffcc]">{formatPrice(adjustedTotal)}</span>
          </div>
        </div>

        <p className="text-gray-500 text-xs">* Paiement sécurisé par Stripe. Vous recevrez une confirmation par email.</p>
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
            <Link to="/cgv" className="text-[#33ffcc] hover:underline">conditions générales de vente</Link>
            {' '}et la{' '}
            <Link to="/confidentialite" className="text-[#33ffcc] hover:underline">politique de confidentialité</Link> *
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
            Je souhaite recevoir les offres et nouveautés par email
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
          <span>Paiement sécurisé Stripe</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="w-4 h-4" />
          <span>Données chiffrées SSL</span>
        </div>
      </div>
    </div>
  );
}
