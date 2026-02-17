import { useState } from 'react';
import { Send } from 'lucide-react';

interface ContactFormProps {
  onSubmitSuccess: () => void;
}

export default function ContactForm({ onSubmitSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    onSubmitSuccess();
  };

  return (
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
  );
}
