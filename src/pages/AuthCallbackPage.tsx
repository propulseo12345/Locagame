import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Supabase (detectSessionInUrl: true) parse automatiquement le token dans l'URL
    // On ecoute le changement d'etat auth pour savoir si la confirmation a reussi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success');
        // Redirection vers le dashboard client apres 2s
        setTimeout(() => navigate('/client/dashboard', { replace: true }), 2000);
      } else if (event === 'USER_UPDATED' && session) {
        // Email confirme sur un compte existant
        setStatus('success');
        setTimeout(() => navigate('/client/dashboard', { replace: true }), 2000);
      }
    });

    // Verifier si une erreur est presente dans l'URL (#error=...)
    const hash = window.location.hash;
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.slice(1));
      const error = params.get('error_description') || params.get('error') || 'Lien de confirmation invalide ou expire';
      setErrorMessage(decodeURIComponent(error));
      setStatus('error');
    }

    // Timeout de securite : si rien ne se passe apres 8s, afficher une erreur
    const timeout = setTimeout(() => {
      setStatus(prev => {
        if (prev === 'loading') {
          setErrorMessage('La confirmation a pris trop de temps. Veuillez reessayer.');
          return 'error';
        }
        return prev;
      });
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] via-[#001144] to-[#000033] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">

        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-[#33ffcc] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-black text-white mb-2">Confirmation en cours...</h2>
            <p className="text-gray-400">Validation de votre adresse email</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-[#33ffcc] mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Email confirme !</h2>
            <p className="text-gray-400 mb-1">Votre compte est actif.</p>
            <p className="text-gray-500 text-sm">Redirection vers votre espace client...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Lien invalide</h2>
            <p className="text-gray-400 mb-4 text-sm">{errorMessage}</p>
            <button
              onClick={() => navigate('/inscription', { replace: true })}
              className="px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-colors"
            >
              Creer un nouveau compte
            </button>
          </>
        )}

      </div>
    </div>
  );
}
