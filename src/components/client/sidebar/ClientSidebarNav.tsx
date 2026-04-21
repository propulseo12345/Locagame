import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Heart, User, MapPin, type LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface ClientSidebarNavProps {
  activeReservations?: number;
  favoritesCount?: number;
}

export default function ClientSidebarNav({ activeReservations = 0, favoritesCount = 0 }: ClientSidebarNavProps) {
  const location = useLocation();

  const menuItems: NavItem[] = [
    { label: 'Tableau de bord', href: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Mes réservations', href: '/client/reservations', icon: Package, badge: activeReservations || undefined },
    { label: 'Mes favoris', href: '/client/favorites', icon: Heart, badge: favoritesCount || undefined },
    { label: 'Mes adresses', href: '/client/addresses', icon: MapPin },
    { label: 'Mon profil', href: '/client/profile', icon: User },
  ];

  return (
    <nav className="px-3 py-2">
      <div className="space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[#33ffcc]/10 text-[#33ffcc]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#33ffcc] rounded-r-full" />
              )}

              <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200 ${
                isActive ? 'text-[#33ffcc]' : 'text-gray-500 group-hover:text-gray-300'
              }`} />

              <span className={`text-[13px] flex-1 truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>

              {/* Badge counter */}
              {item.badge && item.badge > 0 && (
                <span className={`min-w-[20px] h-5 flex items-center justify-center px-1.5 text-[10px] font-bold rounded-full ${
                  isActive
                    ? 'bg-[#33ffcc]/20 text-[#33ffcc]'
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
