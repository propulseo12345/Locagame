import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

import { DesktopTopBar } from './header/DesktopTopBar';
import { DesktopNav } from './header/DesktopNav';
import { MobileHeader } from './header/MobileHeader';
import { MobileMenu } from './header/MobileMenu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const { items } = useCart();

  // Detecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Synchroniser --header-height avec la hauteur réelle du header
  const syncHeaderHeight = useCallback(() => {
    if (headerRef.current) {
      document.documentElement.style.setProperty(
        '--header-height',
        `${headerRef.current.offsetHeight}px`
      );
    }
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(el);
    syncHeaderHeight();
    return () => observer.disconnect();
  }, [syncHeaderHeight]);

  const isActivePath = (path: string) => location.pathname === path;
  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setUserMenuOpen(false);
      navigate('/');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#33ffcc] focus:text-[#000033] focus:rounded-lg focus:font-semibold"
      >
        Aller au contenu principal
      </a>

      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-[#000033] transition-all duration-300" role="banner">
        {/* Desktop: Top bar with logo, title, actions */}
        <DesktopTopBar isScrolled={isScrolled} />

        {/* Desktop: Navigation bar */}
        <DesktopNav
          isScrolled={isScrolled}
          isActivePath={isActivePath}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isAuthenticated={isAuthenticated}
          user={user}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          handleSignOut={handleSignOut}
          cartItemsCount={cartItemsCount}
        />

        {/* Mobile: Header bar */}
        <MobileHeader
          isScrolled={isScrolled}
          cartItemsCount={cartItemsCount}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Mobile: Expandable menu */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          isActivePath={isActivePath}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isAuthenticated={isAuthenticated}
          user={user}
          handleSignOut={handleSignOut}
          onClose={() => setMobileMenuOpen(false)}
        />
      </header>
    </>
  );
}
