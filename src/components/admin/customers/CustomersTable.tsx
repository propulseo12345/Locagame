import { Users } from 'lucide-react';
import { Customer } from '../../../types';
import CustomerRow from './CustomerRow';

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onDeleteClick: (customer: Customer) => void;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-4">
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
          </td>
          <td className="px-4 py-4"><div className="h-5 w-12 bg-gray-100 rounded-md" /></td>
          <td className="px-4 py-4"><div className="h-4 w-6 bg-gray-100 rounded" /></td>
          <td className="px-4 py-4"><div className="h-4 w-8 bg-gray-100 rounded" /></td>
          <td className="px-4 py-4"><div className="h-4 w-8 bg-gray-100 rounded" /></td>
          <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
          <td className="px-4 py-4"><div className="h-4 w-6 bg-gray-100 rounded ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

export default function CustomersTable({
  customers,
  loading,
  hasActiveFilters,
  onClearFilters,
  onDeleteClick,
}: CustomersTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Réservations</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Dépenses</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Panier moyen</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Membre depuis</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <SkeletonRows />
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">Aucun client ne correspond</p>
                  {hasActiveFilters && (
                    <button
                      onClick={onClearFilters}
                      className="mt-3 text-sm text-gray-900 underline underline-offset-2 hover:no-underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              customers.map((customer, idx) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  isEven={idx % 2 === 1}
                  onDeleteClick={onDeleteClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
