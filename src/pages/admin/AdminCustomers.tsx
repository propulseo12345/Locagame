import { useState, useEffect, useMemo } from 'react';
import { Trash2, Search, Users, User, Building2, Star, UserCheck, X } from 'lucide-react';
import { CustomersService } from '../../services';
import { Customer } from '../../types';
import DeleteCustomerModal from '../../components/admin/DeleteCustomerModal';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Customer | null>(null);

  const loadCustomers = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await CustomersService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Impossible de charger la liste des clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch =
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.company_name && customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'all' || customer.customer_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [customers, searchTerm, typeFilter]);

  const stats = useMemo(() => ({
    total: customers.length,
    particulier: customers.filter(c => c.customer_type === 'individual').length,
    professionnel: customers.filter(c => c.customer_type === 'professional').length,
    vip: 0,
    actif: customers.length
  }), [customers]);

  const hasActiveFilters = searchTerm !== '' || typeFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-gray-200 animate-pulse">
              <div className="h-3 w-20 bg-gray-100 rounded mb-3" />
              <div className="h-7 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-11 flex-1 min-w-[240px] bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-11 w-44 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        {/* Table skeleton */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 flex gap-8">
            {['w-24', 'w-16', 'w-20', 'w-20', 'w-20', 'w-24'].map((w, i) => (
              <div key={i} className={`h-3 ${w} bg-gray-200 rounded animate-pulse`} />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-4 border-t border-gray-100 flex gap-8 items-center animate-pulse">
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-36 bg-gray-200 rounded" />
                <div className="h-3 w-48 bg-gray-100 rounded" />
              </div>
              <div className="h-5 w-12 bg-gray-100 rounded-md" />
              <div className="h-4 w-6 bg-gray-100 rounded" />
              <div className="h-4 w-8 bg-gray-100 rounded" />
              <div className="h-4 w-8 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-l-red-500 rounded-r-lg p-4 flex items-center justify-between">
          <p className="text-red-700 text-sm font-medium">{error}</p>
          <button
            onClick={loadCustomers}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Clients
            <span className="text-gray-400 font-normal ml-2 text-lg">{customers.length}</span>
          </h1>
          <p className="text-gray-600 mt-0.5 text-sm">Gérez votre base de clients</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 border-l-4 border-l-gray-400 rounded-xl p-4 hover:shadow-md transition-all relative">
          <Users className="w-4 h-4 text-gray-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total clients</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <User className="w-4 h-4 text-blue-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Particuliers</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{stats.particulier}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-violet-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <Building2 className="w-4 h-4 text-violet-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Professionnels</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{stats.professionnel}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-yellow-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <Star className="w-4 h-4 text-yellow-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">VIP</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{stats.vip}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-green-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <UserCheck className="w-4 h-4 text-green-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Actifs</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{stats.actif}</div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Nom, email, entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-9 pr-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-11 w-44 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
        >
          <option value="all">Tous les types</option>
          <option value="individual">Particulier</option>
          <option value="professional">Professionnel</option>
        </select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="h-11 flex items-center gap-1.5 px-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Effacer
          </button>
        )}
        <span className="text-sm text-gray-500 ml-auto">
          {filteredCustomers.length} · {customers.length} clients
        </span>
      </div>

      {/* Customers Table */}
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
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">Aucun client ne correspond</p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 text-sm text-gray-900 underline underline-offset-2 hover:no-underline"
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, idx) => (
                  <tr
                    key={customer.id}
                    className={`border-l-4 hover:bg-gray-100/60 cursor-pointer transition-colors ${
                      customer.customer_type === 'professional'
                        ? 'border-l-violet-400'
                        : 'border-l-blue-400'
                    } ${idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.first_name} {customer.last_name}
                      </div>
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
                      <div className="text-sm font-medium text-gray-900">-</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 tabular-nums">-</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 tabular-nums">-</div>
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
                          onClick={() => setShowDeleteConfirm(customer)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteConfirm && (
        <DeleteCustomerModal
          customer={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onDeleted={(id) => {
            setCustomers(customers.filter(c => c.id !== id));
            setShowDeleteConfirm(null);
          }}
        />
      )}
    </div>
  );
}
