import { BrowserRouter as Router, Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { FeaturedProducts } from './components/FeaturedProducts';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CookieBanner } from './components/CookieBanner';
import { MobileBottomNav } from './components/header/MobileBottomNav';
import { ROUTES } from './constants/routes';

// Auth pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage'));

// Lazy loading des pages pour optimiser le bundle
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
// Demo page - only loaded if VITE_ENABLE_DEMO_MODE is enabled
const DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const InterfacesDemo = DEMO_MODE
  ? lazy(() => import('./pages/InterfacesDemo'))
  : () => <Navigate to="/" replace />;
const CGVPage = lazy(() => import('./pages/CGVPage'));
const MentionsLegalesPage = lazy(() => import('./pages/MentionsLegalesPage'));
const ConfidentialitePage = lazy(() => import('./pages/ConfidentialitePage'));
const AProposPage = lazy(() => import('./pages/AProposPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));

// Admin pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductDetail = lazy(() => import('./pages/admin/AdminProductDetail'));
const AdminReservations = lazy(() => import('./pages/admin/AdminReservations'));
const AdminReservationDetail = lazy(() => import('./pages/admin/AdminReservationDetail'));
const AdminPlanning = lazy(() => import('./pages/admin/AdminPlanning'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminClientDetail = lazy(() => import('./pages/admin/AdminClientDetail'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminEventTypes = lazy(() => import('./pages/admin/AdminEventTypes'));
const AdminTimeSlots = lazy(() => import('./pages/admin/AdminTimeSlots'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminFaqs = lazy(() => import('./pages/admin/AdminFaqs'));
const AdminPortfolioEvents = lazy(() => import('./pages/admin/AdminPortfolioEvents'));
const AdminTechniciansPage = lazy(() => import('./pages/admin/AdminTechniciansPage'));

// Client pages
const ClientLayout = lazy(() => import('./components/client/ClientLayout'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const ClientReservations = lazy(() => import('./pages/client/ClientReservations'));
const ClientReservationDetail = lazy(() => import('./pages/client/ClientReservationDetail'));
const ClientFavorites = lazy(() => import('./pages/client/ClientFavorites'));
const ClientProfile = lazy(() => import('./pages/client/ClientProfile'));
const ClientAddresses = lazy(() => import('./pages/client/ClientAddresses'));

// Technician pages
const TechnicianLayout = lazy(() => import('./components/technician/TechnicianLayout'));
const TechnicianDashboard = lazy(() => import('./pages/technician/TechnicianDashboard'));
const TechnicianTasks = lazy(() => import('./pages/technician/TechnicianTasks'));
const TechnicianTaskDetail = lazy(() => import('./pages/technician/TechnicianTaskDetail'));
const TechnicianProfile = lazy(() => import('./pages/technician/TechnicianProfile'));

// Composant de chargement — skeleton minimal plein écran
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#000033] flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto px-6 space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-shimmer" />
        </div>
        <div className="h-4 w-80 bg-white/5 rounded relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-shimmer" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-[#000033]">
      <main className="pt-20">
        <Hero />
        <About />
        <HowItWorks />
        <FeaturedProducts />
        <Testimonials />
      </main>
    </div>
  );
}

function ReservationRedirect() {
  const { id } = useParams();
  return <Navigate to={`/client/reservations/${id}`} replace />;
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === ROUTES.LOGIN || location.pathname === '/inscription';
  const isAdminOrClientOrTechnician =
    location.pathname.startsWith(ROUTES.ADMIN.BASE) ||
    location.pathname.startsWith(ROUTES.CLIENT.BASE) ||
    location.pathname.startsWith(ROUTES.TECHNICIAN.BASE) ||
    location.pathname.startsWith('/mon-compte') ||
    location.pathname.startsWith('/mes-reservations');

  return (
    <div className="min-h-screen bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#33ffcc] focus:text-[#000033] focus:rounded-lg focus:font-semibold"
      >
        Aller au contenu principal
      </a>
      {!isAdminOrClientOrTechnician && !isAuthPage && <Header />}
      <main id="main-content" tabIndex={-1} className="pb-20 md:pb-0 outline-none">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Pages d'authentification */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />

            {/* Page accès refusé */}
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            {/* Pages publiques */}
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
            <Route path="/produit/:id" element={<ProductPage />} />
            <Route path={ROUTES.CART} element={<CartPage />} />
            <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
            <Route path={ROUTES.EVENTS} element={<EventsPage />} />
            <Route path="/evenements/:id" element={<EventDetailPage />} />
            <Route path={ROUTES.CONTACT} element={<ContactPage />} />
            <Route path={ROUTES.DEMO} element={<InterfacesDemo />} />
            <Route path={ROUTES.CGV} element={<CGVPage />} />
            <Route path={ROUTES.MENTIONS_LEGALES} element={<MentionsLegalesPage />} />
            <Route path={ROUTES.CONFIDENTIALITE} element={<ConfidentialitePage />} />
            <Route path={ROUTES.A_PROPOS} element={<AProposPage />} />
            <Route path="/confirmation/:reservationId" element={<ConfirmationPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Redirects user-facing → client routes */}
            <Route path="/mon-compte" element={<Navigate to="/client/dashboard" replace />} />
            <Route path="/mes-reservations" element={<Navigate to="/client/reservations" replace />} />
            <Route path="/mes-reservations/:id" element={<ReservationRedirect />} />

          {/* Admin Routes - Protégées */}
          <Route path={`${ROUTES.ADMIN.BASE}/*`} element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/:id" element={<AdminProductDetail />} />
                  <Route path="reservations" element={<AdminReservations />} />
                  <Route path="reservations/:id" element={<AdminReservationDetail />} />
                  <Route path="livraisons" element={<AdminPlanning />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="customers/:id" element={<AdminClientDetail />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="event-types" element={<AdminEventTypes />} />
                  <Route path="time-slots" element={<AdminTimeSlots />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="faqs" element={<AdminFaqs />} />
                  <Route path="portfolio" element={<AdminPortfolioEvents />} />
                  <Route path="technicians" element={<AdminTechniciansPage />} />
                  <Route path="*" element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Client Routes - Protégées */}
          <Route path={`${ROUTES.CLIENT.BASE}/*`} element={
            <ProtectedRoute requiredRole="client">
              <ClientLayout>
                <Routes>
                  <Route path="dashboard" element={<ClientDashboard />} />
                  <Route path="reservations" element={<ClientReservations />} />
                  <Route path="reservations/:id" element={<ClientReservationDetail />} />
                  <Route path="favorites" element={<ClientFavorites />} />
                  <Route path="profile" element={<ClientProfile />} />
                  <Route path="addresses" element={<ClientAddresses />} />
                  <Route path="*" element={<Navigate to={ROUTES.CLIENT.DASHBOARD} replace />} />
                </Routes>
              </ClientLayout>
            </ProtectedRoute>
          } />

          {/* Technician Routes - Protégées */}
          <Route path={`${ROUTES.TECHNICIAN.BASE}/*`} element={
            <ProtectedRoute requiredRole="technician">
              <TechnicianLayout>
                <Routes>
                  <Route path="dashboard" element={<TechnicianDashboard />} />
                  <Route path="tasks" element={<TechnicianTasks />} />
                  <Route path="tasks/:id" element={<TechnicianTaskDetail />} />
                  <Route path="profile" element={<TechnicianProfile />} />
                  <Route path="*" element={<Navigate to={ROUTES.TECHNICIAN.DASHBOARD} replace />} />
                </Routes>
              </TechnicianLayout>
            </ProtectedRoute>
          } />

          {/* Fix B4 : catch-all global — page 404 pour toute URL non reconnue */}
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        {!isAdminOrClientOrTechnician && !isAuthPage && <Footer />}
        {!isAdminOrClientOrTechnician && !isAuthPage && <MobileBottomNav />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <FavoritesProvider>
          <CartProvider>
            <ToastProvider>
              <ScrollToTop />
              <AppContent />
              <CookieBanner />
            </ToastProvider>
          </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
