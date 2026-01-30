import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, LogIn, Eye, EyeOff, AlertCircle, UserCog, Users, Truck, UserPlus, Sparkles, Gamepad2, ArrowRight, ChevronRight } from 'lucide-react';

// Demo mode - NEVER enable in production
const DEMO_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

// Demo credentials only loaded if demo mode is enabled
const DEMO_CREDENTIALS = DEMO_MODE_ENABLED ? {
  admin: {
    email: 'admin@locagame.fr',
    password: 'admin123',
    description: 'Accès complet à l\'interface d\'administration',
  },
  client: {
    email: 'client@exemple.fr',
    password: 'client123',
    description: 'Accès à l\'espace client avec réservations',
  },
  technician: {
    email: 'technicien@locagame.fr',
    password: 'tech123',
    description: 'Accès à l\'interface de livraison',
  },
} : null;

// Floating particles component for immersive background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-gradient-to-br from-[#33ffcc]/20 via-[#33ffcc]/5 to-transparent rounded-full blur-3xl animate-float-slow" />
      <div className="absolute w-[500px] h-[500px] -bottom-32 -right-32 bg-gradient-to-tl from-[#66cccc]/20 via-[#66cccc]/5 to-transparent rounded-full blur-3xl animate-float-slower" />
      <div className="absolute w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#fe1979]/10 to-[#33ffcc]/10 rounded-full blur-3xl animate-pulse-slow" />

      {/* Floating game elements */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full bg-gradient-to-br from-[#33ffcc]/60 to-[#33ffcc]/20"
            style={{
              boxShadow: '0 0 20px rgba(51, 255, 204, 0.4)',
            }}
          />
        </div>
      ))}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(51, 255, 204, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(51, 255, 204, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// Enhanced input component with glow effects
function GlowInput({
  type,
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  autoComplete,
  required,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
}: {
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="group relative">
      <label className="block text-sm font-medium text-white/70 mb-2 tracking-wide uppercase">
        {label}
        {required && <span className="text-[#fe1979] ml-1">*</span>}
      </label>
      <div className="relative">
        {/* Glow effect on focus */}
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r from-[#33ffcc] via-[#66cccc] to-[#33ffcc] rounded-xl opacity-0 blur-sm transition-opacity duration-300 ${isFocused ? 'opacity-60' : 'group-hover:opacity-30'}`}
        />
        <div className="relative flex items-center">
          <div className={`absolute left-4 transition-colors duration-300 ${isFocused ? 'text-[#33ffcc]' : 'text-white/40'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <input
            type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            className="w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-transparent transition-all duration-300"
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onTogglePassword}
              className={`absolute right-4 transition-colors duration-300 ${isFocused ? 'text-[#33ffcc]' : 'text-white/40'} hover:text-[#33ffcc]`}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Animated submit button
function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative w-full py-4 px-6 overflow-hidden rounded-xl font-bold text-lg tracking-wide transition-all duration-300 disabled:cursor-not-allowed"
    >
      {/* Button background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#33ffcc] via-[#66cccc] to-[#33ffcc] bg-[length:200%_100%] animate-gradient-shift" />

      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Button content */}
      <span className="relative flex items-center justify-center gap-3 text-[#000033]">
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-[#000033]/30 border-t-[#000033] rounded-full animate-spin" />
            <span>Connexion en cours...</span>
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>{children}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </>
        )}
      </span>
    </button>
  );
}

// Demo card with hover effects
function DemoCard({
  type,
  icon: Icon,
  title,
  description,
  email,
  password,
  gradient,
  accentColor,
  onClick,
  loading,
}: {
  type: string;
  icon: React.ElementType;
  title: string;
  description: string;
  email: string;
  password: string;
  gradient: string;
  accentColor: string;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group relative w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Card glow on hover */}
      <div
        className={`absolute -inset-0.5 ${gradient} rounded-2xl opacity-0 group-hover:opacity-50 blur transition-opacity duration-300`}
      />

      <div className="relative p-5 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl group-hover:border-transparent group-hover:bg-white/[0.06] transition-all duration-300">
        <div className="flex items-start gap-4">
          {/* Icon container */}
          <div
            className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
            style={{ boxShadow: `0 8px 32px ${accentColor}40` }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold text-lg">{title}</h3>
              <ChevronRight
                className={`w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`}
                style={{ color: accentColor }}
              />
            </div>
            <p className="text-white/50 text-sm mb-3 line-clamp-2">{description}</p>

            {/* Credentials */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <code
                className="px-2 py-1 rounded-md bg-white/5 font-mono"
                style={{ color: accentColor }}
              >
                {email}
              </code>
              <span className="text-white/20">•</span>
              <code className="px-2 py-1 rounded-md bg-white/5 text-white/40 font-mono">
                {password}
              </code>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<'admin' | 'client' | 'technician' | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect once user is loaded
  useEffect(() => {
    if (user && pendingRedirect) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/client/dashboard');
      }
      setPendingRedirect(null);
      setLoading(false);
    } else if (user && !pendingRedirect) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    }
  }, [user, pendingRedirect, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      if (email.includes('admin')) {
        setPendingRedirect('admin');
      } else if (email.includes('technicien')) {
        setPendingRedirect('technician');
      } else {
        setPendingRedirect('client');
      }
      if (user) {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects. Veuillez réessayer.');
      setLoading(false);
      setPendingRedirect(null);
    }
  };

  const handleDemoLogin = async (demoType: 'admin' | 'client' | 'technician') => {
    if (!DEMO_CREDENTIALS) return;

    const credentials = DEMO_CREDENTIALS[demoType];
    setEmail(credentials.email);
    setPassword(credentials.password);
    setError('');
    setLoading(true);

    try {
      await signIn(credentials.email, credentials.password);
      setPendingRedirect(demoType);
      if (user) {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      setLoading(false);
      setPendingRedirect(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#000022] flex items-center justify-center p-4 md:p-8 overflow-hidden">
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
          <div className="relative order-2 lg:order-1">
            {/* Card glow */}
            <div className="absolute -inset-1 bg-gradient-to-br from-[#33ffcc]/20 via-transparent to-[#66cccc]/20 rounded-3xl blur-xl" />

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-10">
                {/* Logo with glow */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-[#33ffcc]/30 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-[#001133] to-[#000022] p-4 rounded-2xl border border-white/10">
                    <Gamepad2 className="w-12 h-12 text-[#33ffcc]" />
                  </div>
                </div>

                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                  Bienvenue
                </h1>
                <p className="text-white/50 text-lg">
                  Connectez-vous à votre espace{' '}
                  <span className="bg-gradient-to-r from-[#33ffcc] to-[#66cccc] bg-clip-text text-transparent font-semibold">
                    LOCAGAME
                  </span>
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-shake">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-red-400 font-medium">Erreur de connexion</p>
                      <p className="text-red-400/70 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <GlowInput
                  type="email"
                  label="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  placeholder="votre@email.com"
                  autoComplete="email"
                  required
                />

                <GlowInput
                  type="password"
                  label="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={Lock}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                {/* Forgot password link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-white/50 hover:text-[#33ffcc] transition-colors duration-300 flex items-center gap-1 group"
                  >
                    <span>Mot de passe oublié ?</span>
                    <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                <SubmitButton loading={loading}>
                  Se connecter
                </SubmitButton>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-white/30 bg-[#000022]">
                    Pas encore de compte ?
                  </span>
                </div>
              </div>

              {/* Register button */}
              <Link to="/inscription" className="group block">
                <div className="relative p-4 border-2 border-dashed border-white/20 rounded-xl hover:border-[#33ffcc]/50 transition-all duration-300">
                  <div className="flex items-center justify-center gap-3 text-white/70 group-hover:text-white transition-colors">
                    <UserPlus className="w-5 h-5 group-hover:text-[#33ffcc] transition-colors" />
                    <span className="font-semibold">Créer un compte client</span>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-center text-white/30 text-xs mt-2">
                    Suivez vos réservations et gérez vos événements
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Right column - Demo accounts or branding */}
          <div className="order-1 lg:order-2 flex flex-col">
            {DEMO_MODE_ENABLED && DEMO_CREDENTIALS ? (
              <>
                {/* Demo accounts header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#33ffcc]/20 to-[#66cccc]/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#33ffcc]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Mode démo</h2>
                      <p className="text-white/40 text-sm">Testez les interfaces en un clic</p>
                    </div>
                  </div>
                </div>

                {/* Demo cards */}
                <div className="space-y-4 flex-1">
                  <DemoCard
                    type="admin"
                    icon={UserCog}
                    title="Administrateur"
                    description={DEMO_CREDENTIALS.admin.description}
                    email={DEMO_CREDENTIALS.admin.email}
                    password={DEMO_CREDENTIALS.admin.password}
                    gradient="bg-gradient-to-br from-[#33ffcc] to-[#00aa88]"
                    accentColor="#33ffcc"
                    onClick={() => handleDemoLogin('admin')}
                    loading={loading}
                  />

                  <DemoCard
                    type="client"
                    icon={Users}
                    title="Client"
                    description={DEMO_CREDENTIALS.client.description}
                    email={DEMO_CREDENTIALS.client.email}
                    password={DEMO_CREDENTIALS.client.password}
                    gradient="bg-gradient-to-br from-[#66cccc] to-[#33aaaa]"
                    accentColor="#66cccc"
                    onClick={() => handleDemoLogin('client')}
                    loading={loading}
                  />

                  <DemoCard
                    type="technician"
                    icon={Truck}
                    title="Technicien"
                    description={DEMO_CREDENTIALS.technician.description}
                    email={DEMO_CREDENTIALS.technician.email}
                    password={DEMO_CREDENTIALS.technician.password}
                    gradient="bg-gradient-to-br from-[#fe1979] to-[#cc1166]"
                    accentColor="#fe1979"
                    onClick={() => handleDemoLogin('technician')}
                    loading={loading}
                  />
                </div>

                {/* Back link */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors group"
                  >
                    <span>←</span>
                    <span>Retour au site vitrine</span>
                  </Link>
                </div>
              </>
            ) : (
              /* Production mode - Branding section */
              <div className="flex flex-col items-center justify-center h-full text-center py-12 lg:py-0">
                {/* Large decorative element */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#33ffcc]/30 to-[#66cccc]/30 blur-3xl rounded-full" />
                  <div className="relative">
                    <img
                      src="/logo-client.png"
                      alt="LOCAGAME"
                      className="h-20 w-auto mx-auto mb-6"
                      onError={(e) => {
                        // Fallback if logo doesn't exist
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <h2 className="text-3xl font-black bg-gradient-to-r from-[#33ffcc] via-[#66cccc] to-[#33ffcc] bg-clip-text text-transparent">
                      LOCAGAME
                    </h2>
                  </div>
                </div>

                <p className="text-white/50 text-lg max-w-sm mb-8 leading-relaxed">
                  Votre partenaire pour des événements <br />
                  <span className="text-[#33ffcc] font-semibold">mémorables</span> et{' '}
                  <span className="text-[#66cccc] font-semibold">ludiques</span>
                </p>

                {/* Features list */}
                <div className="space-y-3 text-left">
                  {[
                    'Location de jeux et animations',
                    'Livraison et installation',
                    'Service clé en main',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/60">
                      <div className="w-6 h-6 rounded-full bg-[#33ffcc]/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#33ffcc]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Back link */}
                <div className="mt-12">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-[#33ffcc]/50 transition-all group"
                  >
                    <span>←</span>
                    <span>Découvrir nos services</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }

        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-40px, 20px) rotate(-3deg); }
          66% { transform: translate(30px, -40px) rotate(3deg); }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.2);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-40px) translateX(-5px) scale(1);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-20px) translateX(-10px) scale(0.8);
            opacity: 0.7;
          }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.1); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 25s ease-in-out infinite; }
        .animate-float-particle { animation: float-particle 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-gradient-shift { animation: gradient-shift 3s ease infinite; }
      `}</style>
    </div>
  );
}
