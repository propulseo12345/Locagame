import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/ui';
import { Lock, Mail, LogIn, Eye, EyeOff, AlertCircle, UserCog, Users, Truck } from 'lucide-react';
import { DEMO_CREDENTIALS } from '../lib/fake-data/users';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<'admin' | 'client' | 'technician' | null>(null);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  // Rediriger une fois que le user est chargé
  useEffect(() => {
    if (user && pendingRedirect) {
      // Utiliser le rôle réel du user plutôt que pendingRedirect
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
      // Si on est déjà connecté, rediriger automatiquement
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
      // Le user sera mis à jour par signIn, on attendra le useEffect pour rediriger
      // On détermine le rôle depuis l'email en attendant
      if (email.includes('admin')) {
        setPendingRedirect('admin');
      } else if (email.includes('technicien')) {
        setPendingRedirect('technician');
      } else {
        setPendingRedirect('client');
      }
      // Si le user est déjà chargé (cas rare), rediriger immédiatement
      if (user) {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      setLoading(false);
      setPendingRedirect(null);
    }
  };

  const handleDemoLogin = async (demoType: 'admin' | 'client' | 'technician') => {
    const credentials = DEMO_CREDENTIALS[demoType];
    setEmail(credentials.email);
    setPassword(credentials.password);
    setError('');
    setLoading(true);

    try {
      await signIn(credentials.email, credentials.password);
      // Le user sera mis à jour par signIn, on attendra le useEffect pour rediriger
      setPendingRedirect(demoType);
      // Si le user est déjà chargé (cas rare), rediriger immédiatement
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
    <div className="min-h-screen bg-gradient-to-br from-[#000033] via-[#001144] to-[#000033] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-[#33ffcc] opacity-10 rounded-full blur-3xl top-20 left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-[#66cccc] opacity-10 rounded-full blur-3xl bottom-20 right-20 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulaire de connexion */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Logo et titre */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src="/logo-client.png" alt="LocaGame" className="h-16 w-auto" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Connexion</h1>
              <p className="text-gray-400">Accédez à votre espace LOCAGAME</p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-5 h-5" />}
                placeholder="votre@email.com"
                required
                fullWidth
              />

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-5 h-5" />}
                  placeholder="••••••••"
                  required
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[42px] text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                leftIcon={<LogIn className="w-5 h-5" />}
              >
                Se connecter
              </Button>
            </form>

            {/* Lien mot de passe oublié */}
            <div className="mt-6 text-center">
              <button className="text-[#33ffcc] hover:text-[#66cccc] text-sm font-semibold transition-colors">
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          {/* Comptes de démonstration */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-2">
                Comptes de démonstration
              </h2>
              <p className="text-gray-400 mb-6">
                Testez les différentes interfaces avec un simple clic
              </p>

              <div className="space-y-4">
                {/* Admin */}
                <button
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="w-full p-5 bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/20 border-2 border-[#33ffcc]/30 rounded-2xl hover:border-[#33ffcc] transition-all duration-300 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#33ffcc]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserCog className="w-6 h-6 text-[#33ffcc]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">
                        Administrateur
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {DEMO_CREDENTIALS.admin.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#33ffcc] font-mono">
                          {DEMO_CREDENTIALS.admin.email}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">
                          {DEMO_CREDENTIALS.admin.password}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Client */}
                <button
                  onClick={() => handleDemoLogin('client')}
                  disabled={loading}
                  className="w-full p-5 bg-gradient-to-r from-[#66cccc]/20 to-[#33ffcc]/20 border-2 border-[#66cccc]/30 rounded-2xl hover:border-[#66cccc] transition-all duration-300 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#66cccc]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-[#66cccc]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">Client</h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {DEMO_CREDENTIALS.client.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#66cccc] font-mono">
                          {DEMO_CREDENTIALS.client.email}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">
                          {DEMO_CREDENTIALS.client.password}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Technicien */}
                <button
                  onClick={() => handleDemoLogin('technician')}
                  disabled={loading}
                  className="w-full p-5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-2 border-orange-500/30 rounded-2xl hover:border-orange-500 transition-all duration-300 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Truck className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">
                        Technicien
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {DEMO_CREDENTIALS.technician.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-orange-400 font-mono">
                          {DEMO_CREDENTIALS.technician.email}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">
                          {DEMO_CREDENTIALS.technician.password}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Retour au site */}
            <div className="text-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                ← Retour au site vitrine
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
