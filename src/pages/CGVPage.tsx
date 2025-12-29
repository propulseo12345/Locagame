import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function CGVPage() {
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
              <FileText className="w-5 h-5 text-[#33ffcc]" />
              <span className="text-[#33ffcc] font-semibold">Document légal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Conditions Générales de <span className="gradient-text">Vente</span>
            </h1>
            <p className="text-gray-400">LOCAGAME - Poker Agency</p>
          </div>

          {/* Content */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Objet</h2>
              <p>
                Les présentes Conditions Générales de Vente régissent les prestations de location de jeux proposées par LOCAGAME, exploité par Poker Agency.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Prestations proposées</h2>
              <p className="mb-4">Les jeux sont proposés :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>En location simple (retrait et retour dans nos locaux)</li>
                <li>Avec option livraison et installation</li>
                <li>Ou en prestation complète avec animateurs, croupiers et régisseurs professionnels</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Devis et tarifs</h2>
              <p className="mb-4">
                Les tarifs sont exprimés hors taxes. TVA applicable : 20 %.
              </p>
              <p>
                Un devis détaillé peut être demandé via le formulaire de contact ou par téléphone.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Réservation</h2>
              <p className="mb-4">La réservation est effective à réception :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Du devis signé</li>
                <li>D'un acompte de 50 % du montant total de la location</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Documents à fournir</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#33ffcc] mb-3">Particuliers</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Devis signé</li>
                    <li>Pièce d'identité</li>
                    <li>Justificatif de domicile</li>
                    <li>Chèque de caution</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#33ffcc] mb-3">Entreprises</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Devis signé</li>
                    <li>Pièce d'identité</li>
                    <li>Extrait Kbis de moins de 3 mois</li>
                    <li>Chèque de caution</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#33ffcc] mb-3">Associations</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Devis signé</li>
                    <li>Pièce d'identité</li>
                    <li>Récépissé de déclaration en préfecture</li>
                    <li>Chèque de caution</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Enlèvement et transport</h2>
              <p className="mb-4">
                L'enlèvement s'effectue sur rendez-vous, du lundi au samedi de 9h à 18h, dans les locaux situés :
              </p>
              <p className="mb-4 text-white font-medium">
                ZI Saint-Pierre – 553, rue Saint-Pierre – 13012 Marseille
              </p>
              <p>
                Le client doit prévoir un véhicule adapté. Poker Agency se réserve le droit de refuser la location si le véhicule est inadapté.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Retour et paiement</h2>
              <p className="mb-4">
                Le paiement peut être effectué par chèque ou espèces à la commande, au retrait ou à la livraison.
              </p>
              <p className="mb-4">
                Le retour du matériel s'effectue sur rendez-vous.
              </p>
              <p>
                En cas de matériel manquant ou détérioré, la caution pourra être conservée jusqu'à l'établissement d'un devis de réparation ou de remplacement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Options</h2>
              <p className="mb-4">
                Livraison, installation, démontage, animateurs, croupiers et régisseurs sont disponibles en option.
              </p>
              <p>
                Poker Agency peut également proposer l'organisation complète de l'événement.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
