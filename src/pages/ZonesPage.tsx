import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Truck, Clock, Euro, CheckCircle, XCircle, Sparkles, Navigation } from 'lucide-react';
import { deliveryZones } from '../utils/pricing';
import { SEO } from '../components/SEO';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';

export default function ZonesPage() {
  const [postalCode, setPostalCode] = useState('');
  const [searchResult, setSearchResult] = useState<{ found: boolean; zone?: any } | null>(null);

  const handleSearch = () => {
    if (!postalCode) return;

    const foundZone = deliveryZones.find(zone =>
      zone.postal_codes.includes(postalCode)
    );

    setSearchResult({
      found: !!foundZone,
      zone: foundZone
    });
  };

  // Breadcrumb pour le schema
  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://www.locagame.fr' },
    { name: 'Zones de livraison', url: 'https://www.locagame.fr/zones' }
  ];

  return (
    <>
      <SEO
        title="Zones de Livraison"
        description="Découvrez nos zones de livraison en région PACA : Marseille, Aix-en-Provence, Toulon, Nice et alentours. Livraison et installation de jeux pour événements."
        keywords="livraison jeux Marseille, location jeux PACA, livraison animation événement, zone livraison locagame"
        url="https://www.locagame.fr/zones"
      />
      <BreadcrumbSchema items={breadcrumbItems} />

    <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033]">
      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-10 w-2 h-2 bg-[#33ffcc] rounded-full animate-pulse"></div>
        <div className="absolute top-64 right-20 w-1 h-1 bg-[#66cccc] rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-[#33ffcc]/60 rounded-full animate-bounce"></div>
        <div className="absolute top-96 right-1/3 w-1 h-1 bg-[#66cccc]/80 rounded-full animate-pulse"></div>
        <div className="absolute bottom-64 right-1/4 w-2 h-2 bg-[#fe1979]/40 rounded-full animate-ping"></div>
      </div>

      <div className="relative pt-header">
        {/* Hero Section - Style Catalogue */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12 animate-fade-in">
            {/* Badge compteur */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/20 backdrop-blur-sm rounded-full border border-[#33ffcc]/30 mb-6">
              <MapPin className="w-5 h-5 text-[#33ffcc]" />
              <span className="friendly-badge text-2xl text-[#33ffcc]">{deliveryZones.length}</span>
              <span className="text-white font-semibold">zones de livraison</span>
            </div>

            {/* Titre principal */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Zones de <span className="gradient-text">Livraison</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Nous livrons dans toute la région PACA avec installation professionnelle. Livraison hors PACA possible sur demande.
            </p>

            {/* Recherche de code postal - Hero */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <label className="block text-sm font-bold text-white mb-3 text-left">
                    Vérifiez votre code postal
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="13001"
                        maxLength={5}
                        className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#33ffcc] focus:border-[#33ffcc] focus:outline-none transition-all duration-300 font-semibold text-lg"
                      />
                      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      Vérifier
                    </button>
                  </div>

                  {/* Résultat de recherche */}
                  {searchResult && (
                    <div className={`mt-4 p-4 rounded-xl backdrop-blur-sm border animate-fade-in ${
                      searchResult.found
                        ? 'bg-[#33ffcc]/10 border-[#33ffcc]/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      {searchResult.found ? (
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-[#33ffcc] flex-shrink-0 mt-0.5" />
                          <div className="flex-1 text-left">
                            <h4 className="font-bold text-white mb-1">
                              ✓ Livraison disponible dans {searchResult.zone.name}
                            </h4>
                            <div className="text-sm text-gray-300 space-y-1">
                              <p>• Frais de livraison : <span className="font-bold text-[#33ffcc] text-2xl">{searchResult.zone.delivery_fee}€</span> de base</p>
                              {(searchResult.zone.name === 'Marseille Centre' || searchResult.zone.name === 'Marseille Périphérie') && (
                                <p className="text-xs text-orange-400">• Frais kilométriques en supplément</p>
                              )}
                              {searchResult.zone.free_delivery_threshold && (
                                <p>• Livraison gratuite dès <span className="font-bold text-[#66cccc] text-2xl">{searchResult.zone.free_delivery_threshold}€</span></p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 text-left">
                            <h4 className="font-bold text-white mb-1">
                              Zone non couverte
                            </h4>
                            <p className="text-sm text-gray-300">
                              Ce code postal n'est pas dans nos zones de livraison standard. Livraison possible sur demande - contactez-nous pour un devis personnalisé.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Carte visuelle - Redesignée */}
          <div className="mb-16 animate-fade-in-delay">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#33ffcc]/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#66cccc]/5 rounded-full blur-3xl"></div>

              <div className="relative">
                <h2 className="text-3xl font-black text-white mb-6 text-center flex items-center justify-center gap-3">
                  <MapPin className="w-8 h-8 text-[#33ffcc]" />
                  Carte de couverture
                </h2>

                {/* Carte Google Maps avec marqueur entrepôt */}
                <div className="relative rounded-2xl border border-[#33ffcc]/20 overflow-hidden">
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      title="Carte de couverture - PACA - Entrepôt LOCAGAME"
                      src="https://www.google.com/maps?q=553+rue+Saint+Pierre,+13012+Marseille,+France&output=embed&z=9"
                      className="absolute inset-0 w-full h-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  {/* Légende entrepôt */}
                  <div className="absolute bottom-4 left-4 bg-[#000033]/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#33ffcc]/30">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#33ffcc]" />
                      <span className="text-sm text-white font-medium">Entrepôt : 553 rue St Pierre, 13012 Marseille</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Informations complémentaires - Redesignées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Conditions de livraison */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#33ffcc]/20 rounded-xl border border-[#33ffcc]/30">
                  <Truck className="w-6 h-6 text-[#33ffcc]" />
                </div>
                <h3 className="text-2xl font-black text-white">Conditions de livraison</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <CheckCircle className="w-5 h-5 text-[#33ffcc] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Livraison rapide</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Commande traitée sous 48h. Livraison le jour de votre événement.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <CheckCircle className="w-5 h-5 text-[#66cccc] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Équipe professionnelle</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Installation complète par nos équipes formées et expérimentées.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <CheckCircle className="w-5 h-5 text-[#33ffcc] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Matériel garanti</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Tous nos jeux sont contrôlés et nettoyés avant chaque location.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Zones non couvertes / Alternatives */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 animate-fade-in-delay">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#fe1979]/20 rounded-xl border border-[#fe1979]/30">
                  <MapPin className="w-6 h-6 text-[#fe1979]" />
                </div>
                <h3 className="text-2xl font-black text-white">Informations importantes</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20">
                  <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Hors région PACA</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Livraison possible sur demande. Contactez-nous pour un devis personnalisé.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20">
                  <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Retrait sur place</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Retrait gratuit possible dans nos locaux au 553 rue St Pierre, 13012 Marseille.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[#33ffcc]/5 rounded-xl border border-[#33ffcc]/20">
                  <Clock className="w-5 h-5 text-[#33ffcc] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Délai minimum</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Réservation minimum 48h avant votre événement recommandée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final - Redesigné */}
          <div className="relative overflow-hidden rounded-2xl animate-fade-in-delay-2">
            <div className="absolute inset-0 bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/20 backdrop-blur-xl"></div>
            <div className="absolute inset-0 border border-[#33ffcc]/30 rounded-2xl"></div>
            <div className="relative p-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fe1979]/20 backdrop-blur-sm rounded-full border border-[#fe1979]/30 mb-6">
                <Sparkles className="w-4 h-4 text-[#fe1979]" />
                <span className="text-[#fe1979] font-bold text-sm">Besoin d'aide ?</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Une question sur la livraison ?
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Notre équipe est disponible pour répondre à toutes vos questions
                et vous accompagner dans votre projet
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105"
                >
                  Nous contacter
                </Link>
                <Link
                  to="/catalogue"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#33ffcc] text-[#33ffcc] font-bold rounded-xl hover:bg-[#33ffcc] hover:text-[#000033] transition-all duration-300 hover:scale-105"
                >
                  Voir le catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
