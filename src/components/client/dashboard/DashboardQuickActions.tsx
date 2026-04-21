import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, MessageCircle, ArrowRight } from 'lucide-react';

export default function DashboardQuickActions() {
  const actions = [
    {
      label: 'Parcourir le catalogue',
      description: 'Découvrir nos jeux',
      href: '/catalogue',
      icon: ShoppingBag,
      color: 'text-[#33ffcc]',
      iconBg: 'bg-[#33ffcc]/10',
      hoverBorder: 'hover:border-[#33ffcc]/20',
    },
    {
      label: 'Mes favoris',
      description: 'Produits sauvegardés',
      href: '/client/favorites',
      icon: Heart,
      color: 'text-[#fe1979]',
      iconBg: 'bg-[#fe1979]/10',
      hoverBorder: 'hover:border-[#fe1979]/20',
    },
    {
      label: 'Nous contacter',
      description: 'Demande de devis',
      href: '/contact',
      icon: MessageCircle,
      color: 'text-[#66cccc]',
      iconBg: 'bg-[#66cccc]/10',
      hoverBorder: 'hover:border-[#66cccc]/20',
    },
  ];

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Actions rapides</h3>

      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              to={action.href}
              className={`group flex items-center gap-3 p-3 rounded-lg border border-white/[0.04] ${action.hoverBorder} hover:bg-white/[0.03] transition-all duration-200`}
            >
              <div className={`w-9 h-9 rounded-lg ${action.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{action.label}</p>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
