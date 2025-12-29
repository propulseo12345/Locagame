import { useState, useEffect } from 'react';
import { MapPin, Truck, Package, Navigation, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Product, PriceCalculation } from '../types';
import { formatPrice } from '../utils/pricing';

interface PriceCalculatorProps {
  product: Product;
  startDate?: string;
  endDate?: string;
  quantity: number;
  onPriceChange: (calculation: PriceCalculation) => void;
}

// Coordonnées de l'entrepôt
const WAREHOUSE = {
  address: "553, rue St Pierre 13012 Marseille",
  lat: 43.3020,
  lng: 5.4310
};

// Prix par kilomètre
const PRICE_PER_KM = 0.80;

// Estimation des distances par code postal (en km depuis l'entrepôt)
const POSTAL_CODE_DISTANCES: { [key: string]: number } = {
  // Marseille
  '13001': 5, '13002': 4, '13003': 3, '13004': 4, '13005': 5,
  '13006': 6, '13007': 7, '13008': 8, '13009': 10, '13010': 6,
  '13011': 4, '13012': 2, '13013': 5, '13014': 6, '13015': 8,
  '13016': 15, '13017': 20, '13018': 25, '13019': 30,
  // Aix-en-Provence
  '13080': 35, '13090': 32, '13100': 30, '13290': 28, '13540': 25,
  // Aubagne
  '13400': 18, '13390': 20,
  // Martigues
  '13500': 40,
  // Autres villes des Bouches-du-Rhône
  '13600': 45, '13700': 50, '13800': 55, '13127': 35,
  '13220': 25, '13230': 35, '13250': 22, '13260': 28,
  '13270': 55, '13280': 60, '13300': 38, '13310': 42,
  '13320': 48, '13330': 52, '13340': 65, '13350': 58,
  '13360': 62, '13370': 45, '13380': 48, '13410': 50,
  '13420': 52, '13430': 55, '13440': 58, '13450': 60,
  '13460': 62, '13470': 65, '13480': 22, '13490': 68,
  // Var
  '83000': 60, '83100': 65, '83120': 55, '83130': 58,
  '83140': 70, '83150': 75, '83160': 80, '83170': 45,
  '83190': 50, '83200': 55, '83210': 48, '83220': 52,
  // Vaucluse
  '84000': 85, '84100': 90, '84200': 95, '84300': 100,
  // Alpes
  '04000': 120, '05000': 150,
  // Gard
  '30000': 100, '30100': 105,
};

export default function PriceCalculator({
  product,
  startDate,
  endDate,
  quantity,
  onPriceChange
}: PriceCalculatorProps) {
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const durationDays = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  const getProductPrice = () => {
    const { pricing } = product;
    if (durationDays === 1) return pricing.oneDay;
    if (durationDays >= 2 && durationDays <= 3) return pricing.weekend;
    if (durationDays >= 4 && durationDays <= 7) return pricing.week;
    return pricing.custom * durationDays;
  };

  const productPrice = getProductPrice() * quantity;
  const deliveryFee = deliveryMode === 'delivery' && distance ? Math.round(distance * PRICE_PER_KM * 100) / 100 : 0;
  const totalPrice = productPrice + deliveryFee;

  // Calculer la distance quand le code postal change
  useEffect(() => {
    if (deliveryMode === 'delivery' && postalCode.length === 5) {
      calculateDistance();
    } else if (deliveryMode === 'pickup') {
      setDistance(null);
    }
  }, [postalCode, deliveryMode]);

  // Mettre à jour le prix parent
  useEffect(() => {
    if (startDate && endDate) {
      const calculation: PriceCalculation = {
        product_price: productPrice,
        delivery_fee: deliveryFee,
        total: totalPrice,
        duration_days: durationDays,
        delivery_mode: deliveryMode,
        delivery_address: address || undefined,
        delivery_city: city || undefined,
        delivery_postal_code: postalCode || undefined,
        delivery_distance: distance || undefined
      };
      onPriceChange(calculation);
    }
  }, [productPrice, deliveryFee, totalPrice, durationDays, startDate, endDate, deliveryMode, distance, address, city, postalCode]);

  const calculateDistance = () => {
    setIsCalculating(true);
    setGeoError('');

    // Simulation d'un délai de calcul
    setTimeout(() => {
      // Chercher dans notre table de distances
      const estimatedDistance = POSTAL_CODE_DISTANCES[postalCode];

      if (estimatedDistance) {
        setDistance(estimatedDistance);
      } else if (postalCode.startsWith('13')) {
        // Code postal des Bouches-du-Rhône non répertorié - estimation
        setDistance(40);
      } else if (postalCode.startsWith('83') || postalCode.startsWith('84')) {
        // Var ou Vaucluse
        setDistance(80);
      } else if (postalCode.startsWith('04') || postalCode.startsWith('05') || postalCode.startsWith('06')) {
        // Alpes
        setDistance(120);
      } else if (postalCode.startsWith('30') || postalCode.startsWith('34')) {
        // Gard, Hérault
        setDistance(100);
      } else {
        // Hors zone - afficher un message
        setGeoError('Zone de livraison très éloignée. Contactez-nous pour un devis.');
        setDistance(null);
      }

      setIsCalculating(false);
    }, 500);
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('La géolocalisation n\'est pas disponible');
      return;
    }

    setIsCalculating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Calcul de la distance à vol d'oiseau (formule de Haversine simplifiée)
        const R = 6371; // Rayon de la Terre en km
        const dLat = (latitude - WAREHOUSE.lat) * Math.PI / 180;
        const dLon = (longitude - WAREHOUSE.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(WAREHOUSE.lat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const straightDistance = R * c;
        // Ajouter 30% pour la distance routière approximative
        const roadDistance = Math.round(straightDistance * 1.3);
        setDistance(roadDistance);
        setIsCalculating(false);
      },
      (error) => {
        setGeoError('Impossible d\'obtenir votre position');
        setIsCalculating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!startDate || !endDate) return null;

  return (
    <div className="space-y-5">
      {/* Choix du mode de livraison */}
      <div>
        <label className="block text-sm font-bold text-white/70 uppercase tracking-wider mb-3">
          Mode de récupération
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Click & Collect */}
          <button
            onClick={() => setDeliveryMode('pickup')}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
              deliveryMode === 'pickup'
                ? 'border-[#33ffcc] bg-[#33ffcc]/10'
                : 'border-white/20 bg-white/5 hover:border-white/40'
            }`}
          >
            {deliveryMode === 'pickup' && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-[#33ffcc] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-[#000033]" />
              </div>
            )}
            <Package className={`w-6 h-6 mb-2 ${deliveryMode === 'pickup' ? 'text-[#33ffcc]' : 'text-white/60'}`} />
            <div className={`font-bold text-sm ${deliveryMode === 'pickup' ? 'text-white' : 'text-white/80'}`}>
              Click & Collect
            </div>
            <div className="text-xs text-[#33ffcc] font-bold mt-1">GRATUIT</div>
          </button>

          {/* Livraison */}
          <button
            onClick={() => setDeliveryMode('delivery')}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
              deliveryMode === 'delivery'
                ? 'border-[#33ffcc] bg-[#33ffcc]/10'
                : 'border-white/20 bg-white/5 hover:border-white/40'
            }`}
          >
            {deliveryMode === 'delivery' && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-[#33ffcc] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-[#000033]" />
              </div>
            )}
            <Truck className={`w-6 h-6 mb-2 ${deliveryMode === 'delivery' ? 'text-[#33ffcc]' : 'text-white/60'}`} />
            <div className={`font-bold text-sm ${deliveryMode === 'delivery' ? 'text-white' : 'text-white/80'}`}>
              Livraison
            </div>
            <div className="text-xs text-white/50 mt-1">0.80€/km</div>
          </button>
        </div>
      </div>

      {/* Adresse Click & Collect */}
      {deliveryMode === 'pickup' && (
        <div className="p-4 bg-[#33ffcc]/10 rounded-xl border border-[#33ffcc]/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#33ffcc]/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#33ffcc]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#33ffcc] uppercase tracking-wider mb-1">
                Adresse de retrait
              </div>
              <div className="text-white font-medium">
                {WAREHOUSE.address}
              </div>
              <div className="text-xs text-white/50 mt-1">
                Retrait gratuit sur place
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire adresse livraison */}
      {deliveryMode === 'delivery' && (
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
                onClick={handleUseGeolocation}
                disabled={isCalculating}
                className="px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-50"
                title="Utiliser ma position"
              >
                <Navigation className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Adresse complète (optionnel) */}
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

          {/* Résultat distance */}
          {distance && !isCalculating && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#33ffcc]" />
                  <span className="text-white/70">Distance estimée</span>
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
      )}

      {/* Récapitulatif prix */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/70">
            Location ({durationDays} jour{durationDays > 1 ? 's' : ''})
            {quantity > 1 && ` × ${quantity}`}
          </span>
          <span className="text-white font-bold">{formatPrice(productPrice)}</span>
        </div>

        {deliveryMode === 'delivery' && distance && (
          <div className="flex items-center justify-between">
            <span className="text-white/70 flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              Livraison ({distance} km)
            </span>
            <span className="text-white font-bold">{formatPrice(deliveryFee)}</span>
          </div>
        )}

        {deliveryMode === 'pickup' && (
          <div className="flex items-center justify-between">
            <span className="text-white/70 flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              Click & Collect
            </span>
            <span className="text-[#33ffcc] font-bold">Gratuit</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-lg font-bold text-white">Total TTC</span>
          <span className="text-2xl font-black text-[#33ffcc]">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
