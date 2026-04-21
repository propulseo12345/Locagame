import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ROUTES } from '../constants/routes';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let resolved = false;

    const markReady = () => {
      if (resolved) return;
      resolved = true;
      setStatus('ready');
    };

    // Écouter les événements auth.
    // PASSWORD_RECOVERY peut arriver AVANT ou APRÈS l'enregistrement du listener
    // selon le timing de _initialize() du SDK Supabase.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (resolved) return;

      if (event === 'PASSWORD_RECOVERY') {
        markReady();
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // PASSWORD_RECOVERY a peut-être déjà été émis avant l'enregistrement du listener.
        // On vérifie si le hash contient type=recovery ET qu'une session existe.
        if (session && window.location.hash.includes('type=recovery')) {
          markReady();
        }
      }
    });

    // Vérifier immédiatement le hash — couvre le cas où TOUS les événements
    // ont déjà été émis avant que cet effet ne s'exécute.
    const hash = window.location.hash;

    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.slice(1));
      const error = params.get('error_description') || params.get('error') || 'Lien invalide ou expiré';
      setErrorMessage(decodeURIComponent(error));
      setStatus('error');
      resolved = true;
    } else if (hash.includes('type=recovery')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) markReady();
      });
    }

    // Timeout de sécurité — augmenté à 10s pour les connexions lentes
    const timeout = setTimeout(() => {
      if (!resolved) {
        setStatus(prev => {
          if (prev === 'loading') {
            setErrorMessage('Le lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.');
            return 'error';
          }
          return prev;
        });
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 8) {
      setFormError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus('success');
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 3000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] via-[#001144] to-[#000033] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#33ffcc]/20 via-transparent to-[#66cccc]/20 rounded-3xl blur-xl" />

          <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-[#33ffcc]/30 blur-2xl rounded-full" />
                <div className="relative bg-gradient-to-br from-[#001133] to-[#000022] p-3 rounded-2xl border border-white/10">
                  <Gamepad2 className="w-10 h-10 text-[#33ffcc]" />
                </div>
              </div>
            </div>

            {status === 'loading' && (
              <div className="text-center py-6">
                <Loader2 className="w-12 h-12 text-[#33ffcc] mx-auto mb-4 animate-spin" />
                <h2 className="text-xl font-bold text-white mb-2">Vérification en cours...</h2>
                <p className="text-white/50 text-sm">Validation de votre lien de réinitialisation</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Lien invalide</h2>
                <p className="text-white/50 text-sm mb-6">{errorMessage}</p>
                <button
                  onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
                  className="px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-colors"
                >
                  Retour à la connexion
                </button>
              </div>
            )}

            {status === 'ready' && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-white mb-2">Nouveau mot de passe</h2>
                  <p className="text-white/50 text-sm">Choisissez un nouveau mot de passe pour votre compte</p>
                </div>

                {formError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400/80 text-sm">{formError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Nouveau mot de passe</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 caractères"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 focus:border-[#33ffcc]/50 focus:outline-none focus:ring-1 focus:ring-[#33ffcc]/30 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Confirmer le mot de passe</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Retapez votre mot de passe"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 focus:border-[#33ffcc]/50 focus:outline-none focus:ring-1 focus:ring-[#33ffcc]/30 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Mettre à jour le mot de passe
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {status === 'success' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#33ffcc]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#33ffcc]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Mot de passe mis à jour !</h2>
                <p className="text-white/50 text-sm mb-2">Votre mot de passe a été modifié avec succès.</p>
                <p className="text-white/30 text-xs">Redirection vers la page de connexion...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
