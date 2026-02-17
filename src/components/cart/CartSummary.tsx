import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Truck, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/pricing';

interface CartSummaryProps {
  productsTotal: number;
  deliveryFee: number;
  totalPrice: number;
}

export default function CartSummary({ productsTotal, deliveryFee, totalPrice }: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState('');
  const [promoCodeSuccess, setPromoCodeSuccess] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyPromoCode = () => {
    const validCodes: { [key: string]: number } = {
      'WELCOME10': 10,
      'SUMMER20': 20,
      'FAMILY15': 15
    };

    if (promoCode in validCodes) {
      setDiscount(validCodes[promoCode]);
      setPromoCodeSuccess(`-${validCodes[promoCode]}€ appliqué`);
      setPromoCodeError('');
    } else {
      setPromoCodeError('Code invalide');
      setPromoCodeSuccess('');
    }
  };

  const calculateTotal = () => totalPrice - discount;

  return (
    <div className="sticky top-[calc(var(--header-height)+1rem)] bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      {/* Header récapitulatif */}
      <div className="px-6 py-5 border-b border-white/10">
        <h3 className="text-lg font-bold text-white">Récapitulatif</h3>
      </div>

      <div className="p-6">
        {/* Code promo */}
        <div className="mb-6">
          <label className="block text-sm text-white/60 mb-2">
            Code promo
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Entrez votre code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all text-sm"
              />
            </div>
            <button
              onClick={applyPromoCode}
              className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-colors text-sm"
            >
              Appliquer
            </button>
          </div>
          {promoCodeError && (
            <p className="mt-2 text-sm text-red-400">{promoCodeError}</p>
          )}
          {promoCodeSuccess && (
            <p className="mt-2 text-sm text-[#33ffcc]">{promoCodeSuccess}</p>
          )}
        </div>

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
                <span className="text-[#33ffcc]">Gratuit (Click & Collect)</span>
              )}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#33ffcc]">Réduction</span>
              <span className="text-[#33ffcc] font-medium">-{formatPrice(discount)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-white/10 pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Total TTC</span>
            <span className="text-2xl md:text-3xl font-bold text-white">{formatPrice(calculateTotal())}</span>
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
              <Truck className="w-4 h-4 text-[#33ffcc]" />
            </div>
            <span>Livraison et installation incluses</span>
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
