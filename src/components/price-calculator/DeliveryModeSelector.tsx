import { Package, Truck, Check } from 'lucide-react';

interface DeliveryModeSelectorProps {
  deliveryMode: 'pickup' | 'delivery';
  setDeliveryMode: (mode: 'pickup' | 'delivery') => void;
}

export function DeliveryModeSelector({ deliveryMode, setDeliveryMode }: DeliveryModeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-white/70 uppercase tracking-wider mb-3">
        Mode de recuperation
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
  );
}
