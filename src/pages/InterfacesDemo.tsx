import { Link } from 'react-router-dom';

/**
 * DEV ONLY - This page is gated by VITE_ENABLE_DEMO_MODE in App.tsx.
 * In production, /demo redirects to /.
 */
export default function InterfacesDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#1a1b4b] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Interfaces LOCAGAME
          </h1>
          <p className="text-[#33ffcc] text-lg">
            Choisissez l'interface que vous souhaitez explorer
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Mode développement — données Supabase
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Bouton Admin */}
          <Link to="/admin/dashboard">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all cursor-pointer border border-[#33ffcc]/20 hover:border-[#33ffcc] group">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#33ffcc]/20 rounded-full flex items-center justify-center group-hover:bg-[#33ffcc]/30 transition-all">
                  <svg className="w-10 h-10 text-[#33ffcc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Interface Admin
                </h2>
                <p className="text-gray-300 mb-6">
                  Gestion complète de la plateforme : produits, réservations, clients et paramètres
                </p>
                <div className="flex items-center justify-center text-[#33ffcc] font-semibold">
                  Accéder au back-office
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Bouton Client */}
          <Link to="/client/dashboard">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all cursor-pointer border border-[#66cccc]/20 hover:border-[#66cccc] group">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#66cccc]/20 rounded-full flex items-center justify-center group-hover:bg-[#66cccc]/30 transition-all">
                  <svg className="w-10 h-10 text-[#66cccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Espace Client
                </h2>
                <p className="text-gray-300 mb-6">
                  Suivi des réservations, gestion du profil, historique et favoris
                </p>
                <div className="flex items-center justify-center text-[#66cccc] font-semibold">
                  Accéder à mon compte
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
