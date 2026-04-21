import { Link } from 'react-router-dom';
import { Heart, Users, Clock, ArrowRight } from 'lucide-react';
import { Product } from '../../../types';
import { stripHtml } from '../../../utils/html';

interface FavoritesGridProps {
  products: Product[];
  onRemoveFavorite: (productId: string) => void;
}

export default function FavoritesGrid({ products, onRemoveFavorite }: FavoritesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="group bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.12] transition-all duration-200"
        >
          {/* Image */}
          <div className="relative aspect-[4/3] bg-white/[0.02] overflow-hidden">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl opacity-50">🎮</span>
              </div>
            )}

            {/* Remove button */}
            <button
              onClick={(e) => { e.preventDefault(); onRemoveFavorite(product.id); }}
              className="absolute top-2.5 right-2.5 p-2 bg-[#fe1979] text-white rounded-lg hover:bg-[#ff3399] transition-colors shadow-lg"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>

            {/* Price */}
            <div className="absolute bottom-2.5 left-2.5">
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white rounded-lg text-sm font-bold">
                {product.pricing?.oneDay || 0}€<span className="text-xs font-normal text-gray-300">/jour</span>
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3.5">
            <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1 group-hover:text-[#33ffcc] transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
              {stripHtml(product.description)}
            </p>

            {/* Specs */}
            <div className="flex items-center gap-3 mb-3">
              {product.specifications?.players?.min != null && product.specifications?.players?.max != null && (
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Users className="w-3 h-3" />
                  {product.specifications.players.min}-{product.specifications.players.max}
                </span>
              )}
              {product.specifications?.setup_time != null && (
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Clock className="w-3 h-3" />
                  {product.specifications.setup_time}min
                </span>
              )}
            </div>

            {/* Action */}
            <Link
              to={`/produit/${product.id}`}
              className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-white/[0.06] text-sm text-white font-medium rounded-lg border border-white/[0.06] hover:bg-white/[0.1] hover:border-white/[0.12] transition-colors"
            >
              Voir détails <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
