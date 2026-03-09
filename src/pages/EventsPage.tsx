import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, Sparkles, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ui/ScrollReveal';
import { PortfolioEventsService, EventTypesService, type PortfolioEvent, type EventType } from '../services';

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export default function EventsPage() {
  const [events, setEvents] = useState<PortfolioEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setError(null);
    try {
      setLoading(true);
      const [eventsData, typesData] = await Promise.all([
        PortfolioEventsService.getPortfolioEvents(),
        EventTypesService.getEventTypes()
      ]);
      setEvents(eventsData);
      setEventTypes(typesData);
    } catch (err) {
      console.error('Failed to fetch events data:', err);
      setError('Impossible de charger les événements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEvents = selectedType
    ? events.filter(e => e.event_type_id === selectedType)
    : events;

  const featuredEvent = filteredEvents.find(e => e.is_featured);
  const regularEvents = featuredEvent
    ? filteredEvents.filter(e => e.id !== featuredEvent.id)
    : filteredEvents;

  // Stats calculées depuis les données
  const stats = useMemo(() => {
    const totalGuests = events.reduce((sum, e) => sum + (e.guest_count || 0), 0);
    const uniqueLocations = new Set(events.map(e => e.location).filter(Boolean)).size;
    return {
      totalEvents: events.length,
      totalGuests,
      uniqueLocations
    };
  }, [events]);

  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://www.locagame.fr' },
    { name: 'Événements', url: 'https://www.locagame.fr/evenements' }
  ];

  // Emojis par type d'événement
  const typeEmojis: Record<string, string> = {
    'Anniversaire': '🎂',
    'Team building': '🤝',
    'Festival': '🎪',
    'Mariage': '💍',
    'Séminaire': '📊',
    'Salon': '🎯',
    'Fête': '🎉',
  };

  return (
    <>
      <SEO
        title="Nos Réalisations"
        description="Découvrez les événements animés par LOCAGAME : anniversaires, team building, festivals. Plus de 2000 événements réussis en région PACA."
        keywords="événements locagame, team building Marseille, location jeux fête, événement entreprise PACA"
        url="https://www.locagame.fr/evenements"
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
        {/* Hero Section */}
        <div className="relative border-b border-white/10 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#33ffcc]/[0.03] via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#33ffcc]/[0.04] rounded-full blur-[120px]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <ScrollReveal animation="fadeUp">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] backdrop-blur-sm rounded-full border border-white/10 mb-6">
                <Trophy className="w-4 h-4 text-[#33ffcc]" />
                <span className="text-white/70 text-sm font-medium">Portfolio événementiel</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
                Nos <span className="bg-gradient-to-r from-[#33ffcc] via-[#66ffdd] to-[#33ffcc] bg-clip-text text-transparent">Réalisations</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={0.15}>
              <p className="text-gray-400 max-w-xl mx-auto text-lg mb-10">
                Découvrez les événements que nous avons animés avec passion
              </p>
            </ScrollReveal>

            {/* Stats */}
            {!loading && events.length > 0 && (
              <ScrollReveal animation="fadeUp" delay={0.2}>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 pt-6 border-t border-white/5">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-black text-[#33ffcc]">{stats.totalEvents}</div>
                    <div className="text-sm text-white/40">Événements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-black text-[#33ffcc]">{stats.totalGuests.toLocaleString('fr-FR')}+</div>
                    <div className="text-sm text-white/40">Invités ravis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-black text-[#33ffcc]">{stats.uniqueLocations}</div>
                    <div className="text-sm text-white/40">Lieux différents</div>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>

        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
              <p className="text-red-300 mb-3">{error}</p>
              <button onClick={fetchData} className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-bold rounded-lg hover:bg-[#66cccc] transition-all text-sm">
                Réessayer
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filtres glassmorphism */}
          <ScrollReveal animation="fadeUp" delay={0.1}>
            <div className="mb-4">
              <p className="text-center text-white/40 text-sm mb-5 uppercase tracking-wider">
                Filtrer par type
              </p>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                <motion.button
                  onClick={() => setSelectedType(null)}
                  className={`group relative px-5 py-2.5 rounded-full border transition-all duration-300 ${
                    selectedType === null
                      ? 'bg-[#33ffcc] text-[#000033] border-[#33ffcc] font-bold shadow-[0_0_20px_rgba(51,255,204,0.3)]'
                      : 'bg-white/[0.04] border-white/10 text-white/80 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm font-medium">Tous</span>
                  {selectedType === null && (
                    <div className="absolute inset-0 rounded-full bg-[#33ffcc] opacity-20 blur-xl" />
                  )}
                </motion.button>
                {eventTypes.map((type) => {
                  const emoji = typeEmojis[type.name] || '🎲';
                  return (
                    <motion.button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`group relative px-5 py-2.5 rounded-full border transition-all duration-300 ${
                        selectedType === type.id
                          ? 'bg-[#33ffcc] text-[#000033] border-[#33ffcc] font-bold shadow-[0_0_20px_rgba(51,255,204,0.3)]'
                          : 'bg-white/[0.04] border-white/10 text-white/80 hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{emoji}</span>
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                      {selectedType !== type.id && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#33ffcc] to-[#66cccc] opacity-0 group-hover:opacity-10 transition-opacity blur-xl" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Compteur */}
          <p className="text-gray-500 text-sm mb-8">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
          </p>

          {/* Contenu */}
          {loading ? (
            <div className="space-y-6">
              {/* Skeleton featured */}
              <div className="animate-pulse">
                <div className="h-72 bg-white/5 rounded-2xl mb-6" />
              </div>
              {/* Skeleton grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-white/5 rounded-2xl mb-4" />
                    <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
                    <div className="h-6 bg-white/5 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Événement mis en avant */}
              {featuredEvent && (
                <ScrollReveal animation="fadeUp" className="mb-10">
                  <Link
                    to={`/evenements/${featuredEvent.id}`}
                    className="group block relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#33ffcc]/30 transition-all duration-500"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      {/* Image */}
                      <div className="relative h-64 lg:h-80 overflow-hidden">
                        <img
                          src={featuredEvent.featured_image || featuredEvent.images[0] || 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800'}
                          alt={featuredEvent.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#000033]/80 hidden lg:block" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000033]/80 via-transparent to-transparent lg:hidden" />

                        {/* Badge featured */}
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-[#fe1979] text-white text-xs font-bold rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          Mis en avant
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="p-8 flex flex-col justify-center">
                        {featuredEvent.event_type && (
                          <span className="text-[#33ffcc] text-xs font-semibold uppercase tracking-wider mb-3">
                            {featuredEvent.event_type.name}
                          </span>
                        )}
                        <h2 className="text-2xl lg:text-3xl font-black text-white mb-3 group-hover:text-[#33ffcc] transition-colors">
                          {featuredEvent.title}
                        </h2>
                        {featuredEvent.description && (
                          <p className="text-gray-400 mb-6 line-clamp-3">
                            {featuredEvent.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                          {featuredEvent.event_date && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-[#33ffcc]" />
                              {new Date(featuredEvent.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          )}
                          {featuredEvent.guest_count && (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-[#33ffcc]" />
                              {featuredEvent.guest_count} invités
                            </div>
                          )}
                          {featuredEvent.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-[#33ffcc]" />
                              {featuredEvent.location}
                            </div>
                          )}
                        </div>
                        <div className="inline-flex items-center gap-2 text-[#33ffcc] font-semibold group-hover:gap-4 transition-all duration-300">
                          Voir les détails
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Glow subtil */}
                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#33ffcc]/[0.06] rounded-full blur-[80px] group-hover:bg-[#33ffcc]/[0.12] transition-all duration-700" />
                  </Link>
                </ScrollReveal>
              )}

              {/* Grille 3 colonnes */}
              <StaggerContainer
                staggerDelay={0.12}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {regularEvents.map((event) => (
                  <StaggerItem key={event.id}>
                    <Link
                      to={`/evenements/${event.id}`}
                      className="group block bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-[#33ffcc]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(51,255,204,0.08)]"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={event.featured_image || event.images[0] || 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800'}
                          alt={event.title}
                          width={800}
                          height={600}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000033]/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                        {/* Type badge */}
                        {event.event_type && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                            <span className="text-[#33ffcc] text-xs font-semibold">{event.event_type.name}</span>
                          </div>
                        )}

                        {/* Hover CTA overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          <span className="text-white text-sm font-medium">Voir les détails</span>
                          <ArrowRight className="w-4 h-4 text-[#33ffcc]" />
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#33ffcc] transition-colors duration-300 line-clamp-1">
                          {event.title}
                        </h3>

                        {event.description && (
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        {/* Infos */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {event.event_date && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg">
                              <Calendar className="w-3.5 h-3.5 text-[#33ffcc]" />
                              {new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                          {event.guest_count && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg">
                              <Users className="w-3.5 h-3.5 text-[#33ffcc]" />
                              {event.guest_count} invités
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg">
                              <MapPin className="w-3.5 h-3.5 text-[#33ffcc]" />
                              <span className="truncate max-w-[120px]">{event.location.split(',')[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {filteredEvents.length === 0 && !loading && (
                <div className="text-center py-16">
                  <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Aucun événement trouvé pour ce filtre.</p>
                </div>
              )}
            </>
          )}

          {/* CTA Final */}
          <ScrollReveal animation="fadeUp" delay={0.2}>
            <div className="mt-20 text-center">
              <div className="relative max-w-2xl mx-auto p-10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {/* Glow */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-[#33ffcc]/[0.06] rounded-full blur-[80px]" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#33ffcc]/10 rounded-full border border-[#33ffcc]/20 mb-5">
                    <Sparkles className="w-4 h-4 text-[#33ffcc]" />
                    <span className="text-[#33ffcc] text-xs font-semibold uppercase tracking-wider">Votre événement</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                    Vous organisez un événement ?
                  </h2>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Contactez-nous pour un devis personnalisé adapté à vos besoins.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      to="/catalogue"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(51,255,204,0.3)]"
                    >
                      Explorer le catalogue
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:border-[#33ffcc] hover:text-[#33ffcc] transition-all duration-300"
                    >
                      Demander un devis
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
