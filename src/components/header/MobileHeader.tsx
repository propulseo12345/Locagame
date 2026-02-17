import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, Instagram } from 'lucide-react';
import { LOGO_SCROLLED, LOGO_DEFAULT } from './constants';

interface MobileHeaderProps {
  isScrolled: boolean;
  cartItemsCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
}

export function MobileHeader({ isScrolled, cartItemsCount, mobileMenuOpen, setMobileMenuOpen }: MobileHeaderProps) {
  return (
    <div className="md:hidden border-b border-white/10">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo mobile */}
          <Link to="/" className="flex-shrink-0" aria-label="Retour a l'accueil">
            <img
              src={isScrolled ? LOGO_SCROLLED : LOGO_DEFAULT}
              alt="LOCAGAME - Logo de location de jeux et animations pour evenements en region PACA"
              className={`w-auto transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12'}`}
              width={isScrolled ? "80" : "48"}
              height={isScrolled ? "40" : "48"}
              fetchpriority="high"
            />
          </Link>

          {/* Actions mobile */}
          <div className="flex items-center gap-2">
            <a href="tel:0430220383" className="p-2 text-[#33ffcc]" aria-label="Appeler">
              <Phone className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/locagame_13?igsh=MTU3MjM4NWY1a3l5Zw=="
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#33ffcc]"
              aria-label="Suivez-nous sur Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <Link
              to="/panier"
              className="relative p-2 text-white"
              aria-label={`Panier (${cartItemsCount} article${cartItemsCount > 1 ? 's' : ''})`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#33ffcc] text-[#000033] text-xs font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
