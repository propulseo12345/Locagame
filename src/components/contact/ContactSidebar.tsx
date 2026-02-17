import { type FAQ } from '../../services';

interface ContactSidebarProps {
  faqs: FAQ[];
}

export default function ContactSidebar({ faqs }: ContactSidebarProps) {
  return (
    <div className="space-y-8">
      {/* FAQ */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Questions fréquentes</h3>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id}>
              <p className="text-white text-sm font-medium mb-1">{faq.question}</p>
              <p className="text-gray-400 text-sm">{faq.answer}</p>
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
  );
}
