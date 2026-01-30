import { ShoppingCart, Menu, X, User, Search, LogOut, LogIn, Phone, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

// Liens de navigation principaux
const NAV_LINKS = [
  { path: '/', label: 'Accueil' },
  { path: '/catalogue', label: 'Catalogue' },
  { path: '/evenements', label: 'Événements' },
  { path: '/contact', label: 'Contact' },
] as const;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const { items } = useCart();

  // Détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50); // Seuil de 50px pour déclencher le changement
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'technician':
        return '/technician/dashboard';
      case 'client':
      default:
        return '/client/dashboard';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Mon compte';
    switch (user.role) {
      case 'admin':
        return 'Interface Admin';
      case 'technician':
        return 'Mes Tâches';
      case 'client':
      default:
        return 'Mon Espace';
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

      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000033] transition-all duration-300" role="banner">
        {/* === NIVEAU 1 : Logo | Titre | Actions === */}
        <div className={`hidden md:block relative transition-all duration-300 ${isScrolled ? 'h-16' : 'h-28'}`}>
          {/* Ligne centrale uniquement */}
          {!isScrolled && (
            <div className="absolute bottom-0 left-[46%] -translate-x-1/2 w-[45%] h-px bg-white/10"></div>
          )}
          {/* Logo - positionné indépendamment */}
          <Link to="/" className={`absolute left-12 transition-all duration-300 ${isScrolled ? 'left-6 bottom-0 translate-y-5' : 'top-1/2 -translate-y-1/3'}`} aria-label="Retour à l'accueil">
            <img
              src={isScrolled 
                ? "https://lh3.googleusercontent.com/pw/AP1GczOXY1GzwzGq-Y7QtylyG7YH6KJ8dSC5LU5kiR1XMexmh7jgVeT2ZOxeIWehZLgJpl6f17J1hYTcLl8JlWppqaB96wkf2puPPy-dlAJyXgbeSx8n3o6qGG0IclmHb24N4AYAZSKRDZffwYETETTp5qbz=w868-h287-s-no-gm?authuser=0"
                : "https://lh3.googleusercontent.com/pw/AP1GczNsJRsM7UbxHQrEZhFqb1YszYP5cjNFJ34YwDcIzp2lUGPdcD2fcOfKc711Hl87YKNu-9E8UGM0blce_Kdpi88lXExFSue4X6kFNXPFQCPo71g2KLjk_ov6g-_wclof_1r50cgrxVX4q-PSnXqiOqik=w587-h425-s-no-gm?authuser=0"
              }
              alt="LOCAGAME - Logo de location de jeux et animations pour événements en région PACA"
              className={`w-auto transition-all duration-300 ${isScrolled ? 'h-16' : 'h-32'}`}
              width={isScrolled ? "200" : "128"}
              height={isScrolled ? "64" : "128"}
              fetchPriority="high"
            />
          </Link>

          {/* Titre + slogan - positionné indépendamment */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center text-center select-text">
            <span className={`font-black text-black tracking-wider uppercase bg-[#33ffcc] inline-block transition-all duration-300 ${isScrolled ? 'text-lg px-3 py-1' : 'text-2xl px-4 py-2'}`} aria-label="LOCAGAME - Location de fun">
              LOCATION DE FUN !
            </span>
            {!isScrolled && (
              <p className="text-3xl text-[#33ffcc] friendly-text italic tracking-wide mt-2 uppercase font-bold transition-opacity duration-300">
                EN RETRAIT SUR MARSEILLE OU EN LIVRAISON (PACA)
              </p>
            )}
          </div>

          {/* Actions à droite - positionné indépendamment */}
          <div className={`absolute top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ${isScrolled ? 'right-4 gap-3' : 'right-8 gap-5'}`}>
            {/* Bouton Réserve en ligne */}
            <Link
              to="/catalogue"
              className={`rounded-full bg-[#33ffcc] text-[#000033] friendly-text font-black uppercase tracking-wider hover:bg-[#66cccc] hover:shadow-lg hover:shadow-[#33ffcc]/20 transition-all duration-300 ${
                isScrolled ? 'px-4 py-1.5 text-2xl' : 'px-6 py-3 text-3xl'
              }`}
            >
              RÉSERVE EN LIGNE
            </Link>

            {/* Numéro de téléphone */}
            <a
              href="tel:0430220383"
              className="flex items-center text-[#33ffcc] hover:text-[#66cccc] transition-all duration-300 group"
              style={{ gap: isScrolled ? '0.5rem' : '0.75rem' }}
            >
              <Phone className={`group-hover:scale-110 transition-transform ${isScrolled ? 'w-4 h-4' : 'w-6 h-6'}`} />
              <span className={`font-bold tracking-wide transition-all duration-300 ${isScrolled ? 'text-base' : 'text-xl'}`}>
                04 30 22 03 83
              </span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/locagame_13?igsh=MTU3MjM4NWY1a3l5Zw=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#33ffcc] hover:text-[#66cccc] transition-all duration-300 group"
              aria-label="Suivez-nous sur Instagram"
            >
              <Instagram className={`group-hover:scale-110 transition-transform ${isScrolled ? 'w-5 h-5' : 'w-7 h-7'}`} />
            </a>
          </div>
        </div>

        {/* === NIVEAU 2 : Navigation === */}
        <div className="hidden md:block border-b border-white/10 bg-gradient-to-b from-[#000033] to-[#000028]">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-300 ${isScrolled ? 'py-0.5' : 'py-2.5'}`}>
              {/* Espace gauche pour équilibrer */}
              <div></div>

              {/* Navigation principale centrée */}
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
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
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
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                          aria-hidden="true"
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-[#000033] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                          <div className="p-4 border-b border-white/10">
                            <p className="text-white font-semibold">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-[#33ffcc]/20 text-[#33ffcc] text-xs font-semibold rounded-full">
                              {user.role === 'admin' ? 'Administrateur' : user.role === 'technician' ? 'Technicien' : 'Client'}
                            </span>
                          </div>
                          <div className="p-2">
                            <Link
                              to={getDashboardLink()}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <User className="w-4 h-4" />
                              {getDashboardLabel()}
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-2 px-4 py-2 mt-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Déconnexion
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="p-2 text-white hover:text-[#33ffcc] transition-all duration-300"
                    aria-label="Se connecter"
                  >
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
                    <span
                      className="absolute -top-1 -right-1 bg-[#33ffcc] text-[#000033] text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center group-hover:scale-110 transition-transform"
                      aria-hidden="true"
                    >
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* === VERSION MOBILE === */}
        <div className="md:hidden border-b border-white/10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo mobile */}
              <Link to="/" className="flex-shrink-0" aria-label="Retour à l'accueil">
                <img
                  src={isScrolled 
                    ? "https://lh3.googleusercontent.com/pw/AP1GczOXY1GzwzGq-Y7QtylyG7YH6KJ8dSC5LU5kiR1XMexmh7jgVeT2ZOxeIWehZLgJpl6f17J1hYTcLl8JlWppqaB96wkf2puPPy-dlAJyXgbeSx8n3o6qGG0IclmHb24N4AYAZSKRDZffwYETETTp5qbz=w868-h287-s-no-gm?authuser=0"
                    : "https://lh3.googleusercontent.com/pw/AP1GczNsJRsM7UbxHQrEZhFqb1YszYP5cjNFJ34YwDcIzp2lUGPdcD2fcOfKc711Hl87YKNu-9E8UGM0blce_Kdpi88lXExFSue4X6kFNXPFQCPo71g2KLjk_ov6g-_wclof_1r50cgrxVX4q-PSnXqiOqik=w587-h425-s-no-gm?authuser=0"
                  }
                  alt="LOCAGAME - Logo de location de jeux et animations pour événements en région PACA"
                  className={`w-auto transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12'}`}
                  width={isScrolled ? "80" : "48"}
                  height={isScrolled ? "40" : "48"}
                  fetchPriority="high"
                />
              </Link>

              {/* Actions mobile */}
              <div className="flex items-center gap-2">
                {/* Téléphone */}
                <a
                  href="tel:0430220383"
                  className="p-2 text-[#33ffcc]"
                  aria-label="Appeler"
                >
                  <Phone className="w-5 h-5" />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/locagame_13?igsh=MTU3MjM4NWY1a3l5Zw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[#33ffcc]"
                  aria-label="Suivez-nous sur Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>

                {/* Panier */}
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

                {/* Menu burger */}
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

        {/* Menu Mobile déroulant */}
        {mobileMenuOpen && (
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
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full px-4 py-3 rounded-full bg-[#33ffcc] text-[#000033] friendly-text font-bold uppercase tracking-wider text-center"
                >
                  RÉSERVE EN LIGNE
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
                  onClick={() => setMobileMenuOpen(false)}
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
                      <p className="text-white font-semibold text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/5"
                    >
                      <User className="w-5 h-5" />
                      {getDashboardLabel()}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="w-5 h-5" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#33ffcc]/20 text-[#33ffcc] font-semibold"
                  >
                    <LogIn className="w-5 h-5" />
                    Connexion
                  </Link>
                )}
              </div>

              {/* Contact mobile */}
              <div className="flex items-center justify-center gap-4 mt-3">
                <a
                  href="tel:0430220383"
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-lg text-white font-bold"
                >
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
        )}
      </header>
    </>
  );
}
