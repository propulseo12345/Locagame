import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] via-[#001144] to-[#000033] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#33ffcc]/20 rounded-full flex items-center justify-center">
              <SearchX className="w-10 h-10 text-[#33ffcc]" />
            </div>
          </div>

          <h1 className="text-5xl font-black text-white mb-2">404</h1>
          <h2 className="text-xl font-semibold text-white/80 mb-4">
            Page introuvable
          </h2>

          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            La page que vous recherchez n'existe pas ou a été déplacée.
            Vérifiez l'adresse ou retournez à l'accueil.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] rounded-xl hover:bg-[#66cccc] transition-all duration-300 font-semibold"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
