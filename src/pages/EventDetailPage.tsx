import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Star, Sparkles, ChevronLeft, ChevronRight, X, Image } from 'lucide-react';
import { PortfolioEventsService, type PortfolioEvent } from '../services';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<PortfolioEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await PortfolioEventsService.getPortfolioEventById(id);
        setEvent(data);
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#33ffcc] border-t-transparent"></div>
          <p className="mt-4 text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-4">Événement non trouvé</h1>
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

  const closeLightbox = () => {
    setSelectedImage(null);
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
      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-10 w-2 h-2 bg-[#33ffcc] rounded-full animate-pulse"></div>
        <div className="absolute top-64 right-20 w-1 h-1 bg-[#66cccc] rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-[#33ffcc]/60 rounded-full animate-bounce"></div>
        <div className="absolute top-96 right-1/3 w-1 h-1 bg-[#66cccc]/80 rounded-full animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header avec type */}
        <div className="text-center mb-12 animate-fade-in relative">
          {/* Bouton retour */}
          <div className="absolute top-0 left-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-[#33ffcc] hover:text-[#66cccc] hover:bg-white/20 transition-all duration-300 font-semibold rounded-lg border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux événements
            </button>
          </div>

          {event.event_type && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/20 backdrop-blur-sm rounded-full border border-[#33ffcc]/30 mb-6">
              <span className="px-3 py-1 bg-[#33ffcc] text-[#000033] rounded-full">
                <span className="friendly-badge text-base">{event.event_type.name}</span>
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            {event.title}
          </h1>

          {/* Méta informations */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-300">
            {event.event_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#33ffcc]" />
                <span>{new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#66cccc]" />
                <span>{event.location}</span>
              </div>
            )}
            {event.guest_count && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#33ffcc]" />
                <span>{event.guest_count} invités</span>
              </div>
            )}
          </div>
        </div>

        {/* Galerie d'images */}
        {gallery.length > 0 && (
          <div className="mb-12 animate-fade-in-delay">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {gallery.map((image, index) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#33ffcc]/20 to-[#66cccc]/20 hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={image}
                    alt={`${event.title} - Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000033]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="p-3 bg-[#33ffcc] rounded-full">
                      <Sparkles className="w-6 h-6 text-[#000033]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
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
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 animate-fade-in">
                <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#33ffcc]" />
                  À propos de cet événement
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {event.description}
                </p>
              </div>
            )}

            {/* Produits utilisés */}
            {event.products_used && event.products_used.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 animate-fade-in-delay-2">
                <h2 className="text-2xl font-black text-white mb-6">
                  Équipements utilisés ({event.products_used.length})
                </h2>
                <div className="flex flex-wrap gap-3">
                  {event.products_used.map((productId, index) => (
                    <div
                      key={index}
                      className="px-4 py-2.5 bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/20 text-[#33ffcc] rounded-xl border border-[#33ffcc]/30 font-semibold hover:scale-105 transition-transform duration-300"
                    >
                      {productId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-32 space-y-6 animate-fade-in-delay">
              {/* Statistiques */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#33ffcc]" />
                  Informations
                </h3>
                <div className="space-y-4">
                  {event.event_date && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">Date</span>
                      <span className="font-bold text-[#33ffcc]">
                        {new Date(event.event_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {event.guest_count && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">Invités</span>
                      <span className="font-bold text-[#66cccc]">{event.guest_count}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">Lieu</span>
                      <span className="font-bold text-[#33ffcc] text-right text-sm">{event.location}</span>
                    </div>
                  )}
                  {event.event_type && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">Type</span>
                      <span className="font-bold text-[#66cccc]">{event.event_type.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-[#33ffcc]/20 to-[#66cccc]/20 backdrop-blur-xl rounded-2xl border border-[#33ffcc]/30 p-6 text-center">
                <h3 className="text-lg font-black text-white mb-3">
                  Intéressé par un événement similaire ?
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Contactez-nous pour organiser votre événement
                </p>
                <Link
                  to="/contact"
                  className="block w-full py-3 px-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105"
                >
                  Demander un devis
                </Link>
                <Link
                  to="/catalogue"
                  className="block w-full mt-3 py-3 px-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:border-[#33ffcc] hover:bg-white/10 transition-all duration-300"
                >
                  Voir nos jeux
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox pour les images */}
      {selectedImage && gallery.length > 0 && (
        <div className="fixed inset-0 z-50 bg-[#000033]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-white"
          >
            <X className="w-6 h-6" />
          </button>

          {gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={selectedImage}
            alt="Event"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
          />

          {gallery.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-[#33ffcc] w-8'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
