import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ReservationsService, DeliveryService, TechniciansService } from '../../services';
import { Order } from '../../types';
import { X, Truck, User } from 'lucide-react';

interface Technician {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  vehicle_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'van';
  capacity: number;
  license_plate: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UnassignedReservation extends Order {
  delivery_task_id?: string;
}

export default function AdminReservations() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [allReservations, setAllReservations] = useState<Order[]>([]);
  const [unassignedReservations, setUnassignedReservations] = useState<UnassignedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<UnassignedReservation | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allRes, unassignedRes, techs, vehs] = await Promise.all([
        ReservationsService.getAllReservations(),
        ReservationsService.getUnassignedReservations(),
        TechniciansService.getAllTechnicians(),
        TechniciansService.getAllVehicles(),
      ]);
      setAllReservations(allRes);
      setUnassignedReservations(unassignedRes);
      setTechnicians(techs);
      setVehicles(vehs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = allReservations.filter(reservation => {
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const customer = reservation.customer as any;
    const customerName = customer?.first_name && customer?.last_name
      ? `${customer.first_name} ${customer.last_name}`
      : customer?.email || '';
    const matchesSearch = 
      (reservation.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      delivered: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      preparing: 'En préparation',
      delivered: 'Livré',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handleAssignClick = (reservation: UnassignedReservation) => {
    setSelectedReservation(reservation);
    setSelectedTechnician('');
    setSelectedVehicle('');
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedReservation || !selectedTechnician || !selectedVehicle) {
      alert('Veuillez sélectionner un technicien et un véhicule');
      return;
    }

    if (!selectedReservation.delivery_task_id) {
      alert('Erreur: tâche de livraison introuvable');
      return;
    }

    try {
      setAssigning(true);
      await DeliveryService.assignTask(
        selectedReservation.delivery_task_id,
        selectedTechnician,
        selectedVehicle
      );
      
      // Recharger les données
      await loadData();
      setShowAssignModal(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Erreur lors de l\'assignation. Veuillez réessayer.');
    } finally {
      setAssigning(false);
    }
  };

  const stats = {
    total: allReservations.length,
    pending: allReservations.filter(r => r.status === 'pending').length,
    confirmed: allReservations.filter(r => r.status === 'confirmed').length,
    preparing: allReservations.filter(r => r.status === 'preparing').length,
    delivered: allReservations.filter(r => r.status === 'delivered').length,
    completed: allReservations.filter(r => r.status === 'completed').length,
    unassigned: unassignedReservations.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réservations</h1>
          <p className="text-gray-600 mt-1">Gérez toutes les réservations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">En attente</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Confirmées</div>
          <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">En préparation</div>
          <div className="text-2xl font-bold text-purple-600">{stats.preparing}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Livrées</div>
          <div className="text-2xl font-bold text-indigo-600">{stats.delivered}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Terminées</div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow-sm p-4 border border-orange-200">
          <div className="text-sm text-orange-600">Non assignées</div>
          <div className="text-2xl font-bold text-orange-600">{stats.unassigned}</div>
        </div>
      </div>

      {/* Tableau des réservations non assignées */}
      {unassignedReservations.length > 0 && (
        <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                Commandes à assigner ({unassignedReservations.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Ces réservations nécessitent une assignation à un technicien
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">N° Commande</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date livraison</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Adresse</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unassignedReservations.map((reservation) => {
                  const customer = reservation.customer as any;
                  const address = reservation.delivery_address as any;
                  return (
                    <tr key={reservation.id} className="hover:bg-orange-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.id.substring(0, 8).toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {customer?.first_name} {customer?.last_name}
                        </div>
                        <div className="text-xs text-gray-500">{customer?.email}</div>
                        {customer?.company_name && (
                          <div className="text-xs text-blue-600">{customer.company_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date((reservation as any).start_date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(reservation as any).delivery_time || 'Non spécifié'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {address ? (
                          <div className="text-sm text-gray-900">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                            <div className="text-xs text-gray-500">
                              {address.postal_code} {address.city}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">Adresse non disponible</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {(reservation as any).total || reservation.total}€
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(reservation.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleAssignClick(reservation)}
                          className="px-4 py-2 bg-[#33ffcc] hover:bg-[#66cccc] text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Assigner
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <input
              type="text"
              placeholder="N° commande, nom client, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="preparing">En préparation</option>
              <option value="delivered">Livré</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => {
                const customer = reservation.customer as any;
                const items = (reservation as any).reservation_items || [];
                return (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.id.substring(0, 8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer?.first_name} {customer?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{customer?.email}</div>
                      {customer?.company_name && (
                        <div className="text-xs text-blue-600">{customer.company_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{items.length} produit(s)</div>
                      {items.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {items.slice(0, 2).map((item: any, idx: number) => (
                            <span key={idx}>
                              {item.quantity}x {item.product_id?.substring(0, 8) || 'Produit'}
                              {idx < Math.min(items.length, 2) - 1 && ', '}
                            </span>
                          ))}
                          {items.length > 2 && '...'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date((reservation as any).start_date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        au {new Date((reservation as any).end_date).toLocaleDateString('fr-FR')}
                      </div>
                      {(reservation as any).delivery_time && (
                        <div className="text-xs text-gray-500">
                          Livraison: {(reservation as any).delivery_time}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xl font-bold text-gray-900">
                        {(reservation as any).total || reservation.total}€
                      </div>
                      {(reservation as any).discount > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          -{(reservation as any).discount}€
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-xs font-medium ${
                        (reservation as any).payment_status === 'completed' || reservation.payment_status === 'paid' 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }`}>
                        {(reservation as any).payment_status === 'completed' || reservation.payment_status === 'paid' 
                          ? '✅ Payé' 
                          : '⏳ En attente'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(reservation as any).payment_method || 'Non spécifié'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/reservations/${reservation.id}`}
                        className="text-[#33ffcc] hover:text-[#66cccc]"
                      >
                        Voir détails
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredReservations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucune réservation trouvée
          </div>
        )}
      </div>

      {/* Modal d'assignation */}
      {showAssignModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Assigner une livraison</h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedReservation(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Infos de la réservation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Détails de la commande</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <div className="font-medium text-gray-900">
                      {(selectedReservation.customer as any)?.first_name} {(selectedReservation.customer as any)?.last_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Date livraison:</span>
                    <div className="font-medium text-gray-900">
                      {new Date((selectedReservation as any).start_date).toLocaleDateString('fr-FR')}
                      {(selectedReservation as any).delivery_time && ` à ${(selectedReservation as any).delivery_time}`}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Adresse:</span>
                    <div className="font-medium text-gray-900">
                      {((selectedReservation as any).delivery_address as any)?.address_line1 || 'Non spécifiée'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sélection technicien */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Technicien
                </label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => {
                    setSelectedTechnician(e.target.value);
                    // Si le technicien a un véhicule assigné, le sélectionner automatiquement
                    const tech = technicians.find(t => t.id === e.target.value);
                    if (tech?.vehicle_id) {
                      setSelectedVehicle(tech.vehicle_id);
                    } else {
                      setSelectedVehicle('');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                >
                  <option value="">Sélectionner un technicien...</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.first_name} {tech.last_name} {tech.vehicle_id ? '(Véhicule assigné)' : '(Sans véhicule)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection véhicule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="w-4 h-4 inline mr-2" />
                  Véhicule
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  disabled={!selectedTechnician}
                >
                  <option value="">Sélectionner un véhicule...</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.license_plate} ({vehicle.type === 'truck' ? 'Camion' : 'Fourgon'})
                    </option>
                  ))}
                </select>
                {!selectedTechnician && (
                  <p className="mt-1 text-xs text-gray-500">Sélectionnez d'abord un technicien</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedReservation(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={assigning}
              >
                Annuler
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedTechnician || !selectedVehicle || assigning}
                className="px-4 py-2 bg-[#33ffcc] hover:bg-[#66cccc] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? 'Assignation...' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
