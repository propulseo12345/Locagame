import { Link } from 'react-router-dom';
import { Users, Award, Heart, MapPin, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';

export default function AProposPage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://www.locagame.fr' },
    { name: 'À propos', url: 'https://www.locagame.fr/a-propos' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header">
      <SEO
        title="À propos de LOCAGAME | Location de jeux en PACA"
        description="Découvrez LOCAGAME, spécialiste de la location de jeux événementiels en région PACA : Marseille, Aix-en-Provence, Nice et Toulon. Plus de 2000 événements réussis depuis 2015."
        canonical="https://www.locagame.fr/a-propos"
        url="https://www.locagame.fr/a-propos"
        keywords="locagame, location jeux PACA, animation événement Marseille, à propos locagame"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-10 w-2 h-2 bg-[#33ffcc] rounded-full animate-pulse"></div>
        <div className="absolute top-64 right-20 w-1 h-1 bg-[#66cccc] rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-[#33ffcc]/60 rounded-full animate-bounce"></div>
      </div>

      <div className="relative py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-full mb-6">
              <Heart className="w-5 h-5 text-[#33ffcc]" />
              <span className="text-[#33ffcc] font-semibold">Depuis 2015</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              À propos de <span className="gradient-text">LOCAGAME</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Spécialiste de la location de jeux et animations pour vos événements en région PACA
            </p>
          </div>

          {/* Story Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Notre histoire</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Fondée en 2015 à Marseille, <strong className="text-[#33ffcc]">LOCAGAME - Poker Agency®</strong> est née d'une passion pour les jeux et l'animation d'événements. Notre mission : rendre vos moments de fête inoubliables grâce à une sélection unique de jeux variés, rares et insolites.
              </p>
              <p>
                Depuis nos débuts, nous avons accompagné plus de <strong className="text-[#33ffcc]">2000 événements</strong> en région Provence-Alpes-Côte d'Azur : mariages, anniversaires, séminaires d'entreprise, festivals, kermesses et bien plus encore.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center group hover:border-[#33ffcc]/30 transition-all duration-300">
              <div className="w-16 h-16 bg-[#33ffcc]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#33ffcc] transition-colors duration-300">
                <Award className="w-8 h-8 text-[#33ffcc] group-hover:text-[#000033]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Qualité premium</h3>
              <p className="text-gray-400">Matériel professionnel entretenu et vérifié avant chaque location</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center group hover:border-[#33ffcc]/30 transition-all duration-300">
              <div className="w-16 h-16 bg-[#33ffcc]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#33ffcc] transition-colors duration-300">
                <Users className="w-8 h-8 text-[#33ffcc] group-hover:text-[#000033]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Service personnalisé</h3>
              <p className="text-gray-400">Une équipe à votre écoute pour vous conseiller et vous accompagner</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center group hover:border-[#33ffcc]/30 transition-all duration-300">
              <div className="w-16 h-16 bg-[#33ffcc]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#33ffcc] transition-colors duration-300">
                <MapPin className="w-8 h-8 text-[#33ffcc] group-hover:text-[#000033]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Couverture PACA</h3>
              <p className="text-gray-400">Livraison et installation dans toute la région, hors PACA sur demande</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-[#33ffcc]/10 to-[#66cccc]/10 backdrop-blur-sm rounded-2xl p-8 border border-[#33ffcc]/20 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#33ffcc] mb-2">200+</div>
                <div className="text-gray-400">Jeux disponibles</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#33ffcc] mb-2">2000+</div>
                <div className="text-gray-400">Événements</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#33ffcc] mb-2">98%</div>
                <div className="text-gray-400">Satisfaction</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#33ffcc] mb-2">10 ans</div>
                <div className="text-gray-400">D'expérience</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Prêt à organiser votre événement ?</h3>
            <p className="text-gray-400 mb-6">Découvrez notre catalogue ou contactez-nous pour un devis personnalisé</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalogue" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
                Explorer le catalogue
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/contact" className="btn-outline text-lg px-8 py-4 inline-flex items-center justify-center">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
