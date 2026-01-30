import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DeliveryTask, Vehicle, Order } from '../../types';
import { DeliveryService, TechniciansService, ReservationsService } from '../../services';
import { Technician } from '../../services/technicians.service';
import { User, Zap, Car, Building, Users, Calendar as CalendarIcon, MapPin } from 'lucide-react';

export default function TechnicianTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<DeliveryTask | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [reservation, setReservation] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const taskData = await DeliveryService.getTaskById(id);
        if (!taskData) {
          setError('Intervention introuvable');
          return;
        }
        setTask(taskData);

        // Load vehicle, technician info and reservation details
        const [vehicleData, technicianData, reservationData] = await Promise.all([
          taskData.vehicleId ? TechniciansService.getVehicleById(taskData.vehicleId) : null,
          taskData.technicianId ? TechniciansService.getTechnicianById(taskData.technicianId) : null,
          taskData.reservationId ? ReservationsService.getReservationById(taskData.reservationId) : null,
        ]);
        setVehicle(vehicleData);
        setTechnician(technicianData);
        setReservation(reservationData);
      } catch (err) {
        console.error('Erreur chargement tâche:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-[#33ffcc] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">{error || 'Intervention introuvable'}</p>
        <Link
          to="/technician/dashboard"
          className="text-[#33ffcc] hover:text-[#66cccc] font-semibold"
        >
          ← Retour au planning
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: DeliveryTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: DeliveryTask['status']) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      case 'scheduled':
        return 'Planifié';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: 'delivery' | 'pickup') => {
    return type === 'delivery' ? 'Livraison' : 'Retrait';
  };

  const getTypeColor = (type: 'delivery' | 'pickup') => {
    return type === 'delivery' 
      ? 'bg-[#33ffcc] text-[#000033]' 
      : 'bg-orange-500 text-white';
  };

  const handleStartTask = async () => {
    if (!task) return;
    try {
      await DeliveryService.updateTaskStatus(task.id, 'in_progress');
      setTask({ ...task, status: 'in_progress', startedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Erreur démarrage intervention:', err);
      alert('Erreur lors du démarrage de l\'intervention');
    }
  };

  const handleCompleteTask = async () => {
    if (!task) return;
    try {
      await DeliveryService.updateTaskStatus(task.id, 'completed');
      setTask({ ...task, status: 'completed', completedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Erreur complétion intervention:', err);
      alert('Erreur lors de la complétion de l\'intervention');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/technician/dashboard"
            className="text-[#33ffcc] hover:text-[#66cccc] font-semibold mb-2 inline-block"
          >
            ← Retour au planning
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Détails de l'intervention
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-semibold rounded ${getTypeColor(task.type)}`}>
            {getTypeLabel(task.type)}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded border ${getStatusColor(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations client */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#33ffcc]" />
              Informations client
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nom</p>
                <p className="text-base font-semibold text-gray-900">
                  {task.customer.firstName} {task.customer.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                <a
                  href={`tel:${task.customer.phone}`}
                  className="text-base font-semibold text-[#33ffcc] hover:text-[#66cccc]"
                >
                  {task.customer.phone}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <a
                  href={`mailto:${task.customer.email}`}
                  className="text-base font-semibold text-gray-900 hover:text-[#33ffcc]"
                >
                  {task.customer.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Commande</p>
                <p className="text-base font-semibold text-gray-900">
                  {task.orderNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Réceptionnaire (si différent du client) */}
          {reservation?.recipient_data && !(reservation.recipient_data as any).sameAsCustomer && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-200 bg-orange-50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Réceptionnaire sur place
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nom</p>
                  <p className="text-base font-semibold text-gray-900">
                    {(reservation.recipient_data as any).firstName} {(reservation.recipient_data as any).lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                  <a
                    href={`tel:${(reservation.recipient_data as any).phone}`}
                    className="text-base font-semibold text-[#33ffcc] hover:text-[#66cccc]"
                  >
                    {(reservation.recipient_data as any).phone}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Détails de l'événement */}
          {reservation?.event_details && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-500" />
                Détails de l'événement
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {reservation.event_type && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Type d'événement</p>
                    <p className="text-base font-semibold text-gray-900">{reservation.event_type}</p>
                  </div>
                )}
                {(reservation.event_details as any).guestCount && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nombre d'invités</p>
                    <p className="text-base font-semibold text-gray-900">{(reservation.event_details as any).guestCount} personnes</p>
                  </div>
                )}
                {(reservation.event_details as any).venueName && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Lieu / Salle</p>
                    <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {(reservation.event_details as any).venueName}
                    </p>
                  </div>
                )}
              </div>

              {/* Infos importantes pour le technicien */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t border-gray-200">
                <div className={`flex items-center gap-2 p-2 rounded-lg ${(reservation.event_details as any).hasElevator ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <Building className="w-4 h-4" />
                  <span className="text-sm">Ascenseur {(reservation.event_details as any).hasElevator ? '✓' : '✗'}</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg ${(reservation.event_details as any).parkingAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <Car className="w-4 h-4" />
                  <span className="text-sm">Parking {(reservation.event_details as any).parkingAvailable ? '✓' : '✗'}</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg ${(reservation.event_details as any).electricityAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Électricité {(reservation.event_details as any).electricityAvailable ? '✓' : '✗'}</span>
                </div>
                {(reservation.event_details as any).floorNumber && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-700">
                    <span className="text-sm">Étage {(reservation.event_details as any).floorNumber}</span>
                  </div>
                )}
              </div>

              {/* Difficulté d'accès */}
              {(reservation.event_details as any).accessDifficulty && (reservation.event_details as any).accessDifficulty !== 'Aucune' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800">
                    Difficulté d'accès: {(reservation.event_details as any).accessDifficulty}
                  </p>
                  {(reservation.event_details as any).accessDetails && (
                    <p className="text-sm text-yellow-700 mt-1">{(reservation.event_details as any).accessDetails}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Adresse */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Adresse de livraison</h2>
            <div className="space-y-2">
              <p className="text-base font-semibold text-gray-900">
                {task.address.street}
              </p>
              <p className="text-base text-gray-600">
                {task.address.postalCode} {task.address.city}
              </p>
              <p className="text-base text-gray-600">
                {task.address.country}
              </p>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Date et heure prévues</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(task.scheduledDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-lg font-semibold text-[#33ffcc]">
                {task.scheduledTime}
              </p>
            </div>
          </div>

          {/* Produits */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Produits</h2>
            <div className="space-y-3">
              {task.products.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">Quantité: {product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contraintes d'accès */}
          {task.accessConstraints && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contraintes d'accès</h2>
              <div className="space-y-3">
                {task.accessConstraints.floor !== undefined && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-32">Étage:</span>
                    <span className="text-base font-semibold text-gray-900">
                      {task.accessConstraints.floor}
                    </span>
                  </div>
                )}
                {task.accessConstraints.hasElevator !== undefined && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-32">Ascenseur:</span>
                    <span className="text-base font-semibold text-gray-900">
                      {task.accessConstraints.hasElevator ? 'Oui' : 'Non'}
                    </span>
                  </div>
                )}
                {task.accessConstraints.accessCode && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-32">Code d'accès:</span>
                    <span className="text-base font-semibold text-gray-900">
                      {task.accessConstraints.accessCode}
                    </span>
                  </div>
                )}
                {task.accessConstraints.parkingInfo && (
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-gray-600 w-32">Parking:</span>
                    <span className="text-base font-semibold text-gray-900">
                      {task.accessConstraints.parkingInfo}
                    </span>
                  </div>
                )}
                {task.accessConstraints.contactOnSite && (
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-gray-600 w-32">Contact sur site:</span>
                    <span className="text-base font-semibold text-gray-900">
                      {task.accessConstraints.contactOnSite}
                    </span>
                  </div>
                )}
                {task.accessConstraints.specialInstructions && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">Instructions spéciales:</p>
                    <p className="text-sm text-yellow-800">
                      {task.accessConstraints.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-base text-gray-700">{task.notes}</p>
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Informations véhicule et technicien */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Équipe</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Véhicule</p>
                <p className="text-base font-semibold text-gray-900">
                  {vehicle?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {vehicle?.licensePlate || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Technicien</p>
                <p className="text-base font-semibold text-gray-900">
                  {technician?.first_name} {technician?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {technician?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {task.status === 'scheduled' && (
                <button
                  onClick={handleStartTask}
                  className="w-full px-4 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
                >
                  Démarrer l'intervention
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  onClick={handleCompleteTask}
                  className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Terminer l'intervention
                </button>
              )}
              <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                Signaler un problème
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${task.address.street}, ${task.address.postalCode} ${task.address.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Ouvrir dans Maps
              </a>
            </div>
          </div>

          {/* Timeline */}
          {(task.startedAt || task.completedAt) && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Planifié</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(task.scheduledDate).toLocaleDateString('fr-FR')} à {task.scheduledTime}
                  </p>
                </div>
                {task.startedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Démarré</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(task.startedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
                {task.completedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Terminé</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(task.completedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

