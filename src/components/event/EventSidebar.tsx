import { Star } from 'lucide-react';
import { type PortfolioEvent } from '../../services';

interface EventSidebarProps {
  event: PortfolioEvent;
}

export default function EventSidebar({ event }: EventSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="lg:sticky lg:top-32 space-y-6 animate-fade-in-delay">
        {/* Statistiques */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#33ffcc]" />
            Informations
          </h3>
          <div className="space-y-4">
            {event.event_date && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400 text-sm">Date</span>
                <span className="font-bold text-[#33ffcc]">
                  {new Date(event.event_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
            {event.guest_count && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400 text-sm">Invités</span>
                <span className="font-bold text-[#66cccc]">{event.guest_count}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400 text-sm">Lieu</span>
                <span className="font-bold text-[#33ffcc] text-right text-sm">{event.location}</span>
              </div>
            )}
            {event.event_type && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400 text-sm">Type</span>
                <span className="font-bold text-[#66cccc]">{event.event_type.name}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
