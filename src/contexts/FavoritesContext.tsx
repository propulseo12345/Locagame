import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { FavoritesService } from '../services';
import { AuthModal } from '../components/auth/AuthModal';

const PENDING_FAVORITE_KEY = 'locagame_pending_favorite';

interface FavoritesContextType {
  favoriteIds: Set<string>;
  loading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const isTogglingRef = useRef(false);

  // Load favorites when user changes
  const loadFavorites = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const favorites = await FavoritesService.getFavorites(userId);
      setFavoriteIds(new Set(favorites.map(f => f.id)));
    } catch (error) {
      console.error('[Favorites] Error loading:', error);
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle pending favorite after auth
  const processPendingFavorite = useCallback(async (userId: string) => {
    // Check in-memory pending
    let productId = pendingProductId;

    // Also check localStorage (for post-email-confirmation flow)
    if (!productId) {
      productId = localStorage.getItem(PENDING_FAVORITE_KEY);
    }

    if (!productId) return;

    try {
      await FavoritesService.addFavorite(userId, productId);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.add(productId!);
        return next;
      });
    } catch {
      // Unique constraint error is already handled in FavoritesService
    } finally {
      setPendingProductId(null);
      localStorage.removeItem(PENDING_FAVORITE_KEY);
    }
  }, [pendingProductId]);

  // React to user changes (login/logout)
  useEffect(() => {
    if (user && user.role === 'client') {
      loadFavorites(user.id).then(() => {
        processPendingFavorite(user.id);
      });
    } else {
      setFavoriteIds(new Set());
    }
  }, [user, loadFavorites, processPendingFavorite]);

  const isFavorite = useCallback((productId: string): boolean => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback((productId: string) => {
    // Not authenticated → open auth modal
    if (!isAuthenticated || !user || user.role !== 'client') {
      setPendingProductId(productId);
      localStorage.setItem(PENDING_FAVORITE_KEY, productId);
      setAuthModalOpen(true);
      return;
    }

    // Prevent double-click
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;

    const wasLiked = favoriteIds.has(productId);

    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (wasLiked) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    // Haptic feedback
    if ('vibrate' in navigator) navigator.vibrate(50);

    // DB call
    const dbCall = wasLiked
      ? FavoritesService.removeFavorite(user.id, productId)
      : FavoritesService.addFavorite(user.id, productId);

    dbCall
      .catch(() => {
        // Rollback on error
        setFavoriteIds(prev => {
          const next = new Set(prev);
          if (wasLiked) {
            next.add(productId);
          } else {
            next.delete(productId);
          }
          return next;
        });
      })
      .finally(() => {
        isTogglingRef.current = false;
      });
  }, [isAuthenticated, user, favoriteIds]);

  const refreshFavorites = useCallback(async () => {
    if (user && user.role === 'client') {
      await loadFavorites(user.id);
    }
  }, [user, loadFavorites]);

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    // Don't clear pendingProductId or localStorage here
    // so that if user navigates to login page instead, it's still available
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    // processPendingFavorite will be called by the useEffect when user changes
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        loading,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
      }}
    >
      {children}
      <AuthModal
        isOpen={authModalOpen}
        onClose={handleAuthModalClose}
        onAuthSuccess={handleAuthSuccess}
      />
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
