import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Zap, ShoppingCart, Heart, ArrowRight, Star } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/pricing';
import { useAuth } from '../contexts/AuthContext';
import { FavoritesService } from '../services';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

function ProductCard({ product, viewMode }: ProductCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false);

  // Charger l'état initial des favoris depuis Supabase
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !user || user.role !== 'client') {
        setIsLiked(false);
        return;
      }

      try {
        setIsCheckingFavorite(true);
        const isFavorite = await FavoritesService.isFavorite(user.id, product.id);
        setIsLiked(isFavorite);
      } catch {
        setIsLiked(false);
      } finally {
        setIsCheckingFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [isAuthenticated, user, product.id]);

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsAddingToCart(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsAddingToCart(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Si l'utilisateur n'est pas connecté ou n'est pas un client, ne rien faire
    if (!isAuthenticated || !user || user.role !== 'client') {
      return;
    }

    try {
      // Toggle le favori dans Supabase
      const newFavoriteState = await FavoritesService.toggleFavorite(user.id, product.id);
      setIsLiked(newFavoriteState);
      
      // Feedback haptique sur mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch {
      // En cas d'erreur, on ne change pas l'état local
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  if (viewMode === 'list') {
    return (
      <Link
        to={`/produit/${product.id}`}
        className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-[#33ffcc]/50 hover:shadow-2xl hover:shadow-[#33ffcc]/10 transition-all duration-500 block"
      >
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Image */}
          <div className="relative w-full md:w-64 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-[#000033] to-[#001144]">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#33ffcc]/20 to-[#66cccc]/20 animate-pulse"></div>
            )}
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#000033] to-[#001144]">
                <div className="text-center p-4">
                  <Star className="w-12 h-12 text-[#33ffcc]/50 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">{product.name}</p>
                </div>
              </div>
            ) : (
              <img
                src={product.images[0] || '/placeholder-product.jpg'}
                alt={`${product.name} - Location de jeu pour ${product.specifications.players.min}-${product.specifications.players.max} joueurs`}
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            )}

            {/* Badge Prix */}
            <div className="absolute top-3 left-3">
              <div className="px-4 py-2 bg-[#33ffcc] text-[#000033] rounded-full shadow-lg">
                <span className="friendly-badge text-2xl">{formatPrice(product.pricing.oneDay)}</span>
                <span className="text-sm font-semibold">/jour</span>
              </div>
            </div>

            {/* Heart */}
            <button
              onClick={handleLike}
              className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
                isLiked
                  ? 'bg-[#fe1979] text-white scale-110'
                  : 'bg-white/20 text-white hover:bg-white/30 hover:scale-110'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Contenu */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-2xl font-black text-white mb-3 group-hover:text-[#33ffcc] transition-colors duration-300">
              {product.name}
            </h3>

            <p className="text-gray-300 text-base mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Spécifications */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
                <Users className="w-4 h-4 text-[#33ffcc]" />
                <span className="text-sm text-gray-300">{product.specifications.players.min}-{product.specifications.players.max} joueurs</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
                <Clock className="w-4 h-4 text-[#66cccc]" />
                <span className="text-sm text-gray-300">{product.specifications.setup_time}min</span>
              </div>
              {product.specifications.electricity && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fe1979]/20 rounded-lg border border-[#fe1979]/30">
                  <Zap className="w-4 h-4 text-[#fe1979]" />
                  <span className="text-sm text-[#fe1979] font-semibold">Électrique</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || addedToCart}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 font-bold ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-[#33ffcc] text-[#000033] hover:bg-[#66cccc]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={addedToCart ? 'Produit ajouté au panier' : 'Ajouter au panier'}
              >
                <ShoppingCart className="w-5 h-5" />
                {isAddingToCart ? 'Ajout...' : addedToCart ? 'Ajouté !' : 'Ajouter au panier'}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex items-center gap-2 px-6 py-3 border-2 border-white/20 text-white rounded-xl hover:border-[#33ffcc] hover:bg-white/10 transition-all duration-300 font-semibold group/link"
                aria-label={`Voir les détails de ${product.name}`}
              >
                Détails
                <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Vue Grid (par défaut)
  return (
    <Link
      to={`/produit/${product.id}`}
      className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-[#33ffcc]/50 hover:shadow-2xl hover:shadow-[#33ffcc]/20 transition-all duration-500 hover:scale-[1.03] h-full flex flex-col focus-within:ring-2 focus-within:ring-[#33ffcc] block"
      aria-label={`${product.name} - ${formatPrice(product.pricing.oneDay)} par jour`}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#000033] to-[#001144]">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#33ffcc]/20 to-[#66cccc]/20 animate-pulse"></div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <Star className="w-12 h-12 text-[#33ffcc]/50 mx-auto mb-2" />
              <p className="text-gray-400 text-sm line-clamp-2">{product.name}</p>
            </div>
          </div>
        ) : (
          <img
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={`${product.name} - Location de jeu pour ${product.specifications.players.min}-${product.specifications.players.max} joueurs en région PACA. ${product.shortDescription ? product.shortDescription.substring(0, 100) : 'Disponible à la location avec livraison et installation.'}`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            loading="lazy"
            width="400"
            height="300"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000033]/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

        {/* Badge Prix */}
        <div className="absolute top-3 left-3 z-10">
          <div className="px-4 py-2 bg-[#33ffcc]/95 backdrop-blur-sm text-[#000033] rounded-full shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300">
            <span className="friendly-badge text-2xl">{formatPrice(product.pricing.oneDay)}</span>
            <span className="text-sm font-bold">/j</span>
          </div>
        </div>

        {/* Heart button */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            isLiked
              ? 'bg-[#fe1979] text-white scale-110'
              : 'bg-white/20 text-white hover:bg-white/30 hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Badge populaire si disponible */}
        {product.total_stock < 5 && (
          <div className="absolute bottom-3 left-3 z-10">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fe1979]/90 backdrop-blur-sm text-white rounded-full shadow-lg animate-pulse">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold">Très demandé</span>
            </div>
          </div>
        )}

        {/* Effet de brillance au hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-white/5 to-transparent">
        <h3 className="text-lg font-black text-white mb-2 line-clamp-2 leading-tight group-hover:text-[#33ffcc] transition-colors duration-300">
          {product.name}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1" title={product.description}>
          {product.description}
        </p>

        {/* Spécifications compactes */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#33ffcc]" />
            <span className="text-xs text-gray-300 font-medium">
              {product.specifications.players.min}-{product.specifications.players.max}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#66cccc]" />
            <span className="text-xs text-gray-300 font-medium">
              {product.specifications.setup_time}min
            </span>
          </div>
          {product.specifications.electricity && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#fe1979]/20 rounded-md">
              <Zap className="w-3.5 h-3.5 text-[#fe1979]" />
            </div>
          )}
        </div>

        {/* Actions footer */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || addedToCart}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 font-bold text-sm ${
              addedToCart
                ? 'bg-green-500 text-white'
                : 'bg-[#33ffcc] text-[#000033] hover:bg-[#66cccc]'
            } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33ffcc]`}
            aria-label={addedToCart ? 'Produit ajouté au panier' : 'Ajouter au panier'}
          >
            <ShoppingCart className="w-4 h-4" />
            {isAddingToCart ? 'Ajout...' : addedToCart ? 'Ajouté!' : 'Ajouter'}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 border-2 border-white/20 text-white rounded-xl hover:border-[#33ffcc] hover:bg-white/10 transition-all duration-300 font-semibold text-sm group/link focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
            aria-label={`Voir les détails de ${product.name}`}
          >
            Voir
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCard);
