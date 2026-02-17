import { Navigation, AlertCircle, Loader2, Truck } from 'lucide-react';
import { formatPrice } from '../../utils/pricing';

interface DeliveryFormProps {
  postalCode: string;
  setPostalCode: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  distance: number | null;
  isCalculating: boolean;
  geoError: string;
  deliveryFee: number;
  onUseGeolocation: () => void;
}

export function DeliveryForm({
  postalCode, setPostalCode,
  address, setAddress,
  city, setCity,
  distance, isCalculating, geoError, deliveryFee,
  onUseGeolocation,
}: DeliveryFormProps) {
  return (
    <div className="space-y-4">
      {/* Code postal */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Code postal de livraison
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="13001"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            className="flex-1 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-[#33ffcc] focus:border-[#33ffcc] focus:outline-none transition-all"
            maxLength={5}
          />
          <button
            onClick={onUseGeolocation}
            disabled={isCalculating}
            className="px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-50"
            title="Utiliser ma position"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Adresse complete (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Adresse de livraison <span className="text-white/40">(optionnel)</span>
        </label>
        <input
          type="text"
          placeholder="123 rue Example"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-[#33ffcc] focus:border-[#33ffcc] focus:outline-none transition-all"
        />
      </div>

      {/* Ville (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Ville <span className="text-white/40">(optionnel)</span>
        </label>
        <input
          type="text"
          placeholder="Marseille"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-[#33ffcc] focus:border-[#33ffcc] focus:outline-none transition-all"
        />
      </div>

      {/* Calcul en cours */}
      {isCalculating && (
        <div className="flex items-center gap-2 text-white/60">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Calcul de la distance...</span>
        </div>
      )}

      {/* Erreur */}
      {geoError && (
        <div className="p-3 bg-[#fe1979]/20 border border-[#fe1979]/30 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#fe1979] flex-shrink-0 mt-0.5" />
          <span className="text-sm text-[#fe1979]">{geoError}</span>
        </div>
      )}

      {/* Resultat distance */}
      {distance && !isCalculating && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#33ffcc]" />
              <span className="text-white/70">Distance estimee</span>
            </div>
            <span className="text-white font-bold">{distance} km</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
            <span className="text-white/70">Frais de livraison</span>
            <span className="text-[#33ffcc] font-bold">{formatPrice(deliveryFee)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
