import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Truck, Package, Tag } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CartItem } from '../../types';
import type { PricingBreakdown } from '../../utils/pricingRules';
import { formatPrice } from '../../utils/pricing';

interface CheckoutLayoutProps {
  children: ReactNode;
  cartItems: CartItem[];
  finalTotal: number;
  checkingAvailability: boolean;
  unavailableProducts: string[];
  // Pricing details
  pricingBreakdowns: PricingBreakdown[];
  productsSubtotal: number;
  surchargesTotal: number;
  calculatedDeliveryFee: number;
  deliveryDistance: number;
  isPickup: boolean;
  // Promo
  promoDiscount?: number;
  promoLabel?: string;
}

export function CheckoutLayout({
  children, cartItems, finalTotal, checkingAvailability, unavailableProducts,
  pricingBreakdowns, productsSubtotal, surchargesTotal, calculatedDeliveryFee, deliveryDistance, isPickup,
  promoDiscount = 0, promoLabel = '',
}: CheckoutLayoutProps) {
  return (
    <>
      {checkingAvailability && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#33ffcc] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/60 text-sm">Vérification de la disponibilité...</span>
        </div>
      )}
      {unavailableProducts.length > 0 && (
        <div className="mb-6 p-5 bg-red-500/10 rounded-xl border border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-400 font-bold mb-1">
                Produit{unavailableProducts.length > 1 ? 's' : ''} indisponible{unavailableProducts.length > 1 ? 's' : ''}
              </h3>
              <p className="text-red-300/80 text-sm mb-3">
                {unavailableProducts.length === 1
                  ? `Le produit "${unavailableProducts[0]}" n'est plus disponible pour les dates sélectionnées.`
                  : `Les produits suivants ne sont plus disponibles : ${unavailableProducts.join(', ')}.`}
              </p>
              <Link to="/panier" className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />Modifier mon panier
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-w-0">{children}</div>
        <aside className="hidden md:block md:w-72 lg:w-80 shrink-0">
          <div className="md:sticky md:top-[calc(var(--header-height)+1rem)] space-y-4">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Récapitulatif</h3>

              {/* Products */}
              <div className="space-y-3">
                {cartItems.map((item, idx) => {
                  const breakdown = pricingBreakdowns[idx];
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden shrink-0">
                        {item.product.images?.[0] && (
                          <img src={item.product.images[0]} alt="" width={100} height={100} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.quantity > 1 && `x${item.quantity} · `}
                          {item.start_date && new Date(item.start_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          {item.end_date && ` → ${new Date(item.end_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                      <span className="text-sm text-white font-medium whitespace-nowrap">
                        {formatPrice(breakdown?.productSubtotal ?? item.total_price)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price breakdown */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Sous-total produits</span>
                  <span className="text-sm text-white">{formatPrice(productsSubtotal)}</span>
                </div>

                {/* Surcharges */}
                {surchargesTotal > 0 && (
                  <>
                    {pricingBreakdowns.flatMap(b => b.rulesApplied.filter(r => r.type === 'surcharge')).map((rule, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs text-amber-400">{rule.name}</span>
                        <span className="text-sm text-amber-400">+{formatPrice(rule.amount)}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Delivery / Pickup */}
                <div className="flex items-center justify-between">
                  {isPickup ? (
                    <>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Retrait entrepôt
                      </span>
                      <span className="text-sm text-green-400 font-medium">Gratuit</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Livraison
                        {deliveryDistance > 0 && (
                          <span className="text-[10px] text-gray-500">({deliveryDistance} km)</span>
                        )}
                      </span>
                      <span className="text-sm text-white font-medium">
                        {calculatedDeliveryFee > 0
                          ? formatPrice(calculatedDeliveryFee)
                          : <span className="text-orange-400">À calculer</span>
                        }
                      </span>
                    </>
                  )}
                </div>

                {/* Promo discount */}
                {promoDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {promoLabel}
                    </span>
                    <span className="text-sm text-green-400 font-medium">-{formatPrice(promoDiscount)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="pt-2.5 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-semibold">Total</span>
                    <span className="text-lg font-bold text-[#33ffcc]">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
