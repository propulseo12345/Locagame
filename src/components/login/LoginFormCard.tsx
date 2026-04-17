import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, UserPlus, Sparkles, Gamepad2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { GlowInput } from './GlowInput';
import { SubmitButton } from './SubmitButton';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormCardProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Main login form card with header, error display, form fields,
 * forgot password link, and register CTA.
 */
export function LoginFormCard({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  loading,
  onSubmit,
}: LoginFormCardProps) {
  const { resetPasswordForEmail } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetError('Veuillez entrer votre adresse email');
      return;
    }
    setResetError('');
    setResetLoading(true);
    try {
      await resetPasswordForEmail(resetEmail);
      setResetSuccess(true);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  return (
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
            {showForgotPassword ? 'Mot de passe oublié' : 'Bienvenue'}
          </h1>
          <p className="text-white/50 text-lg">
            {showForgotPassword
              ? 'Entrez votre email pour recevoir un lien de réinitialisation'
              : (
                <>
                  Connectez-vous à votre espace{' '}
                  <span className="bg-gradient-to-r from-[#33ffcc] to-[#66cccc] bg-clip-text text-transparent font-semibold">
                    LOCAGAME
                  </span>
                </>
              )
            }
          </p>
        </div>

        {showForgotPassword ? (
          <>
            {/* Reset success */}
            {resetSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#33ffcc]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#33ffcc]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Email envoyé !</h3>
                <p className="text-white/60 text-sm mb-6">
                  Si un compte existe avec l'adresse <strong className="text-white/80">{resetEmail}</strong>,
                  vous recevrez un email avec un lien de réinitialisation.
                </p>
                <p className="text-white/40 text-xs mb-8">
                  Vérifiez votre dossier spam si vous ne le voyez pas dans les prochaines minutes.
                </p>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="inline-flex items-center gap-2 text-[#33ffcc] hover:text-[#66cccc] transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <>
                {/* Reset error */}
                {resetError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-red-400 font-medium">Erreur</p>
                        <p className="text-red-400/70 text-sm mt-1">{resetError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset form */}
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <GlowInput
                    type="email"
                    label="Adresse email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    icon={Mail}
                    placeholder="votre@email.com"
                    autoComplete="email"
                    required
                  />

                  <SubmitButton loading={resetLoading}>
                    Envoyer le lien de réinitialisation
                  </SubmitButton>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="inline-flex items-center gap-2 text-white/50 hover:text-[#33ffcc] transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la connexion
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
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
            <form onSubmit={onSubmit} className="space-y-6">
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
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetEmail(email);
                  }}
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
          </>
        )}
      </div>
    </div>
  );
}
