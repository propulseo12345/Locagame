import { useLoginAuth } from '../hooks/useLoginAuth';
import { FloatingParticles, LoginFormCard, DemoSection, LoginAnimations } from '../components/login';

/**
 * LoginPage - Authentication page for LOCAGAME.
 *
 * Orchestrates the login form (left column) and demo/branding section (right column)
 * over an animated particle background.
 *
 * Lazy-loaded in App.tsx via: const LoginPage = lazy(() => import('./pages/LoginPage'));
 */
export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    isVisible,
    handleSubmit,
    handleDemoLogin,
  } = useLoginAuth();

  return (
    <div className="min-h-screen bg-[#000022] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <h1 className="sr-only">Connexion à votre compte</h1>

      {/* Animated background */}
      <FloatingParticles />

      {/* Main container */}
      <div
        className={`w-full max-w-6xl relative z-10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left column - Login form */}
          <LoginFormCard
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={error}
            loading={loading}
            onSubmit={handleSubmit}
          />

          {/* Right column - Demo accounts or branding */}
          <DemoSection
            loading={loading}
            onDemoLogin={handleDemoLogin}
          />
        </div>
      </div>

      {/* CSS for custom animations */}
      <LoginAnimations />
    </div>
  );
}
