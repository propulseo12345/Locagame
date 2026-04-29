import { Link } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import { Customer } from '../../../types';
import { formatPrice } from '../../../utils/pricing';
import CustomerRow from './CustomerRow';
import { TableRowSkeleton } from '../../ui/skeletons';

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onDeleteClick: (customer: Customer) => void;
}

/* ------------------------------------------------------------------ */
/*  Mobile customer card                                               */
/* ------------------------------------------------------------------ */
function computeStats(customer: Customer) {
  const res = (customer as any).reservations || [];
  const valid = res.filter((r: any) => r.status !== 'cancelled');
  const totalSpent = valid.reduce((sum: number, r: any) => sum + (r.total || 0), 0);
  return { validCount: valid.length, totalSpent };
}

function MobileCustomerCard({ customer }: { customer: Customer }) {
  const { validCount, totalSpent } = computeStats(customer);
  const isPro = customer.customer_type === 'professional';

  return (
    <Link
      to={`/admin/customers/${customer.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 active:scale-95 transition-transform"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {customer.first_name} {customer.last_name}
          </p>
          <p className="text-xs text-gray-500 truncate">{customer.email}</p>
        </div>
        {isPro ? (
          <span className="shrink-0 ring-1 ring-violet-200 bg-violet-50 text-violet-700 rounded-md px-2 py-0.5 text-[10px] font-medium">
            Pro
          </span>
        ) : (
          <span className="shrink-0 ring-1 ring-blue-200 bg-blue-50 text-blue-700 rounded-md px-2 py-0.5 text-[10px] font-medium">
            Part.
          </span>
        )}
      </div>

      {customer.company_name && (
        <p className="text-xs text-violet-600 font-medium mb-1">{customer.company_name}</p>
      )}

      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <span>{validCount} résa{validCount > 1 ? 's' : ''}</span>
        <span className="font-bold text-gray-900 tabular-nums">
          {totalSpent > 0 ? formatPrice(totalSpent) : '-'}
        </span>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function CustomersTable({
  customers,
  loading,
  hasActiveFilters,
  onClearFilters,
  onDeleteClick,
}: CustomersTableProps) {
  const emptyState = (
    <div className="py-16 text-center">
      <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-sm font-medium text-gray-500">Aucun client ne correspond</p>
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="mt-3 text-sm text-gray-900 underline underline-offset-2 hover:no-underline active:scale-95 transition-transform"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          emptyState
        ) : (
          customers.map((customer) => (
            <MobileCustomerCard key={customer.id} customer={customer} />
          ))
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
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
    </>
  );
}
