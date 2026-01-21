import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CookieBanner } from './components/CookieBanner';
import { ROUTES } from './constants/routes';

// Auth pages
const LoginPage = lazy(() => import('./pages/LoginPage'));

// Lazy loading des pages pour optimiser le bundle
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const InterfacesDemo = lazy(() => import('./pages/InterfacesDemo'));
const CGVPage = lazy(() => import('./pages/CGVPage'));
const MentionsLegalesPage = lazy(() => import('./pages/MentionsLegalesPage'));
const ConfidentialitePage = lazy(() => import('./pages/ConfidentialitePage'));
const AProposPage = lazy(() => import('./pages/AProposPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));

// Admin pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductDetail = lazy(() => import('./pages/admin/AdminProductDetail'));
const AdminReservations = lazy(() => import('./pages/admin/AdminReservations'));
const AdminReservationDetail = lazy(() => import('./pages/admin/AdminReservationDetail'));
const AdminPlanning = lazy(() => import('./pages/admin/AdminPlanning'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminEventTypes = lazy(() => import('./pages/admin/AdminEventTypes'));
const AdminTimeSlots = lazy(() => import('./pages/admin/AdminTimeSlots'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminFaqs = lazy(() => import('./pages/admin/AdminFaqs'));
const AdminPortfolioEvents = lazy(() => import('./pages/admin/AdminPortfolioEvents'));

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

// Composant de chargement
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#000033] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#33ffcc] border-t-transparent"></div>
        <p className="mt-4 text-white text-lg">Chargement...</p>
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

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === ROUTES.LOGIN;
  const isAdminOrClientOrTechnician =
    location.pathname.startsWith(ROUTES.ADMIN.BASE) ||
    location.pathname.startsWith(ROUTES.CLIENT.BASE) ||
    location.pathname.startsWith(ROUTES.TECHNICIAN.BASE);

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {!isAdminOrClientOrTechnician && !isAuthPage && <Header />}
      <div className="overflow-y-auto">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Page de connexion */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />

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
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="event-types" element={<AdminEventTypes />} />
                  <Route path="time-slots" element={<AdminTimeSlots />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="faqs" element={<AdminFaqs />} />
                  <Route path="portfolio" element={<AdminPortfolioEvents />} />
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
          </Routes>
        </Suspense>
        {!isAdminOrClientOrTechnician && !isAuthPage && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <ScrollToTop />
              <AppContent />
              <CookieBanner />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
