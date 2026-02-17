import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import EmptyCart from '../components/cart/EmptyCart';
import CartItemCard from '../components/cart/CartItemCard';
import CartSummary from '../components/cart/CartSummary';

export default function CartPage() {
  const { items: cartItems, removeItem, updateQuantity, totalPrice } = useCart();
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

  const calculateProductsTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product_price || item.total_price - (item.delivery_fee || 0)), 0);
  };

  const calculateDeliveryFee = () => {
    return cartItems.reduce((sum, item) => sum + (item.delivery_fee || 0), 0);
  };

  // État vide
  if (cartItems.length === 0) {
    return <EmptyCart />;
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
              return (
                <CartItemCard
                  key={itemKey}
                  item={item}
                  isRemoving={removingItem === itemKey}
                  onRemove={handleRemoveItem}
                  onUpdateQuantity={handleUpdateQuantity}
                />
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
            <CartSummary
              productsTotal={calculateProductsTotal()}
              deliveryFee={calculateDeliveryFee()}
              totalPrice={totalPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
