import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LogOut,
  LayoutDashboard,
  Package,
  CalendarCheck,
  Truck,
  Users,
  PartyPopper,
  Clock,
  MessageSquareQuote,
  HelpCircle,
  Images,
  Wrench,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Tag,
  Menu,
  X,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Auto-collapse sidebar on tablet, expand on desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    setSidebarOpen(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Produits', href: '/admin/products', icon: Package },
    { label: 'Réservations', href: '/admin/reservations', icon: CalendarCheck },
    { label: 'Livraisons', href: '/admin/livraisons', icon: Truck },
    { label: 'Clients', href: '/admin/customers', icon: Users },
    { label: 'Types d\'événements', href: '/admin/event-types', icon: PartyPopper },
    { label: 'Créneaux horaires', href: '/admin/time-slots', icon: Clock },
    { label: 'Témoignages', href: '/admin/testimonials', icon: MessageSquareQuote },
    { label: 'FAQ', href: '/admin/faqs', icon: HelpCircle },
    { label: 'Portfolio', href: '/admin/portfolio', icon: Images },
    { label: 'Techniciens', href: '/admin/technicians', icon: Wrench },
    { label: 'Codes promo', href: '/admin/promo-codes', icon: Tag },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
  ];

  // Bottom tab bar items (mobile only — most used)
  const mobileTabItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Réservations', href: '/admin/reservations', icon: CalendarCheck },
    { label: 'Produits', href: '/admin/products', icon: Package },
    { label: 'Livraisons', href: '/admin/livraisons', icon: Truck },
    { label: 'Plus', href: '#menu', icon: Menu },
  ];

  const userInitials = user
    ? `${user.firstName[0]}${user.lastName[0]}`
    : 'AD';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Admin';
  const userEmail = user ? user.email : 'Non connecté';

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); } catch { navigate('/'); }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex relative flex-col bg-[#000033] text-white overflow-hidden shrink-0 transition-[width] duration-200 ease-out ${
          sidebarOpen ? 'w-64' : 'w-[72px]'
        }`}
      >
        {/* Header: logo + toggle */}
        <div className={`flex items-center border-b border-white/10 ${sidebarOpen ? 'px-5 py-4 justify-between' : 'px-0 py-4 justify-center flex-col gap-3'}`}>
          <Link to="/" className="flex items-center shrink-0 group">
            {sidebarOpen ? (
              <img
                src="/logo-client.png"
                alt="LOCAGAME"
                className="h-8 w-auto group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#33ffcc] flex items-center justify-center text-[#000033] font-bold text-lg group-hover:scale-105 transition-transform">
                L
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/60 hover:text-[#33ffcc] transition-colors"
            aria-label={sidebarOpen ? 'Réduire la sidebar' : 'Ouvrir la sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-3 ${sidebarOpen ? 'px-3' : 'px-2'}`}>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <div key={item.href} className="relative group">
                  <Link
                    to={item.href}
                    className={`flex items-center rounded-xl transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#33ffcc] text-[#000033]'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    } ${
                      sidebarOpen
                        ? 'h-11 px-4 gap-3'
                        : 'h-11 w-11 justify-center mx-auto'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                  </Link>

                  {/* Tooltip (collapsed only) */}
                  {!sidebarOpen && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer: user info */}
        <div className={`border-t border-white/10 ${sidebarOpen ? 'p-4' : 'p-3'}`}>
          <div className="relative group">
            <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-[#33ffcc] flex items-center justify-center text-[#000033] font-bold text-sm shrink-0">
                {userInitials}
              </div>
              {sidebarOpen && (
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                </div>
              )}
            </div>

            {/* Tooltip user (collapsed only) */}
            {!sidebarOpen && (
              <div className="absolute left-full bottom-0 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                <p>{userName}</p>
                <p className="text-gray-400">{userEmail}</p>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex items-center gap-3">
              {/* Mobile logo */}
              <Link to="/admin/dashboard" className="md:hidden flex items-center shrink-0">
                <img
                  src="/logo-client.png"
                  alt="LOCAGAME"
                  className="h-7 w-auto"
                />
              </Link>
              <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.href === location.pathname)?.label || 'Admin'}
              </h2>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {/* User info — desktop */}
              {user && (
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#33ffcc] flex items-center justify-center text-[#000033] font-bold text-sm">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}
              {/* Return to site — desktop */}
              <Link
                to="/"
                className="hidden md:flex px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Retour au site
              </Link>
              {/* Déconnexion — desktop */}
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-all duration-300 border border-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8 pb-20 md:pb-6 lg:pb-8 max-w-screen-2xl">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {mobileTabItems.map((item) => {
            const Icon = item.icon;
            const isMenu = item.href === '#menu';
            const isActive = isMenu ? mobileMenuOpen : location.pathname === item.href;
            return isMenu ? (
              <button
                key="menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-95 transition-transform ${
                  isActive ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-95 transition-transform ${
                  isActive ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white overflow-y-auto">
            {/* Menu header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* All menu items */}
            <nav className="px-3 py-2 space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors active:scale-95 ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom actions */}
            <div className="px-4 pt-3 mt-2 border-t border-gray-200 space-y-1 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-3 text-sm text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour au site
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
