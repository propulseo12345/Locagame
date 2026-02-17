import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Sparkles, Image } from 'lucide-react';
import { PortfolioEventsService, type PortfolioEvent } from '../services';
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
      <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#33ffcc] border-t-transparent"></div>
          <p className="mt-4 text-white text-lg">Chargement...</p>
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
          <EventSidebar event={event} />
        </div>
      </div>

      {/* Lightbox pour les images */}
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
