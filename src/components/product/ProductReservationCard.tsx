import {
  ShoppingCart,
  Package,
  Calendar,
  Shield,
  Clock,
  AlertCircle,
  Award,
  MessageCircle,
} from 'lucide-react';
import { Product, PriceCalculation } from '../../types';
import { formatPrice, hasWeekend } from '../../utils/pricing';
import AvailabilityCalendar from '../AvailabilityCalendar';
import PriceCalculator from '../PriceCalculator';
import { TarifsDegressifs } from './TarifsDegressifs';

interface ProductReservationCardProps {
  product: Product;
  selectedStartDate: string;
  selectedEndDate: string;
  quantity: number;
  priceCalculation: PriceCalculation | null;
  availabilityError: string;
  isAddingToCart: boolean;
  onDateSelect: (startDate: string, endDate: string) => void;
  onClearSelection: () => void;
  onPriceChange: (calculation: PriceCalculation) => void;
  onAddToCart: () => void;
  getSelectedDays: () => number;
}

export function ProductReservationCard({
  product,
  selectedStartDate,
  selectedEndDate,
  quantity,
  priceCalculation,
  availabilityError,
  isAddingToCart,
  onDateSelect,
  onClearSelection,
  onPriceChange,
  onAddToCart,
  getSelectedDays,
}: ProductReservationCardProps) {
  const pricePerDay = product.pricing?.oneDay ?? 0;
  const isQuoteOnly = pricePerDay <= 0;

  if (isQuoteOnly) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 p-6 border-b border-white/10">
          <span className="text-white/60 text-sm">Tarification</span>
          <div className="text-3xl font-black text-amber-400 mt-1">Sur devis</div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-white/70 text-sm">Ce produit nécessite un devis personnalisé. Contactez-nous pour obtenir un tarif adapté à votre événement.</p>
          <a href="/contact" className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#33ffcc] text-[#000033] rounded-2xl hover:bg-[#66cccc] font-black text-lg transition-all">
            <MessageCircle className="w-5 h-5" />
            Demander un devis
          </a>
          <TrustBadges />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
      {/* Header avec prix */}
      <div className="bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/10 p-6 border-b border-white/10">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-white/60 text-sm">A partir de</span>
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#33ffcc]" />
            <span className="text-sm text-[#33ffcc] font-medium">{product.total_stock} disponibles</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-5xl font-black text-[#33ffcc]">{formatPrice(product.pricing.oneDay)}</span>
          <span className="text-xl text-white/60 font-medium">/jour</span>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 space-y-6">
        {/* Selecteur de dates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#33ffcc]" />
              Choisissez vos dates
            </h3>
          </div>

          {/* Quick date display */}
          {selectedStartDate && selectedEndDate && (
            <DateSummary
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              days={getSelectedDays()}
            />
          )}

          {/* Calendrier */}
          <AvailabilityCalendar
            productId={product.id}
            onDateSelect={onDateSelect}
            onClearSelection={onClearSelection}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
          />
        </div>

        {/* Tarifs dégressifs */}
        <TarifsDegressifs
          product={product}
          selectedStartDate={selectedStartDate || undefined}
          selectedEndDate={selectedEndDate || undefined}
        />

        {/* Calculateur de prix */}
        {selectedStartDate && selectedEndDate && (
          <div className="pt-4 border-t border-white/10">
            <PriceCalculator
              product={product}
              startDate={selectedStartDate}
              endDate={selectedEndDate}
              quantity={quantity}
              onPriceChange={onPriceChange}
            />
          </div>
        )}

        {/* Message d'erreur */}
        {availabilityError && (
          <div className="p-4 bg-[#fe1979]/20 border border-[#fe1979]/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#fe1979] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#fe1979] font-medium">{availabilityError}</p>
          </div>
        )}

        {/* Bouton Reserver */}
        <button
          onClick={onAddToCart}
          disabled={isAddingToCart || !selectedStartDate || !selectedEndDate}
          className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-[#33ffcc] text-[#000033] rounded-2xl hover:bg-[#66cccc] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-black text-lg shadow-lg shadow-[#33ffcc]/30"
        >
          {isAddingToCart ? (
            <>
              <div className="w-5 h-5 border-2 border-[#000033] border-t-transparent rounded-full animate-spin"></div>
              Ajout en cours...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {priceCalculation ? `Réserver • ${formatPrice(priceCalculation.total)}` : 'Ajouter au panier'}
            </>
          )}
        </button>

        {/* Trust badges */}
        <TrustBadges />
      </div>
    </div>
  );
}

function DateSummary({
  selectedStartDate,
  selectedEndDate,
  days,
}: {
  selectedStartDate: string;
  selectedEndDate: string;
  days: number;
}) {
  const weekendIncluded = hasWeekend(selectedStartDate, selectedEndDate);

  return (
    <div className="mb-4 p-4 bg-[#33ffcc]/10 rounded-xl border border-[#33ffcc]/30">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[#33ffcc] font-bold uppercase tracking-wider mb-1">Période</div>
          <div className="text-white font-bold">
            {new Date(selectedStartDate + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            {selectedEndDate !== selectedStartDate && (
              <> &rarr; {new Date(selectedEndDate + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</>
            )}
          </div>
          {weekendIncluded && (
            <div className="text-white/50 text-xs mt-1">
              · week-end inclus gratuitement
            </div>
          )}
        </div>
        <div className="bg-[#33ffcc] rounded-xl px-3 py-2 text-center">
          <div className="text-2xl font-black text-[#000033]">{days}</div>
          <div className="text-[10px] font-bold text-[#000033]/70 uppercase">jour{days > 1 ? 's' : ''} de location</div>
        </div>
      </div>
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
        <Shield className="w-4 h-4 text-[#33ffcc]" />
        <span className="text-xs text-white/70">Paiement sécurisé</span>
      </div>
      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
        <Award className="w-4 h-4 text-[#33ffcc]" />
        <span className="text-xs text-white/70">Qualité garantie</span>
      </div>
      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
        <MessageCircle className="w-4 h-4 text-[#33ffcc]" />
        <span className="text-xs text-white/70">Support 7j/7</span>
      </div>
      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
        <Clock className="w-4 h-4 text-[#33ffcc]" />
        <span className="text-xs text-white/70">Annulation 48h</span>
      </div>
    </div>
  );
}
