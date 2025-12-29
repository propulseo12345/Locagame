import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const faqs = [
    { q: 'Quel est le délai de réservation ?', a: 'Minimum 48h pour les livraisons, 24h pour le retrait.' },
    { q: 'Installation incluse ?', a: 'Oui, installation et démontage gratuits.' },
    { q: 'Modes de paiement ?', a: 'CB, virement, chèque et espèces.' },
    { q: 'Zone de livraison ?', a: 'Toute la région PACA, et au-delà sur devis.' }
  ];

  // État de succès
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="inline-flex p-4 bg-[#33ffcc]/20 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-[#33ffcc]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Message envoyé !</h1>
          <p className="text-gray-400 mb-8">
            Merci pour votre message. Nous vous répondrons sous 24h ouvrées.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-xl hover:bg-[#66cccc] transition-colors"
            >
              Envoyer un autre message
            </button>
            <Link
              to="/catalogue"
              className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Breadcrumb pour le schema
  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://www.locagame.fr' },
    { name: 'Contact', url: 'https://www.locagame.fr/contact' }
  ];

  return (
    <>
      <SEO
        title="Contact"
        description="Contactez LOCAGAME pour vos projets d'événements : location de jeux, demande de devis gratuit, questions. Réponse sous 24h. Tél: 04 30 22 03 83"
        keywords="contact locagame, devis location jeux, contact événement Marseille, location jeux PACA"
        url="https://www.locagame.fr/contact"
      />
      <BreadcrumbSchema items={breadcrumbItems} />

    <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            <span className="gradient-text">Contactez-nous</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Une question sur nos jeux ? Un projet d'événement ? Notre équipe vous répond rapidement.
          </p>
        </div>

        {/* Contact rapide - 4 colonnes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          <a
            href="tel:0430220383"
            className="flex flex-col items-center p-5 bg-white/5 rounded-xl border border-white/10 hover:border-[#33ffcc]/50 hover:bg-white/10 transition-all text-center"
          >
            <Phone className="w-6 h-6 text-[#33ffcc] mb-3" />
            <p className="text-white font-semibold">04 30 22 03 83</p>
            <p className="text-xs text-gray-500 mt-1">Appel direct</p>
          </a>

          <a
            href="mailto:contact@locagame.net"
            className="flex flex-col items-center p-5 bg-white/5 rounded-xl border border-white/10 hover:border-[#33ffcc]/50 hover:bg-white/10 transition-all text-center"
          >
            <Mail className="w-6 h-6 text-[#33ffcc] mb-3" />
            <p className="text-white font-semibold">contact@locagame.net</p>
            <p className="text-xs text-gray-500 mt-1">Réponse sous 24h</p>
          </a>

          <a
            href="https://www.google.com/maps/search/?api=1&query=553+rue+Saint+Pierre+13012+Marseille"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-5 bg-white/5 rounded-xl border border-white/10 hover:border-[#33ffcc]/50 hover:bg-white/10 transition-all text-center"
          >
            <MapPin className="w-6 h-6 text-[#33ffcc] mb-3" />
            <p className="text-white font-semibold">553 rue St Pierre</p>
            <p className="text-xs text-gray-500 mt-1">13012 Marseille</p>
          </a>

          <div className="flex flex-col items-center p-5 bg-white/5 rounded-xl border border-white/10 text-center">
            <Clock className="w-6 h-6 text-[#33ffcc] mb-3" />
            <p className="text-white font-semibold">Lun-Ven 9h-18h</p>
            <p className="text-xs text-gray-500 mt-1">Sam 9h-12h</p>
          </div>
        </div>

        {/* Contenu principal : Formulaire + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Formulaire - 2 colonnes */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Demande de devis personnalisé</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nom + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Nom complet *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="jean@email.com"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Téléphone + Type événement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="06 12 34 56 78"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Type d'événement</label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#33ffcc] focus:outline-none transition-colors"
                    >
                      <option value="" className="bg-[#000033]">Sélectionnez</option>
                      <option value="mariage" className="bg-[#000033]">Mariage</option>
                      <option value="anniversaire" className="bg-[#000033]">Anniversaire</option>
                      <option value="entreprise" className="bg-[#000033]">Événement d'entreprise</option>
                      <option value="festival" className="bg-[#000033]">Festival / Fête</option>
                      <option value="famille" className="bg-[#000033]">Fête de famille</option>
                      <option value="autre" className="bg-[#000033]">Autre</option>
                    </select>
                  </div>
                </div>

                {/* Date événement */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Date de l'événement</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#33ffcc] focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Votre message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder="Décrivez votre événement, vos besoins, les jeux qui vous intéressent..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Newsletter */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#33ffcc] focus:ring-[#33ffcc] bg-white/5"
                  />
                  <span className="text-sm text-gray-400">
                    Je souhaite recevoir les offres et nouveautés de LocaGame
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#66cccc] disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - 1 colonne */}
          <div className="space-y-8">

            {/* FAQ */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Questions fréquentes</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <p className="text-white text-sm font-medium mb-1">{faq.q}</p>
                    <p className="text-gray-400 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Horaires détaillés */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Horaires d'ouverture</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Lundi - Vendredi</span>
                  <span className="text-white font-medium">9h - 18h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Samedi</span>
                  <span className="text-white font-medium">9h - 12h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dimanche</span>
                  <span className="text-red-400">Fermé</span>
                </div>
              </div>
            </div>

            {/* Engagement réponse */}
            <div className="bg-[#33ffcc]/10 rounded-2xl border border-[#33ffcc]/20 p-6">
              <p className="text-white font-medium mb-1">Réponse garantie sous 24h</p>
              <p className="text-sm text-gray-400">
                Pour une réponse immédiate, appelez-nous directement.
              </p>
            </div>
          </div>
        </div>

        {/* Carte Google Maps */}
        <div className="mt-14">
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">Nous trouver</h3>
                <p className="text-sm text-gray-400">553 rue Saint Pierre, 13012 Marseille</p>
              </div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=553+rue+Saint+Pierre+13012+Marseille"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors text-sm"
              >
                <MapPin className="w-4 h-4" />
                Itinéraire
              </a>
            </div>
            <div className="h-[300px]">
              <iframe
                title="Localisation LocaGame"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2904.5!2d5.4!3d43.32!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDE5JzEyLjAiTiA1wrAyNCcwMC4wIkU!5e0!3m2!1sfr!2sfr!4v1234567890&q=553+rue+Saint+Pierre+13012+Marseille"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm border-t border-white/10">
              <div className="text-center">
                <p className="text-white font-medium">Parking gratuit</p>
                <p className="text-gray-500 text-xs">Sur place</p>
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Accès facile</p>
                <p className="text-gray-500 text-xs">5 min de l'autoroute</p>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <p className="text-white font-medium">Showroom</p>
                <p className="text-gray-500 text-xs">Sur rendez-vous</p>
              </div>
            </div>
          </div>
        </div>

        {/* Retour */}
        <div className="text-center mt-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
