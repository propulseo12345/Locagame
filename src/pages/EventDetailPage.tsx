import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Sparkles, Image, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PortfolioEventsService, type PortfolioEvent } from '../services';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import EventLightbox from '../components/event/EventLightbox';
import EventSidebar from '../components/event/EventSidebar';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<PortfolioEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const loadEvent = async () => {
    if (!id) return;
    setError(null);
    try {
      setLoading(true);
      const data = await PortfolioEventsService.getPortfolioEventById(id);
      setEvent(data);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Impossible de charger cet événement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/5 rounded w-48" />
            <div className="h-12 bg-white/5 rounded w-2/3 mx-auto" />
            <div className="aspect-[16/9] max-w-4xl mx-auto bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-48 bg-white/5 rounded-2xl" />
              <div className="h-64 bg-white/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{error}</h2>
          <button
            onClick={loadEvent}
            className="px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white mb-4">Événement non trouvé</h2>
          <Link
            to="/evenements"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  const gallery = event.images && event.images.length > 0 ? event.images : (event.featured_image ? [event.featured_image] : []);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setSelectedImage(gallery[index]);
  };

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % gallery.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(gallery[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentImageIndex - 1 + gallery.length) % gallery.length;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(gallery[prevIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header">
      {/* Hero header */}
      <div className="relative border-b border-white/10 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#33ffcc]/[0.04] rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] backdrop-blur-sm text-white/70 hover:text-[#33ffcc] hover:bg-white/10 transition-all duration-300 font-medium rounded-xl border border-white/10 hover:border-[#33ffcc]/30 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux événements
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center"
          >
            {event.event_type && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#33ffcc]/10 backdrop-blur-sm rounded-full border border-[#33ffcc]/20 mb-5">
                <span className="text-[#33ffcc] text-sm font-semibold">{event.event_type.name}</span>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              {event.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-300">
              {event.event_date && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                  <Calendar className="w-4 h-4 text-[#33ffcc]" />
                  <span className="text-sm">{new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                  <MapPin className="w-4 h-4 text-[#66cccc]" />
                  <span className="text-sm">{event.location}</span>
                </div>
              )}
              {event.guest_count && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                  <Users className="w-4 h-4 text-[#33ffcc]" />
                  <span className="text-sm">{event.guest_count} invités</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Galerie d'images - Layout hero image + thumbnails */}
        {gallery.length > 0 && (
          <ScrollReveal animation="fadeUp" className="mb-12">
            <div className="space-y-4">
              {/* Image principale */}
              <motion.button
                onClick={() => openLightbox(mainImageIndex)}
                className="group relative w-full aspect-[16/9] max-h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={gallery[mainImageIndex]}
                  alt={`${event.title} - Photo principale`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000033]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-4 bg-[#33ffcc]/90 rounded-full shadow-[0_0_30px_rgba(51,255,204,0.4)]">
                    <Sparkles className="w-6 h-6 text-[#000033]" />
                  </div>
                </div>
              </motion.button>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImageIndex(index)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        index === mainImageIndex
                          ? 'border-[#33ffcc] ring-2 ring-[#33ffcc]/30 scale-105'
                          : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${event.title} - Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {gallery.length === 0 && (
          <div className="mb-12 flex justify-center">
            <div className="w-full max-w-md aspect-video bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <Image className="w-16 h-16 text-gray-600" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {event.description && (
              <ScrollReveal animation="fadeUp">
                <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                  <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#33ffcc]" />
                    À propos de cet événement
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {event.description}
                  </p>
                </div>
              </ScrollReveal>
            )}

            {/* Produits utilisés */}
            {event.products_used && event.products_used.length > 0 && (
              <ScrollReveal animation="fadeUp" delay={0.1}>
                <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                  <h2 className="text-2xl font-black text-white mb-6">
                    Équipements utilisés ({event.products_used.length})
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {event.products_used.map((productId, index) => (
                      <div
                        key={index}
                        className="px-4 py-2.5 bg-gradient-to-r from-[#33ffcc]/15 to-[#66cccc]/15 text-[#33ffcc] rounded-xl border border-[#33ffcc]/20 font-semibold hover:scale-105 transition-transform duration-300"
                      >
                        {productId}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* CTA inline */}
            <ScrollReveal animation="fadeUp" delay={0.15}>
              <div className="relative overflow-hidden bg-gradient-to-br from-[#33ffcc]/10 to-[#66cccc]/5 backdrop-blur-sm rounded-2xl border border-[#33ffcc]/20 p-8 text-center">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#33ffcc]/[0.08] rounded-full blur-[60px]" />
                <div className="relative">
                  <h3 className="text-xl font-black text-white mb-2">
                    Envie d'un événement similaire ?
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Notre équipe vous accompagne de A à Z pour créer votre événement sur mesure.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(51,255,204,0.3)]"
                    >
                      Demander un devis
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/catalogue"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/20 text-white font-semibold rounded-xl hover:border-[#33ffcc] hover:text-[#33ffcc] transition-all"
                    >
                      Voir nos jeux
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <ScrollReveal animation="fadeLeft" delay={0.1}>
            <EventSidebar event={event} />
          </ScrollReveal>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && gallery.length > 0 && (
        <EventLightbox
          gallery={gallery}
          currentImageIndex={currentImageIndex}
          onClose={() => setSelectedImage(null)}
          onNext={nextImage}
          onPrev={prevImage}
          onSelectIndex={(index) => openLightbox(index)}
        />
      )}
    </div>
  );
}
