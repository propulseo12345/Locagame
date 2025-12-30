import { useState, useEffect, useMemo } from 'react';
import { CustomersService } from '../../services';
import { Customer } from '../../types';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const data = await CustomersService.getAllCustomers();
        setCustomers(data);
      } catch (err) {
        console.error('Erreur chargement clients:', err);
      } finally {
        setLoading(false);
      }
    };
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

  const getSegmentBadge = (segment: string) => {
    const styles = {
      VIP: 'bg-yellow-100 text-yellow-800',
      nouveau: 'bg-blue-100 text-blue-800',
      inactif: 'bg-gray-100 text-gray-800',
      standard: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[segment as keyof typeof styles] || 'bg-gray-100'}`}>
        {segment}
      </span>
    );
  };

  const stats = useMemo(() => ({
    total: customers.length,
    particulier: customers.filter(c => c.customer_type === 'individual').length,
    professionnel: customers.filter(c => c.customer_type === 'professional').length,
    vip: 0, // VIP tracking not implemented yet
    actif: customers.length // All loaded customers are considered active
  }), [customers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#33ffcc] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Gérez votre base de clients</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Total clients</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Particuliers</div>
          <div className="text-2xl font-bold text-blue-600">{stats.particulier}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Professionnels</div>
          <div className="text-2xl font-bold text-purple-600">{stats.professionnel}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">VIP</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.vip}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Actifs</div>
          <div className="text-2xl font-bold text-green-600">{stats.actif}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <input
              type="text"
              placeholder="Nom, email, entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="individual">Particulier</option>
              <option value="professional">Professionnel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réservations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dépenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Panier moyen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre depuis</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.first_name} {customer.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{customer.email}</div>
                    <div className="text-xs text-gray-500">{customer.phone || 'N/A'}</div>
                    {customer.company_name && (
                      <div className="text-xs text-blue-600 font-medium mt-1">{customer.company_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      customer.customer_type === 'professional'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {customer.customer_type === 'professional' ? 'Pro' : 'Part'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">-</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xl font-bold text-gray-900">-</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">-</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {customer.loyalty_points || 0} pts
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString('fr-FR', {
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-[#33ffcc] hover:text-[#66cccc]">
                      Voir profil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun client trouvé
          </div>
        )}
      </div>
    </div>
  );
}
