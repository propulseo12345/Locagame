import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Produits', href: '/admin/products' },
    { label: 'Réservations', href: '/admin/reservations' },
    { label: 'Livraisons', href: '/admin/livraisons' },
    { label: 'Clients', href: '/admin/customers' },
    { label: 'Types d\'événements', href: '/admin/event-types' },
    { label: 'Créneaux horaires', href: '/admin/time-slots' },
    { label: 'Témoignages', href: '/admin/testimonials' },
    { label: 'FAQ', href: '/admin/faqs' },
    { label: 'Portfolio', href: '/admin/portfolio' },
    { label: 'Paramètres', href: '/admin/settings' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-[#000033] text-white transition-all duration-300 h-full ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center group">
              <img src="/logo-client.png" alt="LOCAGAME" className="h-8 w-auto group-hover:scale-105 transition-transform" />
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#33ffcc] hover:text-white transition-colors"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? 'bg-[#33ffcc] text-[#000033]'
                    : 'hover:bg-white/10'
                }`}
              >
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {user ? (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#33ffcc] flex items-center justify-center text-[#000033] font-bold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              {sidebarOpen && (
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#33ffcc] flex items-center justify-center text-[#000033] font-bold">
                AD
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-gray-400">Non connecté</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.href === location.pathname)?.label || 'Admin'}
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
