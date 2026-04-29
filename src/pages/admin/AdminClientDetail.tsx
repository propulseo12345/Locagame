import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Calendar, Package, Euro, Trash2 } from 'lucide-react';
import { CustomersService, ReservationsService } from '../../services';
import { Customer, Order } from '../../types';
import DeleteCustomerModal from '../../components/admin/DeleteCustomerModal';
import { AdminPageSkeleton } from '../../components/ui/skeletons';
import { formatPrice } from '../../utils/pricing';

export default function AdminClientDetail() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [reservations, setReservations] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [customerData, allReservations] = await Promise.all([
        CustomersService.getCustomerById(id!),
        ReservationsService.getAllReservations(),
      ]);

      if (!customerData) {
        setError('Client introuvable');
        return;
      }

      setCustomer(customerData);
      setReservations(allReservations.filter(r => r.customer_id === id));
    } catch {
      setError('Erreur lors du chargement des données client.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AdminPageSkeleton type="detail" />;
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Client introuvable</h3>
          <p className="text-gray-600 mb-4">{error || 'Ce client n\'existe pas'}</p>
          <Link
            to="/admin/customers"
            className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retour aux clients
          </Link>
        </div>
      </div>
    );
  }

  const validReservations = reservations.filter(r => r.status !== 'cancelled');
  const totalSpent = validReservations.reduce((sum, r) => sum + (r.total || 0), 0);
  const avgBasket = validReservations.length > 0 ? totalSpent / validReservations.length : 0;

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    completed: 'Terminée',
  };

  const statusColors: Record<string, string> = {
    pending: 'ring-amber-200 bg-amber-50 text-amber-700',
    confirmed: 'ring-blue-200 bg-blue-50 text-blue-700',
    delivered: 'ring-green-200 bg-green-50 text-green-700',
    cancelled: 'ring-red-200 bg-red-50 text-red-700',
    completed: 'ring-gray-200 bg-gray-50 text-gray-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/customers"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">
                {customer.first_name} {customer.last_name}
              </h1>
              {customer.customer_type === 'professional' ? (
                <span className="ring-1 ring-violet-200 bg-violet-50 text-violet-700 rounded-md px-2.5 py-0.5 text-xs font-medium">
                  Pro
                </span>
              ) : (
                <span className="ring-1 ring-blue-200 bg-blue-50 text-blue-700 rounded-md px-2.5 py-0.5 text-xs font-medium">
                  Particulier
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              <Link to="/admin/customers" className="hover:text-gray-700">Clients</Link>
              <span className="mx-1.5">/</span>
              <span>{customer.first_name} {customer.last_name}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Réservations</p>
            <Package className="w-4 h-4 text-blue-400 shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900">{validReservations.length}</p>
          <p className="text-xs text-gray-500 mt-1">{reservations.length} total (incl. annulées)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-green-500 p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total dépensé</p>
            <Euro className="w-4 h-4 text-green-400 shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900">{formatPrice(totalSpent)}</p>
          <p className="text-xs text-gray-500 mt-1">Panier moyen : {avgBasket > 0 ? formatPrice(avgBasket) : '-'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-violet-500 p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Membre depuis</p>
            <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {customer.created_at
              ? new Date(customer.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {customer.loyalty_points || 0} points de fidélité
          </p>
        </div>
      </div>

      {/* Informations client */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <a href={`mailto:${customer.email}`} className="text-sm text-blue-600 hover:underline">
                {customer.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{customer.phone || 'Non renseigné'}</span>
            </div>
          </div>
          <div className="space-y-3">
            {customer.company_name && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{customer.company_name}</span>
              </div>
            )}
            {customer.siret && (
              <div>
                <span className="text-xs text-gray-500">SIRET : </span>
                <span className="text-sm font-medium text-gray-900">{customer.siret}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historique des réservations */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Historique des réservations
            <span className="text-gray-400 font-normal ml-2">({reservations.length})</span>
          </h2>
        </div>
        {reservations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucune réservation</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">N° commande</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/reservations/${reservation.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {reservation.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {reservation.created_at
                        ? new Date(reservation.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`ring-1 rounded-md px-2.5 py-1 text-xs font-medium ${statusColors[reservation.status] || 'ring-gray-200 bg-gray-50 text-gray-700'}`}>
                        {statusLabels[reservation.status] || reservation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold tabular-nums text-gray-900">
                        {reservation.total ? formatPrice(reservation.total) : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {showDeleteConfirm && (
        <DeleteCustomerModal
          customer={customer}
          onClose={() => setShowDeleteConfirm(false)}
          onDeleted={() => {
            window.location.href = '/admin/customers';
          }}
        />
      )}
    </div>
  );
}
