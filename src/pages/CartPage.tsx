import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Tag,
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  Package,
  ChevronRight,
  Gamepad2,
  X
} from 'lucide-react';
import { formatPrice } from '../utils/pricing';
import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const { items: cartItems, removeItem, updateQuantity, totalPrice } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState('');
  const [promoCodeSuccess, setPromoCodeSuccess] = useState('');
  const [discount, setDiscount] = useState(0);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const handleUpdateQuantity = (productId: string, startDate: string, currentQuantity: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId, startDate);
      return;
    }

    const item = cartItems.find(i => i.product.id === productId && i.start_date === startDate);
    if (item && newQuantity > item.product.total_stock) {
      return;
    }

    updateQuantity(productId, newQuantity, startDate);
  };

  const handleRemoveItem = (productId: string, startDate: string) => {
    setRemovingItem(`${productId}-${startDate}`);
    setTimeout(() => {
      removeItem(productId, startDate);
      setRemovingItem(null);
    }, 300);
  };

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

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateProductsTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product_price || item.total_price - (item.delivery_fee || 0)), 0);
  };

  const calculateDeliveryFee = () => {
    return cartItems.reduce((sum, item) => sum + (item.delivery_fee || 0), 0);
  };

  const calculateTotal = () => {
    return totalPrice - discount;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // État vide
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#000033] pt-header">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#33ffcc]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#66cccc]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            {/* Icône animée */}
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-[#33ffcc]/10 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-[#33ffcc]/5 rounded-full"></div>
              <ShoppingCart className="w-16 h-16 text-white/30" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Votre panier est vide
            </h1>
            <p className="text-lg text-white/60 mb-10 max-w-md mx-auto">
              Découvrez notre sélection de jeux et activités pour animer votre prochain événement
            </p>

            {/* CTA principal */}
            <Link
              to="/catalogue"
              className="group inline-flex items-center gap-3 bg-[#33ffcc] text-[#000033] font-bold text-lg px-8 py-4 rounded-xl hover:shadow-[0_0_30px_rgba(51,255,204,0.4)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              Explorer le catalogue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Suggestions rapides */}
            <div className="mt-16 pt-12 border-t border-white/10">
              <p className="text-sm text-white/40 mb-6">Catégories populaires</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Casino & Poker', 'Jeux de Bar', 'Bornes Arcade', 'Jeux en Bois'].map((cat) => (
                  <Link
                    key={cat}
                    to={`/catalogue?category=${cat.toLowerCase().replace(/ /g, '-')}`}
                    className="group px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#33ffcc]/30 rounded-full text-white/70 hover:text-white text-sm transition-all duration-200"
                  >
                    {cat}
                    <ChevronRight className="inline-block w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000033] pt-header">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#33ffcc]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#66cccc]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <Link
              to="/catalogue"
              className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Catalogue
            </Link>
            <div className="w-px h-4 bg-white/20"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Mon panier</h1>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Package className="w-5 h-5" />
            <span>{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Liste des articles */}
          <div className="xl:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const itemKey = `${item.product.id}-${item.start_date}`;
              const isRemoving = removingItem === itemKey;
              const duration = calculateDuration(item.start_date, item.end_date);

              return (
                <div
                  key={itemKey}
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
                          onClick={() => handleRemoveItem(item.product.id, item.start_date)}
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
                              onClick={() => handleUpdateQuantity(item.product.id, item.start_date, item.quantity, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-l-lg transition-colors"
                              aria-label="Diminuer la quantité"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-white font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, item.start_date, item.quantity, item.quantity + 1)}
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
            })}

            {/* Lien retour catalogue */}
            <Link
              to="/catalogue"
              className="group flex items-center justify-center gap-2 py-4 text-white/60 hover:text-[#33ffcc] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ajouter d'autres articles
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </div>

          {/* Récapitulatif */}
          <div className="xl:col-span-1">
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
                    <span className="text-white">{formatPrice(calculateProductsTotal())}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Livraison
                    </span>
                    <span className="text-white">
                      {calculateDeliveryFee() > 0 ? formatPrice(calculateDeliveryFee()) : (
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
          </div>
        </div>
      </div>
    </div>
  );
}
