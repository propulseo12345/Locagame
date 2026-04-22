import { useLocation, Link } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

const navItems = [
  { path: ROUTES.HOME, label: 'Accueil', icon: Home },
  { path: ROUTES.CATALOG, label: 'Catalogue', icon: Search },
  { path: ROUTES.CART, label: 'Panier', icon: ShoppingCart, showBadge: true },
  { path: 'account', label: 'Compte', icon: User },
] as const;

type MobileNavItem = {
  path: string;
  label: string;
  icon: (typeof navItems)[number]['icon'];
  showBadge?: boolean;
};

export function MobileBottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const getAccountPath = () => {
    if (!user) return ROUTES.LOGIN;
    const role = (user as any).role;
    if (role === 'admin') return ROUTES.ADMIN.DASHBOARD;
    if (role === 'technician') return ROUTES.TECHNICIAN.DASHBOARD;
    return '/mon-compte';
  };

  const isActive = (path: string) => {
    if (path === 'account') {
      const accountPath = getAccountPath();
      return location.pathname === accountPath || location.pathname.startsWith('/client') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/technician') || location.pathname === ROUTES.LOGIN;
    }
    if (path === ROUTES.HOME) return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#000033]/95 backdrop-blur-lg border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-16 px-2">
        {(navItems as readonly MobileNavItem[]).map((item) => {
          const path = item.path === 'account' ? getAccountPath() : item.path;
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={path}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] gap-0.5 transition-colors duration-200 relative ${
                active ? 'text-[#33ffcc]' : 'text-white/50'
              }`}
            >
              {/* Active indicator dot */}
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#33ffcc]" />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                {item.showBadge && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#33ffcc] text-[#000033] text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className={`text-xs font-semibold ${active ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
