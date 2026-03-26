import { useState } from 'react';
import { UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';

export function GuestAccountBanner() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');

  if (user) return null;

  return (
    <>
      <div className="rounded-xl border-l-4 border-[#33ffcc] bg-[#33ffcc]/5 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#33ffcc]/15 rounded-lg flex-shrink-0">
            <UserPlus className="w-5 h-5 text-[#33ffcc]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1">Creez un compte pour aller plus vite</h3>
            <p className="text-gray-400 text-xs mb-3">
              Coordonnées pré-remplies, suivi de commande en temps réel et historique de vos reservations.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setShowAuth(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setShowAuth(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#000033] bg-[#33ffcc] hover:bg-[#2be6b8] rounded-lg transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Creer un compte
              </button>
              <span className="text-gray-500 text-xs flex items-center gap-1 ml-1">
                Continuer sans compte <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={() => setShowAuth(false)}
        defaultTab={authTab}
        title="Finalisez votre commande"
        subtitle="Connectez-vous pour pre-remplir vos informations"
      />
    </>
  );
}
