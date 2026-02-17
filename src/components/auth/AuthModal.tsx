import { useState } from 'react';
import { X, Heart, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../ui';

type Tab = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userId: string) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  if (!isOpen) return null;

  const resetForms = () => {
    setError('');
    setLoginEmail('');
    setLoginPassword('');
    setRegisterData({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setRegisterSuccess(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setError('');
    setRegisterSuccess(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      // signIn sets user in AuthContext, FavoritesContext will detect the change
      // We need the user id - get it after signIn succeeds
      // The onAuthSuccess callback is handled by FavoritesContext watching user changes
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = registerData;

    if (!firstName || !lastName || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signUp(email, password, {
        firstName,
        lastName,
        phone: registerData.phone,
      });
      // signUp may or may not auto-login depending on email confirmation settings
      // Show success message - FavoritesContext handles pendingProductId via localStorage
      setRegisterSuccess(true);
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setError('Cette adresse email est déjà utilisée. Connectez-vous !');
      } else {
        setError(err.message || 'Erreur lors de la création du compte');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Registration success screen
  if (registerSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
        <div className="bg-gradient-to-br from-[#001144] to-[#000033] border border-white/15 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 bg-[#33ffcc]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#33ffcc]" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Vérifiez votre email</h3>
          <p className="text-gray-400 text-sm mb-6">
            Un email de confirmation a été envoyé. Après confirmation, connectez-vous et votre produit sera automatiquement ajouté à vos favoris.
          </p>
          <Button variant="primary" fullWidth onClick={handleClose}>
            Compris
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-gradient-to-br from-[#001144] to-[#000033] border border-white/15 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-white/10">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#fe1979]/20 rounded-xl">
              <Heart className="w-6 h-6 text-[#fe1979] fill-[#fe1979]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Sauvegardez vos coups de coeur</h2>
              <p className="text-sm text-gray-400">Créez un compte pour retrouver vos favoris</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
              tab === 'login'
                ? 'text-[#33ffcc] border-b-2 border-[#33ffcc]'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Connexion
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
              tab === 'register'
                ? 'text-[#33ffcc] border-b-2 border-[#33ffcc]'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Inscription
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Forms */}
        <div className="p-6">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                label="Email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="votre@email.com"
                autoComplete="email"
                required
                fullWidth
              />
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Mot de passe"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  required
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" variant="primary" size="md" fullWidth isLoading={loading} leftIcon={<LogIn className="w-4 h-4" />}>
                Se connecter
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  name="firstName"
                  label="Prénom"
                  value={registerData.firstName}
                  onChange={handleRegisterChange}
                  leftIcon={<User className="w-4 h-4" />}
                  placeholder="Jean"
                  autoComplete="given-name"
                  required
                  fullWidth
                />
                <Input
                  type="text"
                  name="lastName"
                  label="Nom"
                  value={registerData.lastName}
                  onChange={handleRegisterChange}
                  leftIcon={<User className="w-4 h-4" />}
                  placeholder="Dupont"
                  autoComplete="family-name"
                  required
                  fullWidth
                />
              </div>
              <Input
                type="email"
                name="email"
                label="Email"
                value={registerData.email}
                onChange={handleRegisterChange}
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="votre@email.com"
                autoComplete="email"
                required
                fullWidth
              />
              <Input
                type="tel"
                name="phone"
                label="Téléphone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                leftIcon={<Phone className="w-4 h-4" />}
                placeholder="06 12 34 56 78"
                autoComplete="tel"
                fullWidth
              />
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Mot de passe"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  leftIcon={<Lock className="w-4 h-4" />}
                  placeholder="Minimum 6 caractères"
                  autoComplete="new-password"
                  required
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                label="Confirmer"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="Retapez le mot de passe"
                autoComplete="new-password"
                required
                fullWidth
              />
              <Button type="submit" variant="primary" size="md" fullWidth isLoading={loading} leftIcon={<UserPlus className="w-4 h-4" />}>
                Créer mon compte
              </Button>
              <p className="text-gray-500 text-[11px] text-center leading-relaxed">
                En créant un compte, vous acceptez nos Conditions Générales et notre Politique de Confidentialité.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
