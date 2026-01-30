import { Search, Calendar, Truck, PartyPopper, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ScrollReveal } from './ui';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Choisissez',
    description: 'Parcourez notre catalogue et sélectionnez vos jeux'
  },
  {
    icon: Calendar,
    number: '02',
    title: 'Réservez',
    description: 'Vérifiez les disponibilités et réservez en ligne'
  },
  {
    icon: Truck,
    number: '03',
    title: 'Recevez',
    description: 'Livraison PACA ou retrait gratuit à Marseille'
  },
  {
    icon: PartyPopper,
    number: '04',
    title: 'Jouez !',
    description: 'Profitez de votre événement, on gère le reste'
  }
];

export function HowItWorks() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const isStepsInView = useInView(stepsRef, { once: true, amount: 0.3 });

  // Variantes pour les étapes
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] relative overflow-hidden">
      {/* Accent décoratif */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#33ffcc]/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <ScrollReveal animation="fadeUp">
            <p className="text-[#33ffcc] text-sm font-semibold uppercase tracking-wider mb-4">
              Simple & rapide
            </p>
          </ScrollReveal>
          <ScrollReveal animation="fadeUp" delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Comment ça marche ?
            </h2>
          </ScrollReveal>
        </div>

        {/* Steps - Desktop */}
        <div className="hidden lg:block" ref={stepsRef}>
          <div className="relative">
            {/* Ligne de connexion animée */}
            <motion.div
              className="absolute top-12 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-[#33ffcc]/0 via-[#33ffcc]/30 to-[#33ffcc]/0 origin-left"
              variants={lineVariants}
              initial="hidden"
              animate={isStepsInView ? 'visible' : 'hidden'}
            />

            <motion.div
              className="grid grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate={isStepsInView ? 'visible' : 'hidden'}
            >
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    className="relative text-center group"
                    variants={stepVariants}
                  >
                    {/* Icône */}
                    <div className="relative inline-flex mb-8">
                      <motion.div
                        className="w-24 h-24 bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-2xl flex items-center justify-center group-hover:bg-[#33ffcc]/20 group-hover:border-[#33ffcc]/50 transition-all duration-300"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="w-10 h-10 text-[#33ffcc]" />
                      </motion.div>
                      {/* Numéro */}
                      <motion.span
                        className="absolute -top-2 -right-2 w-8 h-8 bg-[#33ffcc] text-[#000033] text-sm font-bold rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={isStepsInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ delay: 0.3 + index * 0.15, duration: 0.3, type: 'spring' }}
                      >
                        {index + 1}
                      </motion.span>
                    </div>

                    {/* Contenu */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#33ffcc] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Steps - Mobile */}
        <motion.div
          className="lg:hidden space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                className="flex items-start gap-5 group"
                variants={stepVariants}
              >
                {/* Icône + ligne */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-14 h-14 bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-[#33ffcc]" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#33ffcc] text-[#000033] text-xs font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-[2px] h-8 bg-gradient-to-b from-[#33ffcc]/30 to-transparent mt-3" />
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 pb-2">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <ScrollReveal animation="scale" delay={0.2}>
          <div className="mt-20 text-center">
            <p className="text-gray-400 mb-6">
              Plus de <span className="text-white font-semibold">2000 événements</span> organisés avec succès
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
