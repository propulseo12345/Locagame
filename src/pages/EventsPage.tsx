import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';
import { PortfolioEventsService, EventTypesService, type PortfolioEvent, type EventType } from '../services';

export default function EventsPage() {
  const [events, setEvents] = useState<PortfolioEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsData, typesData] = await Promise.all([
          PortfolioEventsService.getPortfolioEvents(),
          EventTypesService.getEventTypes()
        ]);
        setEvents(eventsData);
        setEventTypes(typesData);
      } catch (error) {
        console.error('Failed to fetch events data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredEvents = selectedType
    ? events.filter(e => e.event_type_id === selectedType)
    : events;

  // Breadcrumb pour le schema
  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://www.locagame.fr' },
    { name: 'Événements', url: 'https://www.locagame.fr/evenements' }
  ];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Nos <span className="gradient-text">Réalisations</span>
            </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Découvrez les événements que nous avons animés avec passion
            </p>
          </div>

        {/* Filtres par type */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedType === null
                ? 'bg-[#33ffcc] text-[#000033]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Tous
          </button>
          {eventTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedType === type.id
                  ? 'bg-[#33ffcc] text-[#000033]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Compteur */}
        <p className="text-gray-500 text-sm mb-6">
          {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
        </p>

        {/* Grille des événements */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#33ffcc] border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="group bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-[#33ffcc]/30 transition-all"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={event.featured_image || event.images[0] || 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-transparent to-transparent"></div>

                  {/* Type badge */}
                  {event.event_type && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                      <span className="text-[#33ffcc] text-xs font-medium">{event.event_type.name}</span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#33ffcc] transition-colors">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Infos */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    {event.event_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#33ffcc]" />
                        {new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                    {event.guest_count && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#33ffcc]" />
                        {event.guest_count} invités
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#33ffcc]" />
                        <span className="truncate max-w-[150px]">{event.location.split(',')[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/evenements/${event.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] transition-colors"
                  >
                    Voir les détails
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA Final */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto p-8 bg-white/5 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2">
              Vous organisez un événement ?
              </h2>
            <p className="text-gray-400 mb-6">
              Contactez-nous pour un devis personnalisé adapté à vos besoins.
              </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/catalogue"
                className="px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] transition-colors"
                >
                  Voir nos jeux
                </Link>
                <Link
                  to="/contact"
                className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Demander un devis
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
