import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/ui';
import { Lock, Mail, Eye, EyeOff, AlertCircle, UserPlus, User, Phone, ArrowLeft, Check } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      setSuccess(true);
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setError('Cette adresse email est déjà utilisée');
      } else {
        setError(err.message || 'Erreur lors de la création du compte');
      }
    } finally {
      setLoading(false);
    }
  };

  // Affichage du succès
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] via-[#001144] to-[#000033] flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-[#33ffcc] opacity-10 rounded-full blur-3xl top-20 left-20 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-[#66cccc] opacity-10 rounded-full blur-3xl bottom-20 right-20 animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-4">Compte créé avec succès !</h1>
            <p className="text-gray-400 mb-6">
              Un email de confirmation a été envoyé à <span className="text-white font-semibold">{formData.email}</span>.
              <br />
              Veuillez vérifier votre boîte de réception pour activer votre compte.
            </p>
            <div className="space-y-3">
              <Link to="/login">
                <Button variant="primary" size="lg" fullWidth>
                  Se connecter
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="lg" fullWidth>
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] via-[#001144] to-[#000033] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-[#33ffcc] opacity-10 rounded-full blur-3xl top-20 left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-[#66cccc] opacity-10 rounded-full blur-3xl bottom-20 right-20 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Retour */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>

          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/logo-client.png" alt="LocaGame" className="h-16 w-auto" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Créer un compte</h1>
            <p className="text-gray-400">Rejoignez LOCAGAME pour gérer vos réservations</p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                name="firstName"
                label="Prénom *"
                value={formData.firstName}
                onChange={handleChange}
                leftIcon={<User className="w-5 h-5" />}
                placeholder="Jean"
                autoComplete="given-name"
                required
                fullWidth
              />
              <Input
                type="text"
                name="lastName"
                label="Nom *"
                value={formData.lastName}
                onChange={handleChange}
                leftIcon={<User className="w-5 h-5" />}
                placeholder="Dupont"
                autoComplete="family-name"
                required
                fullWidth
              />
            </div>

            <Input
              type="email"
              name="email"
              label="Email *"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="w-5 h-5" />}
              placeholder="votre@email.com"
              autoComplete="email"
              required
              fullWidth
            />

            <Input
              type="tel"
              name="phone"
              label="Téléphone"
              value={formData.phone}
              onChange={handleChange}
              leftIcon={<Phone className="w-5 h-5" />}
              placeholder="06 12 34 56 78"
              autoComplete="tel"
              fullWidth
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Mot de passe *"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<Lock className="w-5 h-5" />}
                placeholder="Minimum 6 caractères"
                autoComplete="new-password"
                required
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                label="Confirmer le mot de passe *"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={<Lock className="w-5 h-5" />}
                placeholder="Retapez votre mot de passe"
                autoComplete="new-password"
                required
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[42px] text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                leftIcon={<UserPlus className="w-5 h-5" />}
              >
                Créer mon compte
              </Button>
            </div>
          </form>

          {/* Mentions légales */}
          <p className="mt-6 text-gray-500 text-xs text-center">
            En créant un compte, vous acceptez nos{' '}
            <Link to="/cgv" className="text-[#33ffcc] hover:underline">
              Conditions Générales
            </Link>{' '}
            et notre{' '}
            <Link to="/confidentialite" className="text-[#33ffcc] hover:underline">
              Politique de Confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
