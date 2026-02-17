import { Heart, Star } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/pricing';

interface ProductCardImageProps {
  product: Product;
  imageLoaded: boolean;
  imageError: boolean;
  isLiked: boolean;
  onImageLoad: () => void;
  onImageError: () => void;
  onLike: (e: React.MouseEvent) => void;
  variant: 'grid' | 'list';
}

export function ProductCardImage({
  product, imageLoaded, imageError, isLiked,
  onImageLoad, onImageError, onLike, variant,
}: ProductCardImageProps) {
  const isGrid = variant === 'grid';

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#000033] to-[#001144] ${
      isGrid ? 'h-56' : 'w-full md:w-64 h-48 flex-shrink-0 rounded-xl'
    }`}>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#33ffcc]/20 to-[#66cccc]/20 animate-pulse"></div>
      )}
      {imageError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#000033] to-[#001144]">
          <div className="text-center p-4">
            <Star className="w-12 h-12 text-[#33ffcc]/50 mx-auto mb-2" />
            <p className="text-gray-400 text-sm line-clamp-2">{product.name}</p>
          </div>
        </div>
      ) : (
        <img
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={isGrid
            ? `${product.name} - Location de jeu pour ${product.specifications.players.min}-${product.specifications.players.max} joueurs en region PACA. ${product.shortDescription ? product.shortDescription.substring(0, 100) : 'Disponible a la location avec livraison et installation.'}`
            : `${product.name} - Location de jeu pour ${product.specifications.players.min}-${product.specifications.players.max} joueurs`
          }
          onLoad={onImageLoad}
          onError={onImageError}
          loading="lazy"
          {...(isGrid ? { width: "400", height: "300" } : {})}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      )}

      {/* Overlay gradient (grid only) */}
      {isGrid && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#000033]/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
      )}

      {/* Badge Prix */}
      <div className={`absolute top-3 left-3 ${isGrid ? 'z-10' : ''}`}>
        <div className={`px-4 py-2 text-[#000033] rounded-full shadow-lg ${
          isGrid ? 'bg-[#33ffcc]/95 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300' : 'bg-[#33ffcc]'
        }`}>
          <span className="friendly-badge text-2xl">{formatPrice(product.pricing.oneDay)}</span>
          <span className={`font-${isGrid ? 'bold' : 'semibold'} text-sm`}>/j{!isGrid && 'our'}</span>
        </div>
      </div>

      {/* Heart button */}
      <button
        onClick={onLike}
        className={`absolute top-3 right-3 ${isGrid ? 'z-10' : ''} p-2${isGrid ? '' : '.5'} rounded-full backdrop-blur-md transition-all duration-300 ${
          isLiked ? 'bg-[#fe1979] text-white scale-110' : 'bg-white/20 text-white hover:bg-white/30 hover:scale-110'
        }`}
      >
        <Heart className={`w-${isGrid ? '4' : '5'} h-${isGrid ? '4' : '5'} ${isLiked ? 'fill-current' : ''}`} />
      </button>

      {/* Badge populaire (grid only) */}
      {isGrid && product.total_stock < 5 && (
        <div className="absolute bottom-3 left-3 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fe1979]/90 backdrop-blur-sm text-white rounded-full shadow-lg animate-pulse">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-bold">Tres demande</span>
          </div>
        </div>
      )}

      {/* Effet de brillance au hover (grid only) */}
      {isGrid && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      )}
    </div>
  );
}
