import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Heart, User, MapPin, LogOut, ArrowLeft, ExternalLink, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatsService, CustomersService } from '../../services';
import { useFavorites } from '../../contexts/FavoritesContext';
import { ClientSidebarAvatar, ClientSidebarNav, ClientSidebarStats } from './sidebar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarData, setSidebarData] = useState({ totalSpent: 0, memberSince: null as string | null, activeReservations: 0 });
  const { favoriteIds } = useFavorites();
  const favoritesCount = favoriteIds?.size || 0;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [stats, customer] = await Promise.all([
          StatsService.getCustomerStats(user.id),
          CustomersService.getCustomerById(user.id),
        ]);
        setSidebarData({
          totalSpent: stats?.total_spent || 0,
          memberSince: customer?.created_at || null,
          activeReservations: stats?.total_reservations || 0,
        });
      } catch {
        // Sidebar stats are non-critical
      }
    };
    load();
  }, [user]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { label: 'Tableau de bord', href: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Mes réservations', href: '/client/reservations', icon: Package },
    { label: 'Mes favoris', href: '/client/favorites', icon: Heart },
    { label: 'Mes adresses', href: '/client/addresses', icon: MapPin },
    { label: 'Mon profil', href: '/client/profile', icon: User },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#000033]">
      {/* Subtle ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#33ffcc]/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#66cccc]/[0.015] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000033]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="px-4 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: logo + badge */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2.5 group">
                <img src="/logo-client.png" alt="LocaGame" className="h-7 w-auto" />
              </Link>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-md">
                <span className="text-[11px] font-medium text-gray-400 tracking-wide">Espace client</span>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Retour au site
              </Link>
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-400 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Déconnexion
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="pt-14 relative z-10">
        <div className="flex">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col w-[250px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-white/[0.06] bg-[#000033]/50">
            {user && (
              <ClientSidebarAvatar
                firstName={user.firstName || ''}
                lastName={user.lastName || ''}
                email={user.email}
              />
            )}

            <div className="flex-1 overflow-y-auto">
              <ClientSidebarNav
                activeReservations={sidebarData.activeReservations}
                favoritesCount={favoritesCount}
              />
            </div>

            <ClientSidebarStats
              totalSpent={sidebarData.totalSpent}
              memberSince={sidebarData.memberSince}
            />

            {/* Bottom actions */}
            <div className="px-3 pb-3">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour au site
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 min-h-[calc(100vh-3.5rem)] pb-20 lg:pb-0">
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#000033]/95 backdrop-blur-xl border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {[
            { label: 'Accueil', href: '/client/dashboard', icon: LayoutDashboard },
            { label: 'Réservations', href: '/client/reservations', icon: Package },
            { label: 'Favoris', href: '/client/favorites', icon: Heart },
            { label: 'Profil', href: '/client/profile', icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full active:scale-95 transition-transform ${
                  isActive ? 'text-[#33ffcc]' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile navigation overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-14 bottom-0 w-72 bg-[#000033] border-r border-white/[0.06] overflow-y-auto animate-slide-in-right">
            {user && (
              <ClientSidebarAvatar
                firstName={user.firstName || ''}
                lastName={user.lastName || ''}
                email={user.email}
              />
            )}

            <nav className="px-3 py-2 space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#33ffcc]/10 text-[#33ffcc]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#33ffcc]' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 pt-4 mt-4 border-t border-white/[0.06] space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-3 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour au site
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
