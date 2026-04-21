import { Calendar, Sparkles } from 'lucide-react';
import { Order } from '../../../types';

interface DashboardHeroProps {
  firstName: string;
  reservations: Order[];
}

function getContextualMessage(reservations: Order[]): { text: string; accent: boolean } | null {
  const now = new Date();
  const upcoming = reservations
    .filter(r => r.status === 'confirmed' || r.status === 'preparing')
    .filter(r => new Date(r.start_date + 'T00:00:00') >= now)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const startDate = new Date(next.start_date + 'T00:00:00');
  const diffDays = Math.ceil((startDate.getTime() - now.getTime()) / 86400000);

  if (diffDays === 0) return { text: "Votre événement commence aujourd'hui !", accent: true };
  if (diffDays === 1) return { text: 'Votre événement commence demain !', accent: true };
  if (diffDays <= 7) return { text: `Prochain événement dans ${diffDays} jours`, accent: true };
  return { text: `Prochain événement le ${startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`, accent: false };
}

export default function DashboardHero({ firstName, reservations }: DashboardHeroProps) {
  const contextual = getContextualMessage(reservations);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="relative overflow-hidden">
      {/* Greeting */}
      <div className="mb-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {greeting}, <span className="text-[#33ffcc]">{firstName}</span>
        </h1>
      </div>

      {/* Contextual message */}
      {contextual ? (
        <div className="flex items-center gap-2 mt-2">
          {contextual.accent ? (
            <Sparkles className="w-4 h-4 text-[#33ffcc] flex-shrink-0" />
          ) : (
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <p className={`text-sm ${contextual.accent ? 'text-[#33ffcc] font-medium' : 'text-gray-400'}`}>
            {contextual.text}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-400 mt-2">Gérez vos réservations et votre compte</p>
      )}
    </div>
  );
}
