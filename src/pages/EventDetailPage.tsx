import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Star, Clock, Award, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';

// Données temporaires (à remplacer par un fetch API plus tard)
const eventsData = [
  {
    id: '2',
    title: 'Anniversaire 50 ans de Pierre',
    date: '2024-05-20',
    location: 'Salle des fêtes, Marseille',
    guests: 80,
    duration: '1 jour',
    type: 'Anniversaire',
    emoji: '🎂',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop',
    description: 'Fête d\'anniversaire avec jeux d\'équipe et animations sportives',
    games: ['Foot Géant', 'Relais des Obstacles', 'Pétanque Géante', 'Course en Sac XXL'],
    rating: 4.8,
    testimonial: 'Excellent service, jeux de qualité et équipe très professionnelle. Tout le monde a passé un moment formidable !',
    client: 'Pierre L.',
    gallery: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
      'https://images.unsplash.com/photo-1464347744102-11db6282f854?w=800',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800'
    ],
    fullDescription: 'Une fête d\'anniversaire mémorable avec 80 invités ravis. Les jeux sportifs ont créé une ambiance dynamique et compétitive, parfaite pour célébrer les 50 ans de Pierre. Le Foot Géant a été la star de la soirée avec des matchs endiablés entre amis et famille !',
    highlights: [
      'Jeux sportifs et compétitifs',
      'Tournois organisés',
      'Remise de prix aux gagnants',
      'Ambiance festive garantie'
    ],
    stats: {
      setup_time: '1.5 heures',
      games_used: 4,
      animation_hours: 8,
      satisfaction: '4.8/5'
    }
  },
  {
    id: '3',
    title: 'Événement d\'entreprise TechCorp',
    date: '2024-04-10',
    location: 'Parc des Expositions, Marseille',
    guests: 200,
    duration: '1 jour',
    type: 'Entreprise',
    emoji: '🏢',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop',
    description: 'Team building avec jeux collaboratifs et défis d\'équipe',
    games: ['Relais des Obstacles', 'Atelier Peinture', 'Jeux d\'Équipe', 'Construction XXL', 'Défis Challenge'],
    rating: 4.7,
    testimonial: 'Parfait pour notre team building, nos employés ont adoré ! Excellent retour de toute l\'équipe.',
    client: 'Marie D.',
    gallery: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800'
    ],
    fullDescription: 'Un team building réussi pour TechCorp avec 200 employés. Les jeux collaboratifs ont renforcé la cohésion d\'équipe et créé des souvenirs mémorables. Les défis ont permis de révéler les talents de chacun dans une atmosphère conviviale et professionnelle.',
    highlights: [
      'Renforcement de la cohésion d\'équipe',
      'Défis collaboratifs',
      'Animation professionnelle',
      'Débriefing post-événement',
      'Photos et vidéos souvenirs'
    ],
    stats: {
      setup_time: '3 heures',
      games_used: 5,
      animation_hours: 6,
      satisfaction: '4.7/5'
    }
  },
  {
    id: '4',
    title: 'Festival des Jeux de Marseille',
    date: '2024-07-08',
    location: 'Parc Borély, Marseille',
    guests: 500,
    duration: '3 jours',
    type: 'Festival',
    emoji: '🎪',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop',
    description: 'Grand festival avec tous nos jeux en démonstration',
    games: ['Jeu de l\'Oie Géant', 'Pétanque Géante', 'Foot Géant', 'Mikado Géant', 'Puissance 4 XXL', 'Tables et Chaises', 'Relais des Obstacles', 'Et bien plus...'],
    rating: 4.9,
    testimonial: 'Un succès total ! Le public a adoré nos jeux. Une organisation parfaite sur 3 jours.',
    client: 'Organisateur Festival',
    gallery: [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800'
    ],
    fullDescription: 'Le plus grand festival de jeux géants de la région ! Plus de 500 visiteurs sur 3 jours ont découvert l\'ensemble de notre collection. Un événement familial qui a marqué les esprits avec des animations non-stop du matin au soir. Des ateliers, des tournois et des démonstrations ont rythmé ces 3 journées inoubliables.',
    highlights: [
      'Plus de 15 jeux différents',
      'Animations sur 3 jours complets',
      'Tournois avec lots à gagner',
      'Démonstrations en continu',
      'Espace dédié aux enfants',
      'Stand de restauration sur place'
    ],
    stats: {
      setup_time: '6 heures',
      games_used: 15,
      animation_hours: 30,
      satisfaction: '4.9/5'
    }
  }
];

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Trouver l'événement correspondant
  const event = eventsData.find(e => e.id === id);

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

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setSelectedImage(event.gallery[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % event.gallery.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(event.gallery[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentImageIndex - 1 + event.gallery.length) % event.gallery.length;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(event.gallery[prevIndex]);
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
        {/* Header avec emoji */}
        <div className="text-center mb-12 animate-fade-in relative">
          {/* Bouton retour repositionné en haut à gauche */}
          <div className="absolute top-0 left-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-[#33ffcc] hover:text-[#66cccc] hover:bg-white/20 transition-all duration-300 font-semibold rounded-lg border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux événements
            </button>
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/20 backdrop-blur-sm rounded-full border border-[#33ffcc]/30 mb-6">
            <span className="text-4xl">{event.emoji}</span>
            <span className="px-3 py-1 bg-[#33ffcc] text-[#000033] rounded-full">
              <span className="friendly-badge text-base">{event.type}</span>
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            {event.title}
          </h1>

          {/* Méta informations */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#33ffcc]" />
              <span>{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#66cccc]" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#33ffcc]" />
              <span>{event.guests} invités</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#66cccc]" />
              <span>{event.duration}</span>
            </div>
          </div>
        </div>

        {/* Galerie d'images */}
        <div className="mb-12 animate-fade-in-delay">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {event.gallery.map((image, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description complète */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 animate-fade-in">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#33ffcc]" />
                À propos de cet événement
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                {event.fullDescription}
              </p>
            </div>

            {/* Points forts */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 animate-fade-in-delay">
              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-[#33ffcc]" />
                Points forts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#33ffcc]/10 to-transparent rounded-xl border border-[#33ffcc]/20"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-[#33ffcc] rounded-full flex items-center justify-center">
                      <span className="text-[#000033] font-bold text-sm">✓</span>
                    </div>
                    <span className="text-gray-300 flex-1">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jeux utilisés */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 animate-fade-in-delay-2">
              <h2 className="text-2xl font-black text-white mb-6">
                Jeux utilisés ({event.games.length})
              </h2>
              <div className="flex flex-wrap gap-3">
                {event.games.map((game, index) => (
                  <div
                    key={index}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#33ffcc]/20 to-[#66cccc]/20 text-[#33ffcc] rounded-xl border border-[#33ffcc]/30 font-semibold hover:scale-105 transition-transform duration-300"
                  >
                    {game}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="lg:sticky lg:top-32 space-y-6 animate-fade-in-delay">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#33ffcc]" />
                  Statistiques
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400 text-sm">Installation</span>
                    <span className="font-bold text-[#33ffcc]">{event.stats.setup_time}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400 text-sm">Jeux utilisés</span>
                    <span className="font-bold text-[#66cccc]">{event.stats.games_used}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400 text-sm">Heures d'animation</span>
                    <span className="font-bold text-[#33ffcc]">{event.stats.animation_hours}h</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400 text-sm">Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#33ffcc] fill-current" />
                      <span className="font-bold text-[#33ffcc]">{event.stats.satisfaction}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Témoignage */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#33ffcc] fill-current" />
                    ))}
                  </div>
                  <span className="text-[#33ffcc] font-bold">{event.rating}/5</span>
                </div>
                <div className="text-[#33ffcc] text-4xl mb-3">"</div>
                <p className="text-gray-300 italic mb-4 leading-relaxed">
                  {event.testimonial}
                </p>
                <p className="text-[#33ffcc] font-bold">— {event.client}</p>
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
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-[#000033]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-white"
          >
            <X className="w-6 h-6" />
          </button>

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

          <img
            src={selectedImage}
            alt="Event"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
          />

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {event.gallery.map((_, index) => (
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
        </div>
      )}
    </div>
  );
}
