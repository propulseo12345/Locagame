import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BreadcrumbSchema } from '../components/BreadcrumbSchema';
import { FaqsService, type FAQ } from '../services';
import ContactForm from '../components/contact/ContactForm';
import ContactSidebar from '../components/contact/ContactSidebar';
import ContactMap from '../components/contact/ContactMap';

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqsError, setFaqsError] = useState<string | null>(null);

  const fetchFaqs = async () => {
    setFaqsError(null);
    try {
      const data = await FaqsService.getFaqs();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      setFaqsError('Impossible de charger les questions fréquentes.');
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // État de succès
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000033] to-[#001144] pt-header">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="inline-flex p-4 bg-[#33ffcc]/20 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-[#33ffcc]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Message envoyé !</h2>
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
            <ContactForm onSubmitSuccess={() => setIsSubmitted(true)} />
          </div>

          {/* Sidebar - 1 colonne */}
          {faqsError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center lg:col-span-1">
              <p className="text-red-300 text-sm mb-2">{faqsError}</p>
              <button onClick={fetchFaqs} className="text-xs text-red-300 underline hover:text-red-200">Réessayer</button>
            </div>
          )}
          {!faqsError && <ContactSidebar faqs={faqs} />}
        </div>

        {/* Carte Google Maps */}
        <ContactMap />

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
