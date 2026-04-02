import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Customer } from '../../../types';

interface CustomerRowProps {
  customer: Customer;
  isEven: boolean;
  onDeleteClick: (customer: Customer) => void;
}

function computeReservationStats(customer: Customer) {
  const res = (customer as any).reservations || [];
  const valid = res.filter((r: any) => r.status !== 'cancelled');
  const totalSpent = valid.reduce((sum: number, r: any) => sum + (r.total || 0), 0);
  const avgBasket = valid.length > 0 ? totalSpent / valid.length : 0;
  return { validCount: valid.length, totalSpent, avgBasket };
}

export default function CustomerRow({ customer, isEven, onDeleteClick }: CustomerRowProps) {
  const { validCount, totalSpent, avgBasket } = computeReservationStats(customer);

  return (
    <tr
      className={`border-l-4 hover:bg-gray-100/60 cursor-pointer transition-colors ${
        customer.customer_type === 'professional'
          ? 'border-l-violet-400'
          : 'border-l-blue-400'
      } ${isEven ? 'bg-gray-50/40' : 'bg-white'}`}
    >
      <td className="px-4 py-3.5">
        <Link to={`/admin/customers/${customer.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline">
          {customer.first_name} {customer.last_name}
        </Link>
        <div className="text-xs text-gray-500">{customer.email}</div>
        <div className="text-xs text-gray-400">{customer.phone || 'N/A'}</div>
        {customer.company_name && (
          <div className="text-xs text-violet-600 font-medium mt-0.5">{customer.company_name}</div>
        )}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        {customer.customer_type === 'professional' ? (
          <span className="ring-1 ring-violet-200 bg-violet-50 text-violet-700 rounded-md px-2.5 py-1 text-xs font-medium">
            Pro
          </span>
        ) : (
          <span className="ring-1 ring-blue-200 bg-blue-50 text-blue-700 rounded-md px-2.5 py-1 text-xs font-medium">
            Part.
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{validCount || '-'}</div>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900 tabular-nums">
          {totalSpent > 0 ? `${totalSpent.toFixed(0)} €` : '-'}
        </div>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900 tabular-nums">
          {avgBasket > 0 ? `${avgBasket.toFixed(0)} €` : '-'}
        </div>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="text-sm text-gray-600">
          {customer.created_at
            ? new Date(customer.created_at).toLocaleDateString('fr-FR', {
                month: 'short',
                year: 'numeric',
              })
            : 'N/A'}
        </div>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onDeleteClick(customer)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
