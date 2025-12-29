import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ui';

export function About() {
  return (
    <section className="relative py-20 md:py-28 bg-[#000033] overflow-hidden">
      {/* Éléments décoratifs subtils */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#33ffcc]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#66cccc]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête centré */}
        <div className="text-center mb-16">
          <ScrollReveal animation="fadeUp" delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33ffcc]/10 border border-[#33ffcc]/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-[#33ffcc] rounded-full animate-pulse" />
              <span className="text-[#33ffcc] text-sm font-semibold uppercase tracking-wider">Depuis 2015 en région PACA</span>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeUp" delay={0.1}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Location de jeux pour événements
              <span className="block gradient-text mt-1">privés et professionnels</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fadeUp" delay={0.2}>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              LOCAGAME, votre service de location de jeux variés en retrait sur Marseille ou en livraison
            </p>
          </ScrollReveal>
        </div>

        {/* Contenu en 2 colonnes */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Colonne gauche - Citation + Paragraphes */}
          <StaggerContainer staggerDelay={0.15} className="space-y-8">
            {/* Citation */}
            <StaggerItem animation="fadeRight">
              <blockquote className="relative pl-6 border-l-4 border-[#33ffcc]">
                <p className="text-2xl md:text-3xl text-white font-bold italic leading-relaxed">
                  "Ce soir, je commande une pizza et un baby-foot géant !"
                </p>
              </blockquote>
            </StaggerItem>

            {/* Paragraphes */}
            <StaggerItem animation="fadeUp">
              <p className="text-lg text-gray-300 leading-relaxed">
                Aussi simple que de se faire livrer ses courses ou son plat préféré.
                Désormais, il est possible de <span className="text-[#33ffcc] font-semibold">réserver un jeu</span> pour
                s'amuser en solo ou avec ses amis.
              </p>
            </StaggerItem>

            <StaggerItem animation="fadeUp">
              <p className="text-lg text-gray-300 leading-relaxed">
                LOCAGAME c'est simple, ça se résume en 2 étapes : <span className="text-white font-bold">« Loue & Joue ! »</span> La
                location de jeux variés, rares, insolites et démesurés, avec ou sans livraison.
              </p>
            </StaggerItem>

            <StaggerItem animation="fadeUp">
              <p className="text-lg text-gray-300 leading-relaxed">
                De la location d'une simple boule de pétanque à la livraison d'un baby-foot géant,
                voire même d'un simulateur de ski, particuliers et professionnels ont besoin de jeux
                pour divertir leurs invités lors de moments spéciaux.
              </p>
            </StaggerItem>
          </StaggerContainer>

          {/* Colonne droite - Occasions + CTA */}
          <StaggerContainer staggerDelay={0.2} className="space-y-8">
            {/* Célébrations privées */}
            <StaggerItem animation="fadeLeft">
              <div className="bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl p-6 border border-white/10 hover:border-[#33ffcc]/30 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#33ffcc] mb-3 flex items-center gap-3">
                  <span className="w-10 h-[2px] bg-[#33ffcc]" />
                  Célébrations privées
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Mariages, baptêmes, anniversaires, bar mitzvah, EVG/EVJF, baby shower,
                  remise de prix, vacances, week-ends entre amis...
                </p>
              </div>
            </StaggerItem>

            {/* Événements d'entreprise */}
            <StaggerItem animation="fadeLeft">
              <div className="bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl p-6 border border-white/10 hover:border-[#33ffcc]/30 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#33ffcc] mb-3 flex items-center gap-3">
                  <span className="w-10 h-[2px] bg-[#33ffcc]" />
                  Événements d'entreprise
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Séminaires, inaugurations, team building, soirées CE/CSE,
                  arbres de Noël, conférences, journées d'intégration, afterwork...
                </p>
              </div>
            </StaggerItem>

            {/* Conclusion + CTA */}
            <StaggerItem animation="scale">
              <div className="pt-4">
                <p className="text-xl text-white font-semibold mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#33ffcc]" />
                  Tant d'opportunités pour s'amuser avec LOCAGAME !
                </p>
                <Link
                  to="/catalogue"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105 group"
                >
                  Explorer le catalogue
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
