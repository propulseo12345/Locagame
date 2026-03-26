import { Link } from 'react-router-dom';
import { Search, User, LogOut, LogIn, Phone, Instagram, Facebook, X } from 'lucide-react';
import { NAV_LINKS, getDashboardLink, getDashboardLabel } from './constants';

interface MobileMenuProps {
  isOpen: boolean;
  isActivePath: (path: string) => boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isAuthenticated: boolean;
  user: any;
  handleSignOut: () => void;
  onClose: () => void;
}

export function MobileMenu({
  isOpen,
  isActivePath,
  searchQuery,
  setSearchQuery,
  handleSearch,
  isAuthenticated,
  user,
  handleSignOut,
  onClose,
}: MobileMenuProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <nav
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-[85vw] max-w-[320px] z-50 md:hidden bg-[#000033] transform transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Navigation mobile"
      >
        <div className="px-4 py-4 space-y-2">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white"
              aria-label="Fermer le menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Titre mobile */}
          <div className="text-center pb-3 border-b border-white/10 mb-3">
            <p className="text-lg font-black text-black uppercase px-4 py-2 bg-[#33ffcc] inline-block">LOCATION DE FUN !</p>
            <p className="text-xs text-[#33ffcc] friendly-text italic mt-2 uppercase">EN RETRAIT SUR MARSEILLE OU EN LIVRAISON (PACA)</p>
          </div>

          {/* Bouton CTA mobile */}
          <div className="mb-4">
            <Link
              to="/catalogue"
              onClick={onClose}
              className="block w-full px-4 py-3 rounded-full bg-[#33ffcc] text-[#000033] friendly-text font-bold uppercase tracking-wider text-center"
            >
              RESERVE EN LIGNE
            </Link>
          </div>

          {/* Recherche mobile */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un jeu..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
                aria-label="Rechercher des jeux"
              />
            </div>
          </form>

          {/* Navigation */}
          {NAV_LINKS.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`block px-4 py-3 rounded-lg text-base font-semibold uppercase tracking-wide min-h-[44px] flex items-center ${
                isActivePath(path)
                  ? 'text-[#33ffcc] bg-[#33ffcc]/10'
                  : 'text-white hover:text-[#33ffcc] hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}

          {/* Authentification mobile */}
          <div className="border-t border-white/10 pt-3 mt-3">
            {isAuthenticated && user ? (
              <>
                <div className="px-4 py-2 mb-2">
                  <p className="text-white font-semibold text-sm">{user.firstName} {user.lastName}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
                <Link
                  to={getDashboardLink(user)}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/5 min-h-[44px]"
                >
                  <User className="w-5 h-5" />
                  {getDashboardLabel(user)}
                </Link>
                <button
                  onClick={() => { handleSignOut(); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 min-h-[44px]"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#33ffcc]/20 text-[#33ffcc] font-semibold min-h-[44px]"
              >
                <LogIn className="w-5 h-5" />
                Connexion
              </Link>
            )}
          </div>

          {/* Contact mobile */}
          <div className="flex items-center justify-center gap-4 mt-3 pb-24">
            <a href="tel:0430220383" className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-lg text-white font-bold min-h-[44px]">
              <Phone className="w-5 h-5 text-[#33ffcc]" />
              04 30 22 03 83
            </a>
            <a
              href="https://www.facebook.com/locagamefr/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white/5 rounded-lg text-[#33ffcc] font-bold hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Suivez-nous sur Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/locagame_13?igsh=MTU3MjM4NWY1a3l5Zw=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white/5 rounded-lg text-[#33ffcc] font-bold hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Suivez-nous sur Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@pokeragency"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white/5 rounded-lg text-[#33ffcc] font-bold hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Suivez-nous sur TikTok"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
              </svg>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
