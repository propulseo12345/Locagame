import { Check, AlertCircle } from 'lucide-react';
import { formatDate, formatPrice } from '../../utils/pricing';

interface DateSelectionSummaryProps {
  startDate: Date;
  endDate: Date;
  durationDays: number;
  quantity: number;
  estimatedPrice: number;
  isCheckingAvailability: boolean;
  isAvailable: boolean | null;
  errorMessage: string;
}

export function DateSelectionSummary({
  startDate, endDate, durationDays, quantity, estimatedPrice,
  isCheckingAvailability, isAvailable, errorMessage,
}: DateSelectionSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#33ffcc]/10 to-[#66cccc]/10 backdrop-blur-sm rounded-xl p-4 border border-[#33ffcc]/30">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Date de debut</span>
            <span className="font-semibold text-white">{formatDate(startDate)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Date de fin</span>
            <span className="font-semibold text-white">{formatDate(endDate)}</span>
          </div>
          <div className="pt-3 border-t border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Duree de location</span>
              <span className="text-xl font-bold text-[#33ffcc]">
                {durationDays} jour{durationDays > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {quantity > 1 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Quantite</span>
              <span className="text-white font-semibold">{quantity}</span>
            </div>
          )}
          <div className="pt-3 border-t border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Prix estime</span>
              <span className="text-2xl font-black text-[#33ffcc]">{formatPrice(estimatedPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statut de disponibilite */}
      {isCheckingAvailability && (
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 p-3 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#33ffcc] border-t-transparent"></div>
          Verification de la disponibilite...
        </div>
      )}

      {!isCheckingAvailability && isAvailable === true && (
        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/30">
          <Check className="w-5 h-5" />
          <span className="font-medium">Disponible pour ces dates</span>
        </div>
      )}

      {!isCheckingAvailability && isAvailable === false && errorMessage && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
