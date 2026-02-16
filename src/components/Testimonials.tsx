import { Star, Quote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ScrollReveal } from './ui';
import { TestimonialsService, type Testimonial } from '../services';

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const data = await TestimonialsService.getFeaturedTestimonials();
        setTestimonials(data);
      } catch (err: any) {
        const message = err?.message || 'Impossible de charger les avis';
        console.error('[Testimonials] Erreur:', err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  // Variantes d'animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <section className="py-24 bg-[#000033] relative overflow-hidden">
      {/* Accent décoratif */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#33ffcc]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <ScrollReveal animation="fadeUp">
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  className="flex"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                    >
                      <Star className="w-4 h-4 text-[#33ffcc] fill-current" />
                    </motion.div>
                  ))}
                </motion.div>
                <span className="text-gray-400 text-sm">4.9/5 sur Google</span>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fadeUp" delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Ce que disent nos clients
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal animation="fadeLeft" delay={0.2}>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-[#33ffcc] font-semibold hover:gap-4 transition-all duration-300"
            >
              Laisser un avis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>

        {/* Témoignages */}
        {error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-8 bg-white/[0.03] rounded-2xl border border-white/10">
                <div className="h-10 w-10 bg-white/5 rounded mb-6" />
                <div className="space-y-2 mb-8">
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded w-24" />
                    <div className="h-3 bg-white/5 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="relative bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl p-8 border border-white/10 hover:border-[#33ffcc]/30 transition-all duration-300"
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {/* Quote icon */}
              <Quote className="w-10 h-10 text-[#33ffcc]/20 mb-6" />

              {/* Texte */}
              <p className="text-gray-300 leading-relaxed mb-8">
                "{testimonial.content}"
              </p>

              {/* Auteur */}
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-12 h-12 bg-[#33ffcc]/20 rounded-full flex items-center justify-center text-[#33ffcc] font-bold text-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {testimonial.author_name.charAt(0)}
                </motion.div>
                <div>
                  <p className="text-white font-semibold">{testimonial.author_name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.author_role} - {testimonial.author_location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* CTA */}
        <ScrollReveal animation="scale" delay={0.3}>
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-6">
              Rejoignez plus de <span className="text-white font-semibold">2000 clients satisfaits</span>
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105"
            >
              Organiser mon événement
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
