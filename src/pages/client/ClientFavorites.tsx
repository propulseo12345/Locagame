import { useEffect, useState, useCallback } from 'react';
import { FavoritesService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';
import { FavoritesHeader, FavoritesEmptyState, FavoritesGrid } from '../../components/client/favorites';

export default function ClientFavorites() {
  const { user } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    setError(null);

    try {
      setLoading(true);
      const favorites = await FavoritesService.getFavorites(user.id);
      setFavoriteProducts(favorites);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Impossible de charger vos favoris.');
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
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
          <p className="text-red-300">{error}</p>
          <button onClick={loadFavorites} className="px-4 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium">Réessayer</button>
        </div>
      )}

      <FavoritesHeader count={favoriteProducts.length} />

      {favoriteProducts.length === 0 ? (
        <FavoritesEmptyState />
      ) : (
        <FavoritesGrid products={favoriteProducts} onRemoveFavorite={handleRemoveFavorite} />
      )}
    </div>
  );
}
