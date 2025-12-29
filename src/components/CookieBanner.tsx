import { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart3, Settings } from 'lucide-react';

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Petit délai pour une meilleure UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allAccepted);
  };

  const acceptNecessary = () => {
    saveConsent(defaultPreferences);
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
      {/* Overlay subtil */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" style={{ height: '200%', bottom: 0 }} />

      {/* Bandeau principal */}
      <div className="relative bg-gradient-to-r from-[#000033] via-[#000044] to-[#000033] border-t border-[#33ffcc]/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {!showDetails ? (
            /* Vue compacte */
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Icône et texte */}
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#33ffcc]/10 flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-[#33ffcc]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    Nous respectons votre vie privée
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu.
                    Vous pouvez accepter tous les cookies ou personnaliser vos préférences.{' '}
                    <a
                      href="/confidentialite"
                      className="text-[#33ffcc] hover:underline inline-flex items-center gap-1"
                    >
                      En savoir plus
                    </a>
                  </p>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-[#33ffcc]/50 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Personnaliser
                </button>
                <button
                  onClick={acceptNecessary}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200"
                >
                  Refuser
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2.5 text-sm font-semibold text-[#000033] bg-[#33ffcc] hover:bg-[#66ffdd] rounded-lg transition-all duration-200 shadow-lg shadow-[#33ffcc]/20"
                >
                  Accepter tout
                </button>
              </div>
            </div>
          ) : (
            /* Vue détaillée */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cookie className="w-6 h-6 text-[#33ffcc]" />
                  <h3 className="text-white font-semibold text-lg">Gérer vos préférences de cookies</h3>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {/* Cookies nécessaires */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#33ffcc]" />
                      <span className="text-white font-medium">Nécessaires</span>
                    </div>
                    <div className="px-2 py-1 bg-[#33ffcc]/20 text-[#33ffcc] text-xs font-medium rounded">
                      Toujours actifs
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Essentiels au fonctionnement du site. Ils permettent la navigation et l'accès aux zones sécurisées.
                  </p>
                </div>

                {/* Cookies analytiques */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Analytiques</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#33ffcc]"></div>
                    </label>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Nous aident à comprendre comment vous utilisez le site pour améliorer nos services.
                  </p>
                </div>

                {/* Cookies marketing */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Cookie className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Marketing</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#33ffcc]"></div>
                    </label>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Permettent de vous proposer des offres personnalisées et pertinentes.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={acceptNecessary}
                  className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200"
                >
                  Refuser tout
                </button>
                <button
                  onClick={savePreferences}
                  className="px-6 py-2.5 text-sm font-semibold text-[#000033] bg-[#33ffcc] hover:bg-[#66ffdd] rounded-lg transition-all duration-200 shadow-lg shadow-[#33ffcc]/20"
                >
                  Enregistrer mes choix
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
