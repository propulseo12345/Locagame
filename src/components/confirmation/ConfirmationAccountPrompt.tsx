import { useState } from 'react';
import { UserPlus, CheckCircle, ClipboardList, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';

interface ConfirmationAccountPromptProps {
  guestEmail?: string;
}

export default function ConfirmationAccountPrompt({ guestEmail: _guestEmail }: ConfirmationAccountPromptProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (user) return null;

  const advantages = [
    { icon: ClipboardList, text: 'Suivez votre reservation en temps reel' },
    { icon: UserPlus, text: 'Coordonnees pre-remplies pour vos prochaines commandes' },
    { icon: Heart, text: 'Retrouvez vos favoris et votre historique' },
  ];

  return (
    <>
      <div className="bg-gradient-to-r from-[#33ffcc]/10 to-transparent rounded-2xl border border-[#33ffcc]/20 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#33ffcc]/15 rounded-xl flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-[#33ffcc]" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">Votre commande est confirmee !</h3>
            <p className="text-gray-400 text-sm mb-4">
              Creez un compte pour profiter de tous les avantages LOCAGAME :
            </p>
            <ul className="space-y-2 mb-5">
              {advantages.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-sm text-gray-300">
                  <Icon className="w-4 h-4 text-[#33ffcc] flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#000033] bg-[#33ffcc] hover:bg-[#2be6b8] rounded-xl transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Creer mon compte
            </button>
            <p className="text-gray-500 text-xs mt-3">
              Un email de confirmation a ete envoye a votre adresse.
            </p>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={() => setShowAuth(false)}
        defaultTab="register"
        title="Creez votre compte LOCAGAME"
        subtitle="Retrouvez vos reservations et vos favoris"
      />
    </>
  );
}
