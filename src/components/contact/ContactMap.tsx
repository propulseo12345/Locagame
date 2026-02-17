import { MapPin } from 'lucide-react';

export default function ContactMap() {
  return (
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
  );
}
