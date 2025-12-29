import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Heart, User, MapPin, LogOut, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Tableau de bord', href: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Mes réservations', href: '/client/reservations', icon: Package },
    { label: 'Mes favoris', href: '/client/favorites', icon: Heart },
    { label: 'Mes adresses', href: '/client/addresses', icon: MapPin },
    { label: 'Mon profil', href: '/client/profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] via-[#001144] to-[#000033]">
      {/* Particules d'ambiance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#33ffcc] rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-[#66cccc] rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-[#33ffcc]/60 rounded-full animate-bounce"></div>
        <div className="absolute top-60 right-1/3 w-1 h-1 bg-[#66cccc]/80 rounded-full animate-pulse"></div>
      </div>

      {/* Header moderne - Fixed pour rester toujours visible */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000033]/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-6 md:space-x-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <img src="/logo-client.png" alt="LocaGame" className="h-8 w-auto group-hover:scale-110 transition-transform" />
              </Link>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-full">
                <User className="w-4 h-4 text-[#33ffcc]" />
                <span className="text-sm text-[#33ffcc] font-medium">Espace client</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Retour au site */}
              <Link
                to="/"
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-white hover:text-[#33ffcc] hover:bg-white/5 rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au site
              </Link>

              {/* Déconnexion */}
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    navigate('/');
                  } catch (error) {
                    console.error('Error signing out:', error);
                    navigate('/');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all duration-300 border border-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation - Fixed pour rester toujours visible */}
      <aside className="hidden lg:block fixed top-20 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-6 md:gap-8">
            <div className="col-span-3 pointer-events-auto">
              <nav className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-3 md:p-4 space-y-2 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#33ffcc] to-[#66cccc] text-[#000033] font-bold shadow-lg shadow-[#33ffcc]/30'
                        : 'text-white hover:bg-white/10 hover:text-[#33ffcc]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isActive ? '' : 'group-hover:scale-110'
                    }`} />
                    <span className="text-sm md:text-base whitespace-nowrap flex-1">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-[#000033] rounded-full animate-pulse flex-shrink-0"></div>
                    )}
                  </Link>
                );
              })}

              {/* Séparateur */}
              <div className="pt-3 mt-3 border-t border-white/10">
                <Link
                  to="/"
                  className="flex md:hidden items-center space-x-3 px-4 py-3.5 rounded-xl text-white hover:bg-white/10 hover:text-[#33ffcc] transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm">Retour au site</span>
                </Link>
              </div>
              </nav>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenu avec padding pour compenser le header fixe */}
      <div className="pt-14 md:pt-16 relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Menu mobile (non fixe) */}
          <aside className="lg:hidden">
            <nav className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-3 md:p-4 space-y-2 shadow-xl">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#33ffcc] to-[#66cccc] text-[#000033] font-bold shadow-lg shadow-[#33ffcc]/30'
                        : 'text-white hover:bg-white/10 hover:text-[#33ffcc]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isActive ? '' : 'group-hover:scale-110'
                    }`} />
                    <span className="text-sm md:text-base whitespace-nowrap flex-1">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-[#000033] rounded-full animate-pulse flex-shrink-0"></div>
                    )}
                  </Link>
                );
              })}
              <div className="pt-3 mt-3 border-t border-white/10">
                <Link
                  to="/"
                  className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-white hover:bg-white/10 hover:text-[#33ffcc] transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm">Retour au site</span>
                </Link>
              </div>
            </nav>
          </aside>

          {/* Espace pour le menu fixe sur desktop */}
          <aside className="hidden lg:block lg:col-span-3"></aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
