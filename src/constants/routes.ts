/**
 * Constants pour les routes de l'application
 * Centralise toutes les URLs pour éviter les typos et faciliter la maintenance
 */

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  CATALOG: '/catalogue',
  PRODUCT: (id: string) => `/produit/${id}`,
  CART: '/panier',
  CHECKOUT: '/checkout',
  EVENTS: '/evenements',
  EVENT_DETAIL: (id: string) => `/evenements/${id}`,
  CONTACT: '/contact',
  DEMO: '/demo', // Gated by VITE_ENABLE_DEMO_MODE in App.tsx - redirects to / in prod

  // Legal pages
  CGV: '/cgv',
  MENTIONS_LEGALES: '/mentions-legales',
  CONFIDENTIALITE: '/confidentialite',
  A_PROPOS: '/a-propos',

  // Admin
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    RESERVATIONS: '/admin/reservations',
    LIVRAISONS: '/admin/livraisons',
    CUSTOMERS: '/admin/customers',
    SETTINGS: '/admin/settings',
  },

  // Client
  CLIENT: {
    BASE: '/client',
    DASHBOARD: '/client/dashboard',
    RESERVATIONS: '/client/reservations',
    RESERVATION_DETAIL: (id: string) => `/client/reservations/${id}`,
    FAVORITES: '/client/favorites',
    PROFILE: '/client/profile',
    ADDRESSES: '/client/addresses',
  },

  // Technician
  TECHNICIAN: {
    BASE: '/technician',
    DASHBOARD: '/technician/dashboard',
    TASKS: '/technician/tasks',
    TASK_DETAIL: (id: string) => `/technician/tasks/${id}`,
    PROFILE: '/technician/profile',
  },
} as const;

/**
 * Vérifie si une route est publique
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.CATALOG,
    ROUTES.CART,
    ROUTES.CHECKOUT,
    ROUTES.EVENTS,
    ROUTES.CONTACT,
    ROUTES.DEMO,
  ];

  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route));
}

/**
 * Vérifie si une route est protégée
 */
export function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith(ROUTES.ADMIN.BASE) ||
    pathname.startsWith(ROUTES.CLIENT.BASE) ||
    pathname.startsWith(ROUTES.TECHNICIAN.BASE)
  );
}

/**
 * Retourne le dashboard approprié selon le rôle
 */
export function getDashboardRoute(role: 'admin' | 'client' | 'technician'): string {
  const dashboards = {
    admin: ROUTES.ADMIN.DASHBOARD,
    client: ROUTES.CLIENT.DASHBOARD,
    technician: ROUTES.TECHNICIAN.DASHBOARD,
  };
  return dashboards[role];
}
