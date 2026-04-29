import { TrendingUp, Calendar } from 'lucide-react';
import { formatPrice } from '../../../utils/pricing';

interface ClientSidebarStatsProps {
  totalSpent: number;
  memberSince: string | null;
}

export default function ClientSidebarStats({ totalSpent, memberSince }: ClientSidebarStatsProps) {
  const memberDate = memberSince
    ? new Date(memberSince).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="px-4 pb-4">
      <div className="border-t border-white/[0.06] pt-3 space-y-2">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-medium leading-none">Total dépensé</p>
            <p className="text-xs font-bold text-white tabular-nums mt-0.5">{formatPrice(totalSpent)}</p>
          </div>
        </div>

        {memberDate && (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-3 h-3 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 font-medium leading-none">Membre depuis</p>
              <p className="text-xs font-semibold text-white capitalize mt-0.5">{memberDate}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
