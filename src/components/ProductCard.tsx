import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Zap } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/pricing';
import { stripHtml } from '../utils/html';
import { useFavorites } from '../contexts/FavoritesContext';
import { ProductCardImage } from './product-card/ProductCardImage';
import { ProductCardActions } from './product-card/ProductCardActions';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

function ProductCard({ product, viewMode }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isLiked = isFavorite(product.id);

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setIsAddingToCart(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsAddingToCart(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const handleImageError = () => { setImageError(true); setImageLoaded(true); };

  const specs = product.specifications;

  if (viewMode === 'list') {
    return (
      <Link
        to={`/produit/${product.id}`}
        className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-[#33ffcc]/50 hover:shadow-2xl hover:shadow-[#33ffcc]/10 transition-all duration-500 block"
      >
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <ProductCardImage
            product={product} imageLoaded={imageLoaded} imageError={imageError}
            isLiked={isLiked} onImageLoad={() => setImageLoaded(true)}
            onImageError={handleImageError} onLike={handleLike} variant="list"
          />
          <div className="flex-1 flex flex-col">
            <h3 className="text-2xl font-black text-white mb-3 group-hover:text-[#33ffcc] transition-colors duration-300">
              {product.name}
            </h3>
            <p className="text-gray-300 text-base mb-4 line-clamp-2 leading-relaxed">{stripHtml(product.description)}</p>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
                <Users className="w-4 h-4 text-[#33ffcc]" />
                <span className="text-sm text-gray-300">{specs.players.min}-{specs.players.max} joueurs</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
                <Clock className="w-4 h-4 text-[#66cccc]" />
                <span className="text-sm text-gray-300">{specs.setup_time}min</span>
              </div>
              {specs.electricity && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fe1979]/20 rounded-lg border border-[#fe1979]/30">
                  <Zap className="w-4 h-4 text-[#fe1979]" />
                  <span className="text-sm text-[#fe1979] font-semibold">Electrique</span>
                </div>
              )}
            </div>
            <ProductCardActions
              isAddingToCart={isAddingToCart} addedToCart={addedToCart}
              onAddToCart={handleAddToCart} productName={product.name} variant="list"
            />
          </div>
        </div>
      </Link>
    );
  }

  // Vue Grid (par defaut)
  return (
    <Link
      to={`/produit/${product.id}`}
      className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-[#33ffcc]/50 hover:shadow-2xl hover:shadow-[#33ffcc]/20 transition-all duration-500 hover:scale-[1.03] h-full flex flex-col focus-within:ring-2 focus-within:ring-[#33ffcc] block"
      aria-label={`${product.name} - ${formatPrice(product.pricing.oneDay)} par jour`}
    >
      <ProductCardImage
        product={product} imageLoaded={imageLoaded} imageError={imageError}
        isLiked={isLiked} onImageLoad={() => setImageLoaded(true)}
        onImageError={handleImageError} onLike={handleLike} variant="grid"
      />
      <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-white/5 to-transparent">
        <h3 className="text-lg font-black text-white mb-2 line-clamp-2 leading-tight group-hover:text-[#33ffcc] transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1" title={stripHtml(product.description)}>
          {stripHtml(product.description)}
        </p>
        <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#33ffcc]" />
            <span className="text-xs text-gray-300 font-medium">{specs.players.min}-{specs.players.max}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#66cccc]" />
            <span className="text-xs text-gray-300 font-medium">{specs.setup_time}min</span>
          </div>
          {specs.electricity && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#fe1979]/20 rounded-md">
              <Zap className="w-3.5 h-3.5 text-[#fe1979]" />
            </div>
          )}
        </div>
        <ProductCardActions
          isAddingToCart={isAddingToCart} addedToCart={addedToCart}
          onAddToCart={handleAddToCart} productName={product.name} variant="grid"
        />
      </div>
    </Link>
  );
}

export default memo(ProductCard);
