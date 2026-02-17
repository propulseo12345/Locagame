import { MapPin, Loader2 } from 'lucide-react';
import { formatPrice } from '../../utils/pricing';
import { PRICE_PER_KM } from '../../services/distance.service';
import type { DeliveryState } from '../../hooks/checkout/types';
import { inputClass, labelClass, errorClass } from '../../hooks/checkout/types';

interface CheckoutDeliveryAddressProps {
  delivery: DeliveryState;
  setDelivery: React.Dispatch<React.SetStateAction<DeliveryState>>;
  errors: Record<string, string>;
  isCalculatingFee: boolean;
  deliveryDistance: number;
  calculatedDeliveryFee: number;
}

export function CheckoutDeliveryAddress({
  delivery,
  setDelivery,
  errors,
  isCalculatingFee,
  deliveryDistance,
  calculatedDeliveryFee,
}: CheckoutDeliveryAddressProps) {
  const hasFullAddress = delivery.address && delivery.city && delivery.postalCode;

  return (
    <div className="pt-4 border-t border-white/10">
      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-[#33ffcc]" />
        Adresse de livraison
      </h3>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Adresse *</label>
          <input
            type="text"
            value={delivery.address}
            onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
            className={inputClass}
            placeholder="123 rue de la Paix"
          />
          {errors.address && <p className={errorClass}>{errors.address}</p>}
        </div>
        <div>
          <label className={labelClass}>Complement d'adresse</label>
          <input
            type="text"
            value={delivery.addressComplement}
            onChange={(e) => setDelivery({ ...delivery, addressComplement: e.target.value })}
            className={inputClass}
            placeholder="Batiment, etage, digicode..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Code postal *</label>
            <input
              type="text"
              value={delivery.postalCode}
              onChange={(e) => setDelivery({ ...delivery, postalCode: e.target.value })}
              className={inputClass}
              placeholder="13001"
            />
            {errors.postalCode && <p className={errorClass}>{errors.postalCode}</p>}
          </div>
          <div>
            <label className={labelClass}>Ville *</label>
            <input
              type="text"
              value={delivery.city}
              onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
              className={inputClass}
              placeholder="Marseille"
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
                <span>Calcul des frais de livraison...</span>
              </div>
            ) : deliveryDistance > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Distance depuis l'entrepot</span>
                  <span className="text-white font-medium">{deliveryDistance} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Tarif kilometrique</span>
                  <span className="text-white">{PRICE_PER_KM.toFixed(2)}&euro; / km</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-[#33ffcc] font-medium">Frais de livraison</span>
                  <span className="text-[#33ffcc] font-bold">{formatPrice(calculatedDeliveryFee)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Les frais de livraison seront calcules apres verification de l'adresse
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
