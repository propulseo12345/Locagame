import { useCallback } from 'react';
import { MapPin, Loader2, AlertTriangle, Search } from 'lucide-react';
import { formatPrice } from '../../utils/pricing';
import { PRICE_PER_KM } from '../../services/distance.service';
import type { AddressSuggestion } from '../../services/distance.service';
import { useAddressAutocomplete } from '../../hooks/checkout/useAddressAutocomplete';
import type { DeliveryState } from '../../hooks/checkout/types';
import { labelClass, errorClass } from '../../hooks/checkout/types';

interface CheckoutDeliveryAddressProps {
  delivery: DeliveryState;
  setDelivery: React.Dispatch<React.SetStateAction<DeliveryState>>;
  errors: Record<string, string>;
  isCalculatingFee: boolean;
  deliveryDistance: number;
  calculatedDeliveryFee: number;
  deliveryError: string;
  calculateFromCoords: (lat: number, lng: number) => Promise<void>;
}

const inputBase = "w-full px-4 py-3.5 text-base bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none transition-colors";

export function CheckoutDeliveryAddress({
  delivery,
  setDelivery,
  errors,
  isCalculatingFee,
  deliveryDistance,
  calculatedDeliveryFee,
  deliveryError,
  calculateFromCoords,
}: CheckoutDeliveryAddressProps) {
  const hasFullAddress = delivery.address && delivery.city && delivery.postalCode;

  const handleAddressSelected = useCallback((suggestion: AddressSuggestion) => {
    // Remplit tous les champs simultanément
    setDelivery(prev => ({
      ...prev,
      address: suggestion.street || suggestion.label,
      city: suggestion.city,
      postalCode: suggestion.postalCode,
    }));
    // Calcul instantané via les coords (skip geocoding)
    calculateFromCoords(suggestion.lat, suggestion.lng);
  }, [setDelivery, calculateFromCoords]);

  const autocomplete = useAddressAutocomplete(handleAddressSelected);

  // Synchronise le query avec la valeur delivery.address quand elle change
  // (ex: l'utilisateur édite manuellement le champ après sélection)
  const handleManualInput = useCallback((value: string) => {
    autocomplete.handleInputChange(value);
    setDelivery(prev => ({ ...prev, address: value }));
  }, [autocomplete.handleInputChange, setDelivery]);

  return (
    <div className="pt-4 border-t border-white/10">
      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-[#33ffcc]" />
        Adresse de livraison
      </h3>
      <div className="space-y-4">
        {/* Autocomplete address field */}
        <div className="relative">
          <label className={labelClass}>Adresse *</label>
          <div className={`relative flex items-center rounded-xl border transition-all bg-white/5 ${
            errors.address
              ? 'border-red-500/50'
              : autocomplete.selectedAddress
                ? 'border-[#33ffcc]/50'
                : 'border-white/10 focus-within:border-[#33ffcc]'
          }`}>
            <div className="pl-3.5 pr-2">
              {autocomplete.isLoading
                ? <Loader2 className="w-4 h-4 text-[#33ffcc] animate-spin" />
                : <Search className="w-4 h-4 text-gray-500" />
              }
            </div>
            <input
              ref={autocomplete.inputRef}
              type="text"
              value={autocomplete.query || delivery.address}
              onChange={(e) => handleManualInput(e.target.value)}
              onFocus={autocomplete.handleFocus}
              onBlur={autocomplete.handleBlur}
              className="flex-1 py-3.5 pr-4 bg-transparent text-white placeholder-gray-500 outline-none"
              style={{ fontSize: '16px' }}
              placeholder="Ex : 15 rue de la République..."
              autoComplete="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-expanded={autocomplete.isOpen}
              role="combobox"
            />
            {autocomplete.selectedAddress && (
              <div className="pr-3">
                <div className="w-2 h-2 rounded-full bg-[#33ffcc]" />
              </div>
            )}
          </div>
          {errors.address && <p className={errorClass}>{errors.address}</p>}

          {/* Suggestions dropdown */}
          {autocomplete.isOpen && autocomplete.suggestions.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
              role="listbox"
            >
              {autocomplete.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => autocomplete.handleSelect(suggestion)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
                  role="option"
                >
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-500 group-hover:text-[#33ffcc] transition-colors" />
                  <div>
                    <p className="text-sm text-white font-medium leading-snug">
                      {suggestion.street || suggestion.label}
                    </p>
                    {(suggestion.postalCode || suggestion.city) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[suggestion.postalCode, suggestion.city].filter(Boolean).join(' ')}
                      </p>
                    )}
                  </div>
                </button>
              ))}
              <div className="px-4 py-1.5 border-t border-white/5">
                <p className="text-[10px] text-gray-600 text-right">OpenRouteService</p>
              </div>
            </div>
          )}

          {/* No results message */}
          {autocomplete.isOpen && !autocomplete.isLoading && autocomplete.suggestions.length === 0 && (autocomplete.query?.length ?? 0) >= 3 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
              <p className="text-sm text-gray-500">Aucune adresse trouvée — vérifiez votre saisie</p>
            </div>
          )}
        </div>

        {/* Complement */}
        <div>
          <label className={labelClass}>Complément d'adresse</label>
          <input
            type="text"
            value={delivery.addressComplement}
            onChange={(e) => setDelivery({ ...delivery, addressComplement: e.target.value })}
            className={inputBase}
            placeholder="Bâtiment, étage, digicode..."
          />
        </div>

        {/* Postal code + City — pre-filled by autocomplete, still editable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Code postal *</label>
            <input
              type="text"
              value={delivery.postalCode}
              onChange={(e) => setDelivery({ ...delivery, postalCode: e.target.value })}
              className={inputBase}
              style={{ fontSize: '16px' }}
              placeholder="13001"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={5}
            />
            {errors.postalCode && <p className={errorClass}>{errors.postalCode}</p>}
          </div>
          <div>
            <label className={labelClass}>Ville *</label>
            <input
              type="text"
              value={delivery.city}
              onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
              className={inputBase}
              style={{ fontSize: '16px' }}
              placeholder="Marseille"
              autoComplete="address-level2"
            />
            {errors.city && <p className={errorClass}>{errors.city}</p>}
          </div>
        </div>

        {/* Delivery fee display */}
        {hasFullAddress && (
          <div className="mt-4 p-4 bg-[#33ffcc]/10 rounded-xl border border-[#33ffcc]/30">
            {isCalculatingFee ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calcul de la distance routière...</span>
              </div>
            ) : deliveryError ? (
              <div className="flex items-start gap-2 text-orange-400">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-sm">{deliveryError}</span>
              </div>
            ) : deliveryDistance > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Distance routière depuis l'entrepôt</span>
                  <span className="text-white font-medium">{deliveryDistance} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Tarif kilométrique</span>
                  <span className="text-white">{PRICE_PER_KM.toFixed(2)}&euro; / km</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-[#33ffcc] font-medium">Frais de livraison</span>
                  <span className="text-[#33ffcc] font-bold">{formatPrice(calculatedDeliveryFee)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Les frais de livraison seront calculés après vérification de l'adresse
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
