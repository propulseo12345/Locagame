import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, ArrowRight, Quote } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';

const events = [
  {
    id: '2',
    title: 'Anniversaire 50 ans de Pierre',
    date: '2024-05-20',
    location: 'Salle des fêtes, Marseille',
    guests: 80,
    type: 'Anniversaire',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop',
    description: 'Fête d\'anniversaire avec jeux d\'équipe et animations sportives',
    games: ['Baby-foot Géant', 'Billard Hollandais', 'Pétanque'],
    rating: 4.8,
    testimonial: 'Excellent service, jeux de qualité et équipe très professionnelle.',
    client: 'Pierre L.'
  },
  {
    id: '3',
    title: 'Team Building TechCorp',
    date: '2024-04-10',
    location: 'Parc des Expositions, Marseille',
    guests: 200,
    type: 'Entreprise',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop',
    description: 'Team building avec jeux collaboratifs et défis d\'équipe',
    games: ['Casino', 'Jeux en Bois', 'Quiz Géant'],
    rating: 4.7,
    testimonial: 'Parfait pour notre team building, nos employés ont adoré !',
    client: 'Marie D.'
  },
  {
    id: '4',
    title: 'Festival des Jeux de Marseille',
    date: '2024-07-08',
    location: 'Parc Borély, Marseille',
    guests: 500,
    type: 'Festival',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop',
    description: 'Grand festival avec tous nos jeux en démonstration sur 3 jours',
    games: ['Tous nos jeux', 'Animations', 'Concours'],
    rating: 4.9,
    testimonial: 'Un succès total ! Le public a adoré.',
    client: 'Organisateur'
  }
];

const eventTypes = ['Tous', 'Anniversaire', 'Entreprise', 'Festival'];

export default function EventsPage() {
  const [selectedType, setSelectedType] = useState('Tous');

  const filteredEvents = selectedType === 'Tous'
    ? events
    : events.filter(e => e.type === selectedType);

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
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedType === type
                  ? 'bg-[#33ffcc] text-[#000033]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
            </div>

        {/* Compteur */}
        <p className="text-gray-500 text-sm mb-6">
          {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
        </p>

        {/* Grille des événements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="group bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-[#33ffcc]/30 transition-all"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-transparent to-transparent"></div>

                {/* Rating */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                  <Star className="w-3 h-3 text-[#33ffcc] fill-current" />
                  <span className="text-white text-xs font-bold">{event.rating}</span>
            </div>
          </div>

              {/* Contenu */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#33ffcc] transition-colors">
                  {event.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Infos */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#33ffcc]" />
                    {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#33ffcc]" />
                    {event.guests} invités
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#33ffcc]" />
                    <span className="truncate max-w-[150px]">{event.location.split(',')[0]}</span>
                  </div>
                </div>

                {/* Jeux */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                      {event.games.slice(0, 3).map((game, idx) => (
                        <span
                          key={idx}
                      className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded border border-white/10"
                        >
                          {game}
                        </span>
                      ))}
                  </div>

                {/* Témoignage */}
                <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg mb-4">
                  <Quote className="w-4 h-4 text-[#33ffcc] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm italic line-clamp-2">{event.testimonial}</p>
                    <p className="text-[#33ffcc] text-xs font-medium mt-1">— {event.client}</p>
                    </div>
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
