import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ConfirmationActions() {
  return (
    <div className="flex gap-4">
      <Link
        to="/catalogue"
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour au catalogue
      </Link>
      <Link
        to="/"
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
      >
        Accueil
      </Link>
    </div>
  );
}
