import { Link } from 'react-router-dom';
import { Heart, Star, Users, Clock, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../../../types';

interface FavoritesGridProps {
  products: Product[];
  onRemoveFavorite: (productId: string) => void;
}

export default function FavoritesGrid({ products, onRemoveFavorite }: FavoritesGridProps) {
  return (
    <>
      {/* Stats Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#33ffcc]" />
          <span className="text-white font-medium">
            Vous avez <span className="font-black text-[#fe1979]">{products.length} produit(s)</span> en favoris
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-[#fe1979]/50 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] shadow-xl flex flex-col"
          >
            {/* Image */}
            <div className="relative aspect-video bg-gradient-to-br from-[#33ffcc]/20 to-[#66cccc]/20 overflow-hidden">
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">🎮</span>
                </div>
              )}

              {/* Heart button */}
              <button
                onClick={() => onRemoveFavorite(product.id)}
                className="absolute top-3 right-3 p-2.5 bg-[#fe1979] text-white rounded-full hover:bg-[#ff3399] transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>

              {/* Price badge */}
              <div className="absolute bottom-3 left-3">
                <div className="px-4 py-2 bg-[#33ffcc]/95 backdrop-blur-sm text-[#000033] rounded-full shadow-lg border border-white/20">
                  <span className="text-2xl font-black">
                    {product.pricing?.oneDay || product.pricing?.one_day || 0}€
                  </span>
                  <span className="text-sm font-bold">/jour</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-black text-white group-hover:text-[#33ffcc] transition-colors line-clamp-2 flex-1">
                  {product.name}
                </h3>
              </div>

              <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                {product.shortDescription}
              </p>

              {/* Specs */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#33ffcc]" />
                  <span className="text-xs text-gray-300 font-medium">
                    {product.specifications?.players?.min || 2}-{product.specifications?.players?.max || 10}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#66cccc]" />
                  <span className="text-xs text-gray-300 font-medium">
                    {product.specifications?.setup_time || 30}min
                  </span>
                </div>
                {(product.rating || product.totalReservations) && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    {product.rating && (
                      <>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-white font-bold">{product.rating}</span>
                      </>
                    )}
                    {product.totalReservations && (
                      <span className="text-xs text-gray-500">({product.totalReservations})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 text-xs bg-white/10 text-[#33ffcc] rounded-full border border-white/20 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/produit/${product.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105 text-sm"
                >
                  Voir détails
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="px-4 py-2.5 border-2 border-white/20 text-white rounded-xl hover:border-[#33ffcc] hover:bg-white/10 transition-all duration-300 font-bold text-sm">
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
