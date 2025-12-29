import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000033] via-[#001144] to-[#000033] pt-header">
      <div className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-2 text-[#33ffcc] hover:text-[#66cccc] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#33ffcc]/10 border border-[#33ffcc]/30 rounded-full mb-6">
              <Shield className="w-5 h-5 text-[#33ffcc]" />
              <span className="text-[#33ffcc] font-semibold">Protection des données</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Politique de <span className="gradient-text">Confidentialité</span>
            </h1>
            <p className="text-gray-400">Conformément au RGPD</p>
          </div>

          {/* Content */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Responsable du traitement</h2>
              <p className="mb-4">
                Les données personnelles collectées sur le site LOCAGAME sont traitées par Poker Agency, en qualité de responsable de traitement.
              </p>
              <p>
                <strong className="text-white">Contact :</strong>{' '}
                <a href="mailto:communication@poker-agency.com" className="text-[#33ffcc] hover:underline">communication@poker-agency.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Données collectées</h2>
              <p className="mb-4">Les données susceptibles d'être collectées sont :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Données d'identification (nom, prénom, email, téléphone)</li>
                <li>Données liées aux demandes de devis ou de contact</li>
                <li>Données de navigation (adresse IP, pages consultées, cookies)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Finalités du traitement</h2>
              <p className="mb-4">Les données personnelles sont collectées pour :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>La gestion des demandes de contact et devis</li>
                <li>La relation client et commerciale</li>
                <li>La gestion marketing et communication</li>
                <li>L'amélioration du site et de l'expérience utilisateur</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Destinataires des données</h2>
              <p>
                Les données sont exclusivement destinées à Poker Agency et à ses prestataires techniques autorisés.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Durée de conservation</h2>
              <p>
                Les données sont conservées pour la durée nécessaire aux finalités poursuivies, puis archivées ou supprimées conformément à la réglementation en vigueur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Droits des utilisateurs</h2>
              <p className="mb-4">Conformément à la réglementation, l'utilisateur dispose des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">Accès :</strong> obtenir une copie de vos données</li>
                <li><strong className="text-white">Rectification :</strong> corriger vos données inexactes</li>
                <li><strong className="text-white">Effacement :</strong> supprimer vos données</li>
                <li><strong className="text-white">Limitation :</strong> limiter le traitement de vos données</li>
                <li><strong className="text-white">Opposition :</strong> vous opposer au traitement</li>
                <li><strong className="text-white">Portabilité :</strong> récupérer vos données dans un format structuré</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Contact</h2>
              <p className="mb-4">
                Toute demande peut être adressée à :{' '}
                <a href="mailto:communication@poker-agency.com" className="text-[#33ffcc] hover:underline">communication@poker-agency.com</a>
              </p>
              <p>
                L'utilisateur peut également saisir la CNIL.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
