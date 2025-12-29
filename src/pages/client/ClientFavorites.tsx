import { Link } from 'react-router-dom';
import { Heart, Star, Users, Clock, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { FavoritesService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';

export default function ClientFavorites() {
  const { user } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const favorites = await FavoritesService.getFavorites(user.id);
      setFavoriteProducts(favorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Recharger les favoris quand la page redevient visible (retour depuis le catalogue)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadFavorites();
      }
    };

    const handleFocus = () => {
      if (user) {
        loadFavorites();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, loadFavorites]);

  const handleRemoveFavorite = async (productId: string) => {
    if (!user) return;

    try {
      await FavoritesService.removeFavorite(user.id, productId);
      setFavoriteProducts(favoriteProducts.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#fe1979] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-white/60">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 mt-6 md:mt-8">
      {/* Header moderne */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#fe1979]/20 via-[#fe1979]/10 to-transparent backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fe1979]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#fe1979]/20 rounded-xl">
              <Heart className="w-8 h-8 text-[#fe1979] fill-[#fe1979]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Mes favoris
            </h1>
          </div>
          <p className="text-base text-gray-300">
            Vos produits préférés • {favoriteProducts.length} produit(s)
          </p>
        </div>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center shadow-xl">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-[#fe1979]/20 rounded-full mb-6">
            <Heart className="w-12 h-12 text-[#fe1979]" />
          </div>
          <h3 className="text-xl font-black text-white mb-3">Aucun favori</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Ajoutez des produits à vos favoris pour les retrouver facilement
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#33ffcc]" />
              <span className="text-white font-medium">
                Vous avez <span className="font-black text-[#fe1979]">{favoriteProducts.length} produit(s)</span> en favoris
              </span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProducts.map((product) => (
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
                    onClick={() => handleRemoveFavorite(product.id)}
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
      )}
    </div>
  );
}
