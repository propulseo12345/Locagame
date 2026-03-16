import DOMPurify from 'dompurify';
import { Users, Clock, Package, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../utils/pricing';
import { SEO } from '../components/SEO';
import { ProductSchema } from '../components/ProductSchema';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';
import {
  ProductGallery,
  ProductInfoTabs,
  ProductStickyHeader,
  ProductReservationCard,
  ProductQuickSpecs,
  ProductLoading,
  ProductNotFound,
} from '../components/product';
import { useProductPage } from '../hooks/useProductPage';

export default function ProductPage() {
  const {
    product,
    category,
    loading,
    isLiked,
    handleLike,
    handleShare,
    selectedStartDate,
    selectedEndDate,
    handleDateSelect,
    handleClearSelection,
    getSelectedDays,
    priceCalculation,
    handlePriceChange,
    isAddingToCart,
    handleAddToCart,
    availabilityError,
    quantity,
  } = useProductPage();

  if (loading) return <ProductLoading />;
  if (!product) return <ProductNotFound />;

  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://www.locagame.net' },
    { name: 'Catalogue', url: 'https://www.locagame.net/catalogue' },
    { name: product.name, url: `https://www.locagame.net/produit/${product.id}` },
  ];

  return (
    <>
      <SEO
        title={`Location ${product.name} à Marseille`}
        description={product.description || `Louez ${product.name} pour vos événements en région PACA. Livraison rapide à Marseille, Aix, Nice et Toulon.`}
        url={`https://www.locagame.net/produit/${product.id}`}
        canonical={`https://www.locagame.net/produit/${product.id}`}
        type="product"
        keywords={`location ${product.name}, ${product.category?.name || 'jeux'} événement, location jeux PACA, animation Marseille`}
      />
      <ProductSchema product={product} url={`https://www.locagame.net/produit/${product.id}`} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header">
        <ProductStickyHeader
          productName={product.name}
          isLiked={isLiked}
          onShare={handleShare}
          onLike={handleLike}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14 pb-6 lg:pb-10">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left column - Gallery & Info (3/5) */}
            <div className="lg:col-span-3 space-y-8">
              <ProductGallery
                images={product.images}
                productName={product.name}
                category={category}
                totalStock={product.total_stock}
                shortDescription={product.description}
              />

              {/* Title and Description */}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Quick specs mobile */}
                <div className="flex flex-wrap items-center gap-3 mb-6 lg:hidden">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
                    <Users className="w-4 h-4 text-[#33ffcc]" />
                    <span className="text-sm text-white font-medium">
                      {product.specifications.players.min}-{product.specifications.players.max}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
                    <Clock className="w-4 h-4 text-[#66cccc]" />
                    <span className="text-sm text-white font-medium">{product.specifications.setup_time}min</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
                    <Package className="w-4 h-4 text-[#33ffcc]" />
                    <span className="text-sm text-white font-medium">{product.total_stock} dispo</span>
                  </div>
                </div>

                <div className="text-lg text-white/70 leading-relaxed [&_strong]:font-bold [&_div]:mb-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
              </div>

              <ProductInfoTabs product={product} />
            </div>

            {/* Right column - Reservation Sticky (2/5) */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-32 space-y-6">
                <ProductReservationCard
                  product={product}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  quantity={quantity}
                  priceCalculation={priceCalculation}
                  availabilityError={availabilityError}
                  isAddingToCart={isAddingToCart}
                  onDateSelect={handleDateSelect}
                  onClearSelection={handleClearSelection}
                  onPriceChange={handlePriceChange}
                  onAddToCart={handleAddToCart}
                  getSelectedDays={getSelectedDays}
                />

                <ProductQuickSpecs product={product} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA */}
        <div className="fixed bottom-[var(--bottom-nav-height)] left-0 right-0 z-40 lg:hidden bg-[#000033]/95 backdrop-blur-lg border-t border-white/10 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[#33ffcc] font-bold text-lg">{formatPrice(product.pricing.oneDay)}</span>
              <span className="text-white/60 text-sm">/jour</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !selectedStartDate || !selectedEndDate}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {isAddingToCart ? 'Ajout...' : 'Réserver'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
