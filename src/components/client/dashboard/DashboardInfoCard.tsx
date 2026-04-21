import { Link } from 'react-router-dom';
import { User, Mail, Phone, ArrowRight } from 'lucide-react';
import { Customer } from '../../../types';

interface DashboardInfoCardProps {
  customer: Customer | null;
  email: string;
}

export default function DashboardInfoCard({ customer, email }: DashboardInfoCardProps) {
  const fields = [
    { icon: User, label: 'Nom', value: `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || 'Non renseigné' },
    { icon: Mail, label: 'Email', value: customer?.email || email },
    { icon: Phone, label: 'Téléphone', value: customer?.phone || 'Non renseigné' },
  ];

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Mes informations</h3>
        <Link
          to="/client/profile"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#33ffcc] transition-colors"
        >
          Modifier <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.label} className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">{field.label}</p>
                <p className="text-sm text-gray-200 truncate">{field.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
