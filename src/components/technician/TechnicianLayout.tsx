import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LogOut,
  CalendarDays,
  Wrench,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface TechnicianLayoutProps {
  children: React.ReactNode;
}

export default function TechnicianLayout({ children }: TechnicianLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems: MenuItem[] = [
    { label: 'Planning', href: '/technician/dashboard', icon: CalendarDays },
    { label: 'Mes interventions', href: '/technician/tasks', icon: Wrench },
    { label: 'Mon profil', href: '/technician/profile', icon: UserCircle },
  ];

  const userInitials = user
    ? `${user.firstName[0]}${user.lastName[0]}`
    : 'TC';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Technicien';
  const userEmail = user ? user.email : 'Non connecté';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`relative flex flex-col bg-[#000033] text-white overflow-hidden shrink-0 transition-[width] duration-200 ease-out ${
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
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.href === location.pathname)?.label || 'Technicien'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* User info */}
              {user && (
                <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#33ffcc] flex items-center justify-center text-[#000033] font-bold text-sm">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}
              {/* Return to site */}
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Retour au site
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
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-all duration-300 border border-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
