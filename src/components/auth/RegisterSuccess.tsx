import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../ui';

interface RegisterSuccessProps {
  email: string;
}

export default function RegisterSuccess({ email }: RegisterSuccessProps) {
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
            Un email de confirmation a été envoyé à <span className="text-white font-semibold">{email}</span>.
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
