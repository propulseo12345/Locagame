import { Link } from 'react-router-dom';
import { Calendar, Minus, Plus, Truck, Package, Gamepad2, X } from 'lucide-react';
import { formatPrice } from '../../utils/pricing';

interface CartItemData {
  product: {
    id: string;
    name: string;
    images: string[];
    total_stock: number;
  };
  start_date: string;
  end_date: string;
  quantity: number;
  total_price: number;
  product_price?: number;
  delivery_fee: number;
  delivery_mode?: string;
  delivery_distance?: number;
  delivery_postal_code?: string;
}

interface CartItemCardProps {
  item: CartItemData;
  isRemoving: boolean;
  onRemove: (productId: string, startDate: string) => void;
  onUpdateQuantity: (productId: string, startDate: string, currentQuantity: number, newQuantity: number) => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

function calculateDuration(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export default function CartItemCard({ item, isRemoving, onRemove, onUpdateQuantity }: CartItemCardProps) {
  const duration = calculateDuration(item.start_date, item.end_date);

  return (
    <div
      className={`group bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 p-4 md:p-6 transition-all duration-300 ${
        isRemoving ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'
      }`}
    >
      <div className="flex gap-4 md:gap-6">
        {/* Image du produit */}
        <Link
          to={`/produit/${item.product.id}`}
          className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-white/5"
        >
          {item.product.images[0] ? (
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gamepad2 className="w-10 h-10 text-white/20" />
            </div>
          )}
          {/* Badge durée */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md text-xs text-white font-medium">
            {duration} jour{duration > 1 ? 's' : ''}
          </div>
        </Link>

        {/* Informations du produit */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4 mb-3">
            <Link
              to={`/produit/${item.product.id}`}
              className="text-lg md:text-xl font-semibold text-white hover:text-[#33ffcc] transition-colors truncate"
            >
              {item.product.name}
            </Link>
            <button
              onClick={() => onRemove(item.product.id, item.start_date)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
              aria-label="Supprimer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dates de location */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/60 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#33ffcc]" />
              <span>
                {formatDate(item.start_date)} → {formatDate(item.end_date)}
              </span>
            </div>
            {item.delivery_mode === 'pickup' ? (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#33ffcc]" />
                <span>Click & Collect</span>
              </div>
            ) : item.delivery_mode === 'delivery' && (
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#33ffcc]" />
                <span>
                  Livraison {item.delivery_distance ? `(${item.delivery_distance} km)` : ''}
                  {item.delivery_postal_code && ` - ${item.delivery_postal_code}`}
                </span>
              </div>
            )}
          </div>

          {/* Quantité et prix */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                <button
                  onClick={() => onUpdateQuantity(item.product.id, item.start_date, item.quantity, item.quantity - 1)}
                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-l-lg transition-colors"
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-white font-semibold">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.product.id, item.start_date, item.quantity, item.quantity + 1)}
                  disabled={item.quantity >= item.product.total_stock}
                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-r-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-white/40 hidden sm:inline">
                {item.product.total_stock} disponible{item.product.total_stock > 1 ? 's' : ''}
              </span>
            </div>

            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold text-white">
                {formatPrice(item.total_price)}
              </div>
              <div className="text-xs text-white/40 space-y-0.5">
                <div>Location: {formatPrice(item.product_price || item.total_price - (item.delivery_fee || 0))}</div>
                {item.delivery_fee > 0 && (
                  <div>Livraison: {formatPrice(item.delivery_fee)}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
