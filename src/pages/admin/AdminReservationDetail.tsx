import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Package,
  Truck,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Zap,
  Car,
  Building,
  Layers,
  MessageSquare
} from 'lucide-react';
import { ReservationsService } from '../../services';
import { Order } from '../../types';
import { supabase } from '../../lib/supabase';

export default function AdminReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [deliveryTasks, setDeliveryTasks] = useState<any[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadReservation();
      loadTechnicians();
      loadDeliveryTasks();
    }
  }, [id]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const data = await ReservationsService.getReservationById(id!);
      if (data) {
        setReservation(data);
      } else {
        setError('Réservation introuvable');
      }
    } catch (err) {
      console.error('Erreur chargement réservation:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const { data } = await supabase
        .from('technicians')
        .select('*')
        .eq('is_available', true)
        .order('name');
      setTechnicians(data || []);
    } catch (err) {
      console.error('Erreur chargement techniciens:', err);
    }
  };

  const loadDeliveryTasks = async () => {
    if (!id) return;
    try {
      const { data } = await supabase
        .from('delivery_tasks')
        .select('*, technician:technicians(*), vehicle:vehicles(*)')
        .eq('reservation_id', id)
        .order('scheduled_date');
      setDeliveryTasks(data || []);
    } catch (err) {
      console.error('Erreur chargement tâches:', err);
    }
  };

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!reservation) return;
    try {
      setUpdating(true);
      await ReservationsService.updateReservationStatus(reservation.id, newStatus);
      await loadReservation();
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignTechnician = async (taskId: string) => {
    if (!selectedTechnician) return;
    try {
      setUpdating(true);
      await supabase
        .from('delivery_tasks')
        .update({ technician_id: selectedTechnician })
        .eq('id', taskId);
      await loadDeliveryTasks();
      setSelectedTechnician('');
    } catch (err) {
      console.error('Erreur assignation technicien:', err);
      alert('Erreur lors de l\'assignation');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#33ffcc] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Réservation introuvable</h3>
          <p className="text-gray-600 mb-4">{error || 'Cette réservation n\'existe pas'}</p>
          <Link
            to="/admin/reservations"
            className="inline-block px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
          >
            Retour aux réservations
          </Link>
        </div>
      </div>
    );
  }

  const customer = reservation.customer as any;
  const recipientData = reservation.recipient_data as any;
  const eventDetails = reservation.event_details as any;
  const deliveryAddress = reservation.delivery_address as any;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      delivered: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      returned: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      delivered: 'Livrée',
      completed: 'Terminée',
      returned: 'Retournée',
      cancelled: 'Annulée'
    };
    return (
      <span className={`px-4 py-2 text-sm font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTaskTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      delivery: 'bg-blue-100 text-blue-800',
      pickup: 'bg-orange-100 text-orange-800',
      client_pickup: 'bg-green-100 text-green-800',
      client_return: 'bg-purple-100 text-purple-800'
    };
    const labels: Record<string, string> = {
      delivery: 'Livraison',
      pickup: 'Récupération',
      client_pickup: 'Retrait client',
      client_return: 'Retour client'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[type] || 'bg-gray-100'}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/reservations"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Détails de la réservation</h1>
            <p className="text-gray-600 mt-1">Commande #{reservation.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(reservation.status || 'pending')}
        </div>
      </div>

      {/* Actions rapides */}
      {reservation.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Cette réservation est en attente de validation</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('confirmed')}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Valider
            </button>
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={updating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Refuser
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">

          {/* Informations Client */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#33ffcc]" />
              Informations client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Nom complet</div>
                  <div className="font-medium text-gray-900">
                    {customer?.first_name} {customer?.last_name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${customer?.email}`} className="text-[#33ffcc] hover:underline">
                    {customer?.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${customer?.phone}`} className="text-[#33ffcc] hover:underline">
                    {customer?.phone}
                  </a>
                </div>
              </div>
              <div className="space-y-3">
                {customer?.is_professional && (
                  <>
                    <div className="flex items-center gap-2 text-purple-600">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Client professionnel</span>
                    </div>
                    {customer?.company_name && (
                      <div>
                        <div className="text-sm text-gray-500">Entreprise</div>
                        <div className="font-medium text-gray-900">{customer.company_name}</div>
                      </div>
                    )}
                    {customer?.siret && (
                      <div>
                        <div className="text-sm text-gray-500">SIRET</div>
                        <div className="font-medium text-gray-900">{customer.siret}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Réceptionnaire (si différent) */}
          {recipientData && !recipientData.sameAsCustomer && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Réceptionnaire sur place
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Nom complet</div>
                  <div className="font-medium text-gray-900">
                    {recipientData.firstName} {recipientData.lastName}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${recipientData.phone}`} className="text-[#33ffcc] hover:underline">
                      {recipientData.phone}
                    </a>
                  </div>
                  {recipientData.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${recipientData.email}`} className="text-[#33ffcc] hover:underline">
                        {recipientData.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mode de livraison */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {reservation.delivery_type === 'delivery' ? (
                <Truck className="w-5 h-5 text-blue-500" />
              ) : (
                <Package className="w-5 h-5 text-green-500" />
              )}
              {reservation.delivery_type === 'delivery' ? 'Livraison' : 'Retrait sur place'}
            </h2>

            <div className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Date de début</div>
                    <div className="font-medium text-gray-900">
                      {new Date(reservation.start_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Date de fin</div>
                    <div className="font-medium text-gray-900">
                      {new Date(reservation.end_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Créneaux */}
              {reservation.delivery_type === 'pickup' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Créneau retrait: </span>
                      <span className="font-medium">{reservation.pickup_time || reservation.pickup_slot || 'Non spécifié'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Créneau retour: </span>
                      <span className="font-medium">{reservation.return_time || 'Non spécifié'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Créneau livraison: </span>
                    <span className="font-medium">{reservation.delivery_time || 'Non spécifié'}</span>
                  </div>
                </div>
              )}

              {/* Adresse de livraison */}
              {reservation.delivery_type === 'delivery' && deliveryAddress && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Adresse de livraison</div>
                      <div className="font-medium text-gray-900">
                        {deliveryAddress.street || deliveryAddress.address}
                        {deliveryAddress.address_complement && (
                          <span className="block text-sm text-gray-600">{deliveryAddress.address_complement}</span>
                        )}
                        <span className="block">
                          {deliveryAddress.postal_code || deliveryAddress.postalCode} {deliveryAddress.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Détails de l'événement */}
          {eventDetails && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Détails de l'événement
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservation.event_type && (
                  <div>
                    <div className="text-sm text-gray-500">Type d'événement</div>
                    <div className="font-medium text-gray-900">{reservation.event_type}</div>
                  </div>
                )}
                {eventDetails.guestCount && (
                  <div>
                    <div className="text-sm text-gray-500">Nombre d'invités</div>
                    <div className="font-medium text-gray-900">{eventDetails.guestCount} personnes</div>
                  </div>
                )}
                {eventDetails.venueName && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Lieu / Salle</div>
                    <div className="font-medium text-gray-900">{eventDetails.venueName}</div>
                  </div>
                )}
              </div>

              {/* Accès au lieu */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Accès au lieu</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${eventDetails.hasElevator ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    <Building className="w-4 h-4" />
                    <span className="text-sm">Ascenseur {eventDetails.hasElevator ? '✓' : '✗'}</span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${eventDetails.parkingAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    <Car className="w-4 h-4" />
                    <span className="text-sm">Parking {eventDetails.parkingAvailable ? '✓' : '✗'}</span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${eventDetails.electricityAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Électricité {eventDetails.electricityAvailable ? '✓' : '✗'}</span>
                  </div>
                  {eventDetails.floorNumber && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-700">
                      <Layers className="w-4 h-4" />
                      <span className="text-sm">Étage {eventDetails.floorNumber}</span>
                    </div>
                  )}
                </div>

                {eventDetails.accessDifficulty && eventDetails.accessDifficulty !== 'Aucune' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800">
                      Difficulté d'accès: {eventDetails.accessDifficulty}
                    </div>
                    {eventDetails.accessDetails && (
                      <div className="text-sm text-yellow-700 mt-1">{eventDetails.accessDetails}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes / Demandes spéciales */}
          {reservation.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-500" />
                Notes / Demandes spéciales
              </h2>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{reservation.notes}</p>
              </div>
            </div>
          )}

          {/* Produits réservés */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#33ffcc]" />
              Produits réservés
            </h2>
            <div className="space-y-3">
              {(reservation.reservation_items || []).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product?.name || 'Produit'}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                      <span>Quantité: <strong>{item.quantity}</strong></span>
                      <span>Durée: <strong>{item.duration_days || 1} jour(s)</strong></span>
                      <span>Prix unitaire: <strong>{item.unit_price}€</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{item.subtotal}€</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tâches de livraison */}
          {deliveryTasks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-500" />
                Tâches de livraison
              </h2>
              <div className="space-y-4">
                {deliveryTasks.map((task: any) => (
                  <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getTaskTypeBadge(task.type)}
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status === 'completed' ? 'Terminée' :
                             task.status === 'in_progress' ? 'En cours' :
                             'Planifiée'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(task.scheduled_date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                            {task.scheduled_time && ` à ${task.scheduled_time}`}
                          </div>
                        </div>
                        {task.technician && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Technicien: </span>
                            <span className="font-medium text-gray-900">{task.technician.name}</span>
                          </div>
                        )}
                      </div>

                      {!task.technician_id && (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedTechnician}
                            onChange={(e) => setSelectedTechnician(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2"
                          >
                            <option value="">Assigner...</option>
                            {technicians.map(tech => (
                              <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignTechnician(task.id)}
                            disabled={!selectedTechnician || updating}
                            className="px-3 py-2 bg-[#33ffcc] text-[#000033] text-sm font-medium rounded-lg hover:bg-[#66cccc] disabled:opacity-50"
                          >
                            Assigner
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Récapitulatif financier */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Récapitulatif</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="text-gray-900">{reservation.subtotal || 0}€</span>
              </div>
              {(reservation.delivery_fee || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="text-gray-900">{reservation.delivery_fee}€</span>
                </div>
              )}
              {(reservation.discount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Réduction</span>
                  <span className="text-green-600">-{reservation.discount}€</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-[#33ffcc]">{reservation.total || 0}€</span>
              </div>
            </div>
          </div>

          {/* Statut et Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <select
                value={reservation.status}
                onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                disabled={updating}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
              >
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="preparing">En préparation</option>
                <option value="delivered">Livrée</option>
                <option value="returned">Retournée</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>

          {/* Informations légales */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Consentements</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {reservation.cgv_accepted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-gray-600">CGV acceptées</span>
              </div>
              <div className="flex items-center gap-2">
                {reservation.newsletter_accepted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-600">Newsletter</span>
              </div>
            </div>
          </div>

          {/* Dates système */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Informations</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                Créée le: {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'}
              </div>
              {reservation.updated_at && (
                <div>
                  Modifiée le: {new Date(reservation.updated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
