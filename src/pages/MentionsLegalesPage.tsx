import { Link } from 'react-router-dom';
import { Scale, ArrowLeft } from 'lucide-react';

export default function MentionsLegalesPage() {
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
              <Scale className="w-5 h-5 text-[#33ffcc]" />
              <span className="text-[#33ffcc] font-semibold">Document légal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Mentions <span className="gradient-text">Légales</span>
            </h1>
            <p className="text-gray-400">Conformément à la loi n°2004-575 du 21 juin 2004</p>
          </div>

          {/* Content */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Édition du site</h2>
              <p className="mb-4">
                Conformément à l'article 6 de la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN),
                il est précisé aux utilisateurs du site <a href="https://www.locagame.net" className="text-[#33ffcc] hover:underline">https://www.locagame.net</a> l'identité
                des différents intervenants dans le cadre de sa réalisation et de son suivi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Propriétaire du site</h2>
              <ul className="list-none space-y-2">
                <li><strong className="text-white">Raison sociale :</strong> Poker Agency</li>
                <li><strong className="text-white">Email :</strong> <a href="mailto:hello@poker-agency.com" className="text-[#33ffcc] hover:underline">hello@poker-agency.com</a></li>
                <li><strong className="text-white">Téléphone :</strong> 09 84 20 52 00</li>
                <li><strong className="text-white">Adresse :</strong> ZI Saint-Pierre, 553 rue Saint-Pierre, 13012 Marseille – France</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Identification de l'entreprise</h2>
              <ul className="list-none space-y-2">
                <li><strong className="text-white">Forme juridique :</strong> SARLU au capital social de 1 600 €</li>
                <li><strong className="text-white">SIREN :</strong> 504 166 588 00021</li>
                <li><strong className="text-white">RCS :</strong> Marseille</li>
                <li><strong className="text-white">Adresse postale :</strong> ZI Saint-Pierre, 553 rue Saint-Pierre, 13012 Marseille – France</li>
              </ul>
              <p className="mt-4 text-sm">
                Conditions Générales de Vente disponibles sur demande à : <a href="mailto:devis@poker-agency.com" className="text-[#33ffcc] hover:underline">devis@poker-agency.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Directeur de la publication</h2>
              <ul className="list-none space-y-2">
                <li><strong className="text-white">Nom :</strong> Vincent Driancourt</li>
                <li><strong className="text-white">Email :</strong> <a href="mailto:communication@poker-agency.com" className="text-[#33ffcc] hover:underline">communication@poker-agency.com</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Hébergement</h2>
              <ul className="list-none space-y-2">
                <li><strong className="text-white">Hébergeur :</strong> Vercel Inc.</li>
                <li><strong className="text-white">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Délégué à la Protection des Données (DPO)</h2>
              <ul className="list-none space-y-2">
                <li><strong className="text-white">Nom :</strong> Benjamin Surrel</li>
                <li><strong className="text-white">Email :</strong> <a href="mailto:communication@poker-agency.com" className="text-[#33ffcc] hover:underline">communication@poker-agency.com</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Crédits</h2>
              <ul className="list-none space-y-2">
                <li><strong className="text-white">Photos / contenus :</strong> Vincent Driancourt</li>
                <li><strong className="text-white">Site :</strong> <a href="https://vinced-photo.fr/" target="_blank" rel="noopener noreferrer" className="text-[#33ffcc] hover:underline">https://vinced-photo.fr/</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Propriété intellectuelle</h2>
              <p className="mb-4">
                Poker Agency est propriétaire des droits de propriété intellectuelle et détient les droits d'usage sur l'ensemble
                des éléments accessibles sur le site, notamment : textes, images, graphismes, logos, vidéos, architecture, icônes et sons.
              </p>
              <p className="mb-4">
                Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, de tout élément du site,
                quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de Poker Agency.
              </p>
              <p>
                Toute exploitation non autorisée du site ou de l'un quelconque de ses éléments constitue une contrefaçon et pourra
                faire l'objet de poursuites conformément aux articles L.335-2 et suivants du Code de la propriété intellectuelle.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Limitations de responsabilité</h2>
              <p className="mb-4">
                Poker Agency ne pourra être tenue responsable des dommages directs ou indirects causés au matériel de l'utilisateur
                lors de l'accès au site <a href="https://www.locagame.net" className="text-[#33ffcc] hover:underline">https://www.locagame.net</a>.
              </p>
              <p className="mb-4">
                Poker Agency décline toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur le site.
              </p>
              <p className="mb-4">
                Poker Agency met en œuvre des moyens raisonnables pour sécuriser le site. Toutefois, sa responsabilité ne pourra être
                engagée en cas d'introduction frauduleuse de données ou de contenus malveillants à son insu.
              </p>
              <p>
                Des espaces interactifs (formulaires de contact, commentaires) sont à la disposition des utilisateurs. Poker Agency se réserve
                le droit de supprimer, sans préavis, tout contenu contrevenant à la législation française, notamment en matière de protection
                des données ou de propos illicites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Données personnelles – CNIL</h2>
              <p className="mb-4">
                Conformément à la loi n°78-17 du 6 janvier 1978 modifiée et au RGPD, l'utilisateur dispose d'un droit d'accès,
                de rectification, d'opposition, de limitation et de suppression des données personnelles le concernant.
              </p>
              <p className="mb-4">
                Pour exercer ces droits, l'utilisateur peut contacter le Délégué à la Protection des Données :
                <br />Benjamin Surrel – <a href="mailto:communication@poker-agency.com" className="text-[#33ffcc] hover:underline">communication@poker-agency.com</a>
              </p>
              <p>
                Pour plus d'informations, l'utilisateur est invité à consulter la page :{' '}
                <Link to="/confidentialite" className="text-[#33ffcc] hover:underline">Politique de confidentialité</Link>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Liens hypertextes et cookies</h2>
              <p className="mb-4">
                Le site <a href="https://www.locagame.net" className="text-[#33ffcc] hover:underline">https://www.locagame.net</a> peut contenir
                des liens vers d'autres sites internet. Poker Agency décline toute responsabilité concernant le contenu de ces sites tiers.
              </p>
              <p className="mb-4">
                La navigation sur le site est susceptible d'entraîner l'installation de cookies sur le terminal de l'utilisateur.
                Les cookies permettent notamment de mesurer la fréquentation du site.
              </p>
              <p className="mb-4">
                Aucun cookie non essentiel n'est déposé sans le consentement préalable de l'utilisateur.
                Les cookies sont conservés pour une durée maximale de 13 mois.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Droit applicable et juridiction</h2>
              <p className="mb-4">
                Tout litige relatif à l'utilisation du site <a href="https://www.locagame.net" className="text-[#33ffcc] hover:underline">https://www.locagame.net</a> est soumis au droit français.
              </p>
              <p>
                Sauf disposition légale contraire, les tribunaux compétents de Marseille sont seuls compétents.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
