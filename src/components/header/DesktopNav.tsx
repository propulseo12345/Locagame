import { Link } from 'react-router-dom';
import { Search, X, ShoppingCart, LogIn, User, LogOut } from 'lucide-react';
import { NAV_LINKS, getDashboardLink, getDashboardLabel } from './constants';

interface DesktopNavProps {
  isScrolled: boolean;
  isActivePath: (path: string) => boolean;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isAuthenticated: boolean;
  user: any;
  userMenuOpen: boolean;
  setUserMenuOpen: (v: boolean) => void;
  handleSignOut: () => void;
  cartItemsCount: number;
}

export function DesktopNav({
  isScrolled,
  isActivePath,
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
  handleSearch,
  isAuthenticated,
  user,
  userMenuOpen,
  setUserMenuOpen,
  handleSignOut,
  cartItemsCount,
}: DesktopNavProps) {
  return (
    <div className="hidden md:block border-b border-white/10 bg-gradient-to-b from-[#000033] to-[#000028]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-300 ${isScrolled ? 'py-0.5' : 'py-2.5'}`}>
          <div></div>

          {/* Navigation principale centree */}
          <nav className="flex items-center justify-center gap-1" aria-label="Navigation principale">
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm ${
                  isActivePath(path)
                    ? 'text-[#33ffcc] bg-[#33ffcc]/10'
                    : 'text-white/80 hover:text-[#33ffcc] hover:bg-white/5'
                }`}
                aria-current={isActivePath(path) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions secondaires */}
          <div className="flex items-center justify-end gap-2">
            {/* Recherche */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-48 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent text-sm"
                  autoFocus
                  aria-label="Rechercher des jeux"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="ml-2 text-white hover:text-[#33ffcc] transition-colors"
                  aria-label="Fermer la recherche"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-white hover:text-[#33ffcc] transition-all duration-300"
                aria-label="Ouvrir la recherche"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Authentification */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-white hover:text-[#33ffcc] transition-all duration-300"
                  aria-label="Menu utilisateur"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-8 h-8 bg-[#33ffcc]/20 rounded-full flex items-center justify-center text-lg">
                    {user.avatar || '👤'}
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 mt-2 w-64 bg-[#000033] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                      <div className="p-4 border-b border-white/10">
                        <p className="text-white font-semibold">{user.firstName} {user.lastName}</p>
                        <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-[#33ffcc]/20 text-[#33ffcc] text-xs font-semibold rounded-full">
                          {user.role === 'admin' ? 'Administrateur' : user.role === 'technician' ? 'Technicien' : 'Client'}
                        </span>
                      </div>
                      <div className="p-2">
                        <Link
                          to={getDashboardLink(user)}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4" />
                          {getDashboardLabel(user)}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2 mt-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Deconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="p-2 text-white hover:text-[#33ffcc] transition-all duration-300" aria-label="Se connecter">
                <LogIn className="w-5 h-5" />
              </Link>
            )}

            {/* Panier */}
            <Link
              to="/panier"
              className="relative p-2 text-white hover:text-[#33ffcc] transition-all duration-300 group"
              aria-label={`Panier (${cartItemsCount} article${cartItemsCount > 1 ? 's' : ''})`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#33ffcc] text-[#000033] text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center group-hover:scale-110 transition-transform" aria-hidden="true">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
