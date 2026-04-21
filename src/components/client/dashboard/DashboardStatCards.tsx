import { Link } from 'react-router-dom';
import { Package, TrendingUp, Star, ArrowUpRight } from 'lucide-react';

interface DashboardStatCardsProps {
  activeReservations: number;
  totalReservations: number;
  totalSpent: number;
}

export default function DashboardStatCards({ activeReservations, totalReservations, totalSpent }: DashboardStatCardsProps) {
  const cards = [
    {
      label: 'Actives',
      value: activeReservations.toString(),
      sub: activeReservations > 0 ? 'en cours' : 'aucune',
      icon: Package,
      color: 'text-[#33ffcc]',
      iconBg: 'bg-[#33ffcc]/10',
      link: '/client/reservations',
      highlight: activeReservations > 0,
    },
    {
      label: 'Réservations',
      value: totalReservations.toString(),
      sub: 'au total',
      icon: TrendingUp,
      color: 'text-violet-400',
      iconBg: 'bg-violet-500/10',
    },
    {
      label: 'Dépensé',
      value: `${totalSpent.toFixed(0)} €`,
      sub: 'cumulé',
      icon: Star,
      color: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const Wrapper = card.link ? Link : 'div';
        const wrapperProps = card.link ? { to: card.link } : {};

        return (
          <Wrapper
            key={card.label}
            {...(wrapperProps as any)}
            className={`group relative bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 transition-all duration-200 ${
              card.link ? 'hover:bg-white/[0.06] hover:border-white/[0.12] cursor-pointer' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              {card.link && (
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
              )}
            </div>

            <p className={`text-2xl font-bold tabular-nums leading-none ${card.highlight ? 'text-[#33ffcc]' : 'text-white'}`}>
              {card.value}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">{card.label} · {card.sub}</p>
          </Wrapper>
        );
      })}
    </div>
  );
}
