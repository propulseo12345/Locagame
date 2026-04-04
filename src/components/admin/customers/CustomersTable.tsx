import { Users } from 'lucide-react';
import { Customer } from '../../../types';
import CustomerRow from './CustomerRow';
import { TableRowSkeleton } from '../../ui/skeletons';

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onDeleteClick: (customer: Customer) => void;
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
        <table className="w-full" aria-label="Liste des clients">
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Réservations</th>
              <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Dépenses</th>
              <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Panier moyen</th>
              <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Membre depuis</th>
              <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <TableRowSkeleton columns={7} rows={6} />
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
