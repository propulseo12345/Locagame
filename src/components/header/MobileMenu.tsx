import { Link } from 'react-router-dom';
import { Search, User, LogOut, LogIn, Phone, Instagram } from 'lucide-react';
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
  if (!isOpen) return null;

  return (
    <nav id="mobile-menu" className="md:hidden bg-[#000033] border-b border-white/10 animate-fade-in" aria-label="Navigation mobile">
      <div className="px-4 py-4 space-y-2">
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
            className="w-full px-4 py-3 rounded-full bg-[#33ffcc] text-[#000033] friendly-text font-bold uppercase tracking-wider text-center"
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
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
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
            className={`block px-4 py-3 rounded-lg text-base font-semibold uppercase tracking-wide ${
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/5"
              >
                <User className="w-5 h-5" />
                {getDashboardLabel(user)}
              </Link>
              <button
                onClick={() => { handleSignOut(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-5 h-5" />
                Deconnexion
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#33ffcc]/20 text-[#33ffcc] font-semibold"
            >
              <LogIn className="w-5 h-5" />
              Connexion
            </Link>
          )}
        </div>

        {/* Contact mobile */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <a href="tel:0430220383" className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-lg text-white font-bold">
            <Phone className="w-5 h-5 text-[#33ffcc]" />
            04 30 22 03 83
          </a>
          <a
            href="https://www.instagram.com/locagame_13?igsh=MTU3MjM4NWY1a3l5Zw=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-lg text-[#33ffcc] font-bold hover:bg-white/10 transition-colors"
            aria-label="Suivez-nous sur Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
        </div>
      </div>
    </nav>
  );
}
