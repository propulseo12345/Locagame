import { useState } from 'react';
import DOMPurify from 'dompurify';
import { Users, Clock, Package, ShoppingCart, ChevronDown } from 'lucide-react';
import { formatPrice } from '../utils/pricing';
import { stripHtml } from '../utils/html';
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
  SimilarProducts,
} from '../components/product';
import { useProductPage } from '../hooks/useProductPage';

export default function ProductPage() {
  const [descExpanded, setDescExpanded] = useState(false);
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
    isCheckingAvailability,
    isAvailable,
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
        description={stripHtml(product.description) || `Louez ${product.name} pour vos événements en région PACA. Livraison rapide à Marseille, Aix, Nice et Toulon.`}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-14 pb-6 lg:pb-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12">
            {/* Left column - Gallery & Info */}
            <div className="md:col-span-1 lg:col-span-3 space-y-6 md:space-y-8">
              {/* Gallery: fullwidth on mobile (break out of px-4 padding) */}
              <div className="-mx-4 sm:mx-0">
                <ProductGallery
                  images={product.images}
                  productName={product.name}
                  category={category}
                  totalStock={product.total_stock}
                  shortDescription={stripHtml(product.description)}
                />
              </div>

              {/* Title and Description */}
              <div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight">
                  {product.name}
                </h1>

                {/* Mobile price banner (visible only on mobile, above the fold) */}
                <div className="flex items-center gap-3 mb-4 lg:hidden">
                  {product.pricing?.oneDay > 0 ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-[#33ffcc]">{formatPrice(product.pricing.oneDay)}</span>
                      <span className="text-base text-white/60">/jour</span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-amber-400">Sur devis</span>
                  )}
                </div>

                {/* Quick specs mobile */}
                <div className="flex flex-wrap items-center gap-2 mb-4 lg:hidden">
                  {product.specifications?.players?.min != null && product.specifications?.players?.max != null && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
                    <Users className="w-4 h-4 text-[#33ffcc]" />
                    <span className="text-sm text-white font-medium">
                      {product.specifications.players.min}-{product.specifications.players.max}
                    </span>
                  </div>
                  )}
                  {product.specifications?.setup_time != null && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
                    <Clock className="w-4 h-4 text-[#66cccc]" />
                    <span className="text-sm text-white font-medium">{product.specifications.setup_time}min</span>
                  </div>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
                    <Package className="w-4 h-4 text-[#33ffcc]" />
                    <span className="text-sm text-white font-medium">{product.total_stock} dispo</span>
                  </div>
                </div>

                {/* Description: collapsable on mobile, full on desktop */}
                <div className="hidden md:block text-lg text-white/70 leading-relaxed [&_strong]:font-bold [&_div]:mb-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
                <div className="md:hidden">
                  <div
                    className={`text-base text-white/70 leading-relaxed [&_strong]:font-bold [&_div]:mb-1 overflow-hidden transition-all duration-300 ${descExpanded ? '' : 'max-h-24'}`}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                  />
                  <button
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="flex items-center gap-1 mt-2 text-[#33ffcc] text-sm font-semibold"
                  >
                    {descExpanded ? 'Voir moins' : 'Voir plus'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${descExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              <ProductInfoTabs product={product} />

              <SimilarProducts categoryId={product.category_id} currentProductId={product.id} />
            </div>

            {/* Right column - Reservation Sticky */}
            <div className="md:col-span-1 lg:col-span-2">
              <div className="md:sticky md:top-[calc(var(--header-height)+1rem)] space-y-6">
                <ProductReservationCard
                  product={product}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  quantity={quantity}
                  priceCalculation={priceCalculation}
                  availabilityError={availabilityError}
                  isAddingToCart={isAddingToCart}
                  isCheckingAvailability={isCheckingAvailability}
                  isAvailable={isAvailable}
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
        <div className="fixed bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 lg:hidden bg-[#000033]/95 backdrop-blur-lg border-t border-white/10 px-4 py-3">
          {product.pricing?.oneDay > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[#33ffcc] font-black text-2xl">{formatPrice(product.pricing.oneDay)}</span>
                <span className="text-white/60 text-sm">/jour</span>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || isCheckingAvailability || isAvailable === false || !selectedStartDate || !selectedEndDate}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-xl disabled:opacity-50 transition-colors min-h-[48px] ${
                  isAvailable === false
                    ? 'bg-[#fe1979]/20 text-[#fe1979] cursor-not-allowed'
                    : 'bg-[#33ffcc] text-[#000033] hover:bg-[#66cccc]'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isAddingToCart ? 'Ajout...' : isCheckingAvailability ? 'Vérification...' : isAvailable === false ? 'Indisponible' : 'Réserver'}
              </button>
            </div>
          ) : (
            <a href="/contact" className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-colors min-h-[48px]">
              Sur devis — Demander un devis
            </a>
          )}
        </div>
      </div>
    </>
  );
}
