import { useState, useMemo, useEffect, useCallback } from 'react';
import { DeliveryTask } from '../../types';
import { X, Trash2, Edit2, MoreVertical, Truck, Loader2 } from 'lucide-react';
import { DeliveryService, TechniciansService, ReservationsService } from '../../services';
import { Technician, Vehicle } from '../../services/technicians.service';
import { useToast } from '../../contexts/ToastContext';

// Type pour les réservations non assignées (données brutes Supabase)
interface UnassignedReservation {
  id: string;
  start_date: string;
  end_date: string;
  delivery_time?: string;
  delivery_type: string;
  delivery_address_id?: string;
  status: string;
  total: number;
  notes?: string;
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  reservation_items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    product?: { name: string };
  }>;
  delivery_address?: {
    address_line1: string;
    address_line2?: string;
    city: string;
    postal_code: string;
  };
  delivery_task_id?: string;
}

type AssignFilter = 'all' | 'unassigned' | 'assigned';

export default function AdminPlanning() {
  const toast = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [reservations, setReservations] = useState<UnassignedReservation[]>([]);
  const [tasksState, setTasksState] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [assignFilter, setAssignFilter] = useState<AssignFilter>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    name: '',
    type: 'truck',
    capacity: '',
    licensePlate: '',
    isActive: true
  });
  const [draggedTask, setDraggedTask] = useState<DeliveryTask | null>(null);
  const [draggedReservation, setDraggedReservation] = useState<UnassignedReservation | null>(null);

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [vehiclesData, techniciansData, tasksData, unassignedRes] = await Promise.all([
        TechniciansService.getAllVehicles(),
        TechniciansService.getAllTechnicians(),
        DeliveryService.getTasksByDate(selectedDate),
        ReservationsService.getUnassignedReservations(),
      ]);
      setVehicles(vehiclesData);
      setTechnicians(techniciansData);
      setTasksState(tasksData);
      setReservations(unassignedRes as unknown as UnassignedReservation[]);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rafraîchir uniquement les tâches et réservations (après une opération)
  const refreshTasksAndReservations = useCallback(async () => {
    try {
      const [tasksData, unassignedRes] = await Promise.all([
        DeliveryService.getTasksByDate(selectedDate),
        ReservationsService.getUnassignedReservations(),
      ]);
      setTasksState(tasksData);
      setReservations(unassignedRes as unknown as UnassignedReservation[]);
    } catch (err) {
      console.error('Erreur rafraîchissement:', err);
    }
  }, [selectedDate]);

  // Tâches pour la date sélectionnée
  const existingTasks = useMemo(() => {
    return tasksState.filter(task => task.scheduledDate === selectedDate);
  }, [selectedDate, tasksState]);

  // Filtrer les tâches selon le filtre d'assignation
  const filteredTasks = useMemo(() => {
    switch (assignFilter) {
      case 'unassigned':
        return existingTasks.filter(t => !t.technicianId);
      case 'assigned':
        return existingTasks.filter(t => !!t.technicianId);
      default:
        return existingTasks;
    }
  }, [existingTasks, assignFilter]);

  // Grouper les tâches par technicien
  const tasksByTechnician = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};

    filteredTasks.forEach(task => {
      const key = task.technicianId || '__unassigned__';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(task);
    });

    // Trier par heure
    Object.keys(grouped).forEach(techId => {
      grouped[techId].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });

    return grouped;
  }, [filteredTasks]);

  // Réservations non encore assignées pour cette date
  const unassignedReservations = useMemo(() => {
    const assignedReservationIds = new Set(existingTasks.map(t => t.reservationId));
    return reservations.filter(res => {
      return res.start_date === selectedDate && !assignedReservationIds.has(res.id);
    });
  }, [reservations, selectedDate, existingTasks]);

  // Grouper toutes les tâches par date pour la vue mois
  const allTasksByDate = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};

    tasksState.forEach(task => {
      if (!grouped[task.scheduledDate]) {
        grouped[task.scheduledDate] = [];
      }
      grouped[task.scheduledDate].push(task);
    });

    return grouped;
  }, [tasksState]);

  // Générer les jours du mois pour le calendrier
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: Date | null; tasks: DeliveryTask[] }> = [];

    // Jours vides avant le premier jour du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, tasks: [] });
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date,
        tasks: allTasksByDate[dateStr] || []
      });
    }

    return days;
  }, [currentMonth, currentYear, allTasksByDate]);

  const navigateMonth = (direction: number) => {
    if (direction > 0) {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  // Assigner un livreur à une réservation via dropdown (créer ou assigner la delivery_task)
  const handleAssign = async (reservation: UnassignedReservation, technicianId: string, vehicleId: string) => {
    const opKey = `assign-${reservation.id}`;
    setOperationInProgress(opKey);
    try {
      if (reservation.delivery_task_id) {
        // La tâche existe déjà : assigner le technicien
        await DeliveryService.assignTask(reservation.delivery_task_id, technicianId, vehicleId);
      } else {
        // Créer une nouvelle tâche
        await DeliveryService.createDeliveryTask({
          reservationId: reservation.id,
          orderNumber: `ORD-${reservation.id.substring(0, 8)}`,
          type: 'delivery',
          scheduledDate: reservation.start_date,
          scheduledTime: reservation.delivery_time || '10:00',
          vehicleId: vehicleId,
          technicianId: technicianId,
          status: 'scheduled',
          customer: {
            firstName: reservation.customer?.first_name || '',
            lastName: reservation.customer?.last_name || '',
            phone: reservation.customer?.phone || '',
            email: reservation.customer?.email || ''
          },
          address: {
            street: reservation.delivery_address?.address_line1 || '',
            city: reservation.delivery_address?.city || '',
            postalCode: reservation.delivery_address?.postal_code || '',
            country: 'France'
          },
          products: (reservation.reservation_items || []).map(item => ({
            productId: item.product_id || '',
            productName: item.product?.name || 'Produit',
            quantity: item.quantity || 1
          }))
        });
      }
      toast.success('Livreur assigné avec succès');
      await refreshTasksAndReservations();
    } catch (err) {
      console.error('Erreur assignation:', err);
      toast.error('Erreur lors de l\'assignation du livreur');
    } finally {
      setOperationInProgress(null);
    }
  };

  // Désassigner un technicien d'une tâche
  const handleUnassign = async (taskId: string) => {
    setOperationInProgress(`unassign-${taskId}`);
    try {
      await DeliveryService.unassignTask(taskId);
      toast.success('Tâche désassignée');
      await refreshTasksAndReservations();
    } catch (err) {
      console.error('Erreur désassignation:', err);
      toast.error('Erreur lors de la désassignation');
    } finally {
      setOperationInProgress(null);
    }
  };

  // Gestion du drag & drop - tâches existantes
  const handleDragStart = (e: React.DragEvent, task: DeliveryTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', task.id);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget as HTMLElement;
    if (target && !target.classList.contains('drag-over')) {
      target.classList.add('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (target && relatedTarget && !target.contains(relatedTarget)) {
      target.classList.remove('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }
  };

  // Drop d'une tâche existante vers un autre technicien (réassignation)
  const handleDrop = async (e: React.DragEvent, targetTechnicianId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }

    if (!draggedTask) return;
    if (draggedTask.technicianId === targetTechnicianId) return;

    const targetTechnician = technicians.find(t => t.id === targetTechnicianId);
    setOperationInProgress(`reassign-${draggedTask.id}`);

    try {
      await DeliveryService.assignTask(
        draggedTask.id,
        targetTechnicianId,
        targetTechnician?.vehicle_id || undefined
      );
      toast.success('Tâche réassignée');
      await refreshTasksAndReservations();
    } catch (err) {
      console.error('Erreur réassignation:', err);
      toast.error('Erreur lors de la réassignation');
    } finally {
      setOperationInProgress(null);
      setDraggedTask(null);
    }
  };

  // Drag & drop pour les réservations non assignées
  const handleReservationDragStart = (e: React.DragEvent, reservation: UnassignedReservation) => {
    setDraggedReservation(reservation);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', reservation.id);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleReservationDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedReservation(null);
  };

  // Drop d'une réservation sur un technicien → créer/assigner la tâche
  const handleReservationDrop = async (e: React.DragEvent, targetTechnicianId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }

    if (!draggedReservation) return;

    const targetTechnician = technicians.find(t => t.id === targetTechnicianId);
    setOperationInProgress(`create-${draggedReservation.id}`);

    try {
      if (draggedReservation.delivery_task_id) {
        // La tâche existe : assigner le technicien
        await DeliveryService.assignTask(
          draggedReservation.delivery_task_id,
          targetTechnicianId,
          targetTechnician?.vehicle_id || undefined
        );
      } else {
        // Créer une nouvelle tâche
        await DeliveryService.createDeliveryTask({
          reservationId: draggedReservation.id,
          orderNumber: `ORD-${draggedReservation.id.substring(0, 8)}`,
          type: 'delivery',
          scheduledDate: selectedDate,
          scheduledTime: draggedReservation.delivery_time || '10:00',
          vehicleId: targetTechnician?.vehicle_id || '',
          technicianId: targetTechnicianId,
          status: 'scheduled',
          customer: {
            firstName: draggedReservation.customer?.first_name || '',
            lastName: draggedReservation.customer?.last_name || '',
            phone: draggedReservation.customer?.phone || '',
            email: draggedReservation.customer?.email || ''
          },
          address: {
            street: draggedReservation.delivery_address?.address_line1 || '',
            city: draggedReservation.delivery_address?.city || '',
            postalCode: draggedReservation.delivery_address?.postal_code || '',
            country: 'France'
          },
          products: (draggedReservation.reservation_items || []).map(item => ({
            productId: item.product_id || '',
            productName: item.product?.name || 'Produit',
            quantity: item.quantity || 1
          }))
        });
      }
      toast.success('Intervention assignée avec succès');
      await refreshTasksAndReservations();
    } catch (err) {
      console.error('Erreur assignation par drag:', err);
      toast.error('Erreur lors de l\'assignation');
    } finally {
      setOperationInProgress(null);
      setDraggedReservation(null);
    }
  };

  const navigateDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'scheduled': return 'Planifié';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'delivery': return 'Livraison';
      case 'pickup': return 'Retrait';
      case 'client_pickup': return 'Retrait client';
      case 'client_return': return 'Retour client';
      default: return type;
    }
  };

  // Fermer le menu en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menu-container')) {
        setShowMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Loading global
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#33ffcc]" />
        <span className="ml-3 text-gray-600">Chargement des livraisons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Livraisons</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingVehicle(null);
                  setVehicleFormData({
                    name: '',
                    type: 'truck',
                    capacity: '',
                    licensePlate: '',
                    isActive: true
                  });
                  setShowVehicleModal(true);
                }}
                className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors flex items-center gap-2"
              >
                <Truck className="w-5 h-5" />
                + Nouveau camion
              </button>

              {/* Toggle vue jour/mois */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'day'
                      ? 'bg-white text-[#000033] font-semibold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Jour
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'month'
                      ? 'bg-white text-[#000033] font-semibold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mois
                </button>
              </div>
            </div>
          </div>

          {/* Contrôles de date selon la vue */}
          {viewMode === 'day' ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDate(-1)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  &larr;
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
                />
                <button
                  onClick={() => navigateDate(1)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  &rarr;
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
                >
                  Aujourd'hui
                </button>
              </div>

              {/* Filtre assignation */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {([
                  { key: 'all' as const, label: 'Toutes' },
                  { key: 'unassigned' as const, label: 'Non assignées' },
                  { key: 'assigned' as const, label: 'Assignées' },
                ]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setAssignFilter(f.key)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      assignFilter === f.key
                        ? 'bg-white text-[#000033] font-semibold shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                &larr;
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric'
                })}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                &rarr;
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  setSelectedDate(today.toISOString().split('T')[0]);
                }}
                className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
              >
                Aujourd'hui
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay loading pendant une opération */}
      {operationInProgress && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center gap-3 pointer-events-auto">
            <Loader2 className="w-5 h-5 animate-spin text-[#33ffcc]" />
            <span className="text-gray-700 text-sm">Opération en cours...</span>
          </div>
        </div>
      )}

      {/* Vue Mois - Calendrier */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* En-têtes des jours de la semaine */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayData, index) => {
              if (!dayData.date) {
                return <div key={index} className="aspect-square"></div>;
              }

              const dateStr = dayData.date.toISOString().split('T')[0];
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;
              const tasks = dayData.tasks;

              // Grouper les tâches par technicien pour ce jour
              const tasksByTech: Record<string, typeof tasks> = {};
              tasks.forEach(task => {
                const key = task.technicianId || '__unassigned__';
                if (!tasksByTech[key]) {
                  tasksByTech[key] = [];
                }
                tasksByTech[key].push(task);
              });

              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setViewMode('day');
                  }}
                  className={`aspect-square p-2 border rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-[#33ffcc] border-[#33ffcc]'
                      : isToday
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    isSelected ? 'text-[#000033]' : isToday ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {dayData.date.getDate()}
                  </div>
                  {tasks.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-gray-700">
                        {tasks.length} intervention(s)
                      </div>
                      {Object.keys(tasksByTech).filter(k => k !== '__unassigned__').slice(0, 2).map(techId => {
                        const tech = technicians.find(t => t.id === techId);
                        return (
                          <div key={techId} className="text-xs text-gray-600 truncate">
                            {tech?.first_name} ({tasksByTech[techId].length})
                          </div>
                        );
                      })}
                      {tasksByTech['__unassigned__'] && (
                        <div className="text-xs text-orange-600 truncate">
                          Non assigné ({tasksByTech['__unassigned__'].length})
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interventions à assigner - seulement en vue jour */}
      {viewMode === 'day' && unassignedReservations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Interventions / Livraisons à faire ({unassignedReservations.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unassignedReservations.map(reservation => (
              <div
                key={reservation.id}
                className={`p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 cursor-move hover:border-orange-400 hover:bg-orange-100 transition-all duration-200 ${
                  operationInProgress?.includes(reservation.id) ? 'opacity-50 pointer-events-none' : ''
                }`}
                draggable={!operationInProgress}
                onDragStart={(e) => handleReservationDragStart(e, reservation)}
                onDragEnd={handleReservationDragEnd}
              >
                <div className="mb-3">
                  <p className="font-semibold text-gray-900 text-sm">
                    ORD-{reservation.id.substring(0, 8)}
                  </p>
                  <p className="text-sm text-gray-700 font-medium mt-1">
                    {reservation.customer?.first_name} {reservation.customer?.last_name}
                  </p>
                  {reservation.delivery_address && (
                    <>
                      <p className="text-xs text-gray-600 mt-1">
                        {reservation.delivery_address.address_line1}
                      </p>
                      <p className="text-xs text-gray-600">
                        {reservation.delivery_address.postal_code} {reservation.delivery_address.city}
                      </p>
                    </>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {reservation.delivery_time && (
                      <span className="text-xs font-semibold text-gray-700">
                        {reservation.delivery_time}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {reservation.reservation_items?.length || 0} produit(s)
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Assigner à un livreur:
                  </label>
                  <select
                    disabled={!!operationInProgress}
                    onChange={(e) => {
                      const [technicianId, vehicleId] = e.target.value.split('|');
                      if (technicianId) {
                        handleAssign(reservation, technicianId, vehicleId || '');
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] bg-white disabled:opacity-50"
                    defaultValue=""
                  >
                    <option value="">Choisir un livreur...</option>
                    {technicians.map(tech => (
                      <option
                        key={tech.id}
                        value={`${tech.id}|${tech.vehicle_id || ''}`}
                      >
                        {tech.first_name} {tech.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Livraisons par livreur - seulement en vue jour */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Livraisons du {new Date(selectedDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            {filteredTasks.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''})
              </span>
            )}
          </h2>

          {/* Tâches non assignées */}
          {tasksByTechnician['__unassigned__'] && tasksByTechnician['__unassigned__'].length > 0 && (
            <div className="mb-6 border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50">
              <h3 className="font-bold text-orange-800 text-base mb-3">
                Non assignées ({tasksByTechnician['__unassigned__'].length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tasksByTechnician['__unassigned__'].map(task => (
                  <div key={task.id} className="p-3 bg-white border border-orange-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        task.type === 'delivery'
                          ? 'bg-[#33ffcc] text-[#000033]'
                          : 'bg-orange-500 text-white'
                      }`}>
                        {getTypeLabel(task.type)}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {task.scheduledTime}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {task.customer.firstName} {task.customer.lastName}
                    </p>
                    {task.address.street && (
                      <p className="text-xs text-gray-600 mt-1">
                        {task.address.street}, {task.address.postalCode} {task.address.city}
                      </p>
                    )}
                    <div className="mt-3">
                      <select
                        disabled={!!operationInProgress}
                        onChange={async (e) => {
                          const [techId, vehId] = e.target.value.split('|');
                          if (techId) {
                            setOperationInProgress(`assign-task-${task.id}`);
                            try {
                              await DeliveryService.assignTask(task.id, techId, vehId || undefined);
                              toast.success('Tâche assignée');
                              await refreshTasksAndReservations();
                            } catch (err) {
                              console.error('Erreur assignation:', err);
                              toast.error('Erreur lors de l\'assignation');
                            } finally {
                              setOperationInProgress(null);
                            }
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] bg-white disabled:opacity-50"
                        defaultValue=""
                      >
                        <option value="">Assigner un livreur...</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={`${tech.id}|${tech.vehicle_id || ''}`}>
                            {tech.first_name} {tech.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
          {technicians.map(technicianItem => {
            const vehicle = technicianItem.vehicle_id
              ? vehicles.find(v => v.id === technicianItem.vehicle_id)
              : null;
            const tasks = tasksByTechnician[technicianItem.id] || [];

            return (
              <div
                key={technicianItem.id}
                className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[500px] transition-all duration-200"
                onDragOver={(e) => {
                  handleDragOver(e);
                  if (draggedReservation) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }
                }}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  if (draggedReservation) {
                    handleReservationDrop(e, technicianItem.id);
                  } else {
                    handleDrop(e, technicianItem.id);
                  }
                }}
              >
                {/* En-tête livreur */}
                <div className="mb-4 pb-3 border-b border-gray-300">
                  <h3 className="font-bold text-gray-900 text-base">
                    {technicianItem.first_name} {technicianItem.last_name}
                  </h3>
                  {vehicle && (
                    <p className="text-xs text-gray-600 mt-1">
                      {vehicle.name} - {vehicle.license_plate}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {tasks.length} intervention(s)
                  </p>
                </div>

                {/* Interventions assignées */}
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                      Déposez une intervention ici
                    </div>
                  ) : (
                    tasks.map(task => {
                      const isTaskBusy = operationInProgress?.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          className={`p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-move hover:shadow-md transition-all duration-200 ${
                            isTaskBusy ? 'opacity-50 pointer-events-none' : ''
                          }`}
                          draggable={!operationInProgress}
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                  task.type === 'delivery'
                                    ? 'bg-[#33ffcc] text-[#000033]'
                                    : 'bg-orange-500 text-white'
                                }`}>
                                  {getTypeLabel(task.type)}
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                  {task.scheduledTime}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                {task.customer.firstName} {task.customer.lastName}
                              </p>
                              {task.address.street && (
                                <>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {task.address.street}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {task.address.postalCode} {task.address.city}
                                  </p>
                                </>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {task.orderNumber}
                              </p>
                              {task.products.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {task.products.slice(0, 2).map((product, idx) => (
                                    <span key={idx} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                      {product.productName}
                                    </span>
                                  ))}
                                  {task.products.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{task.products.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleUnassign(task.id)}
                              disabled={!!operationInProgress}
                              className="text-red-600 hover:text-red-800 text-sm ml-2 disabled:opacity-50"
                              title="Désassigner"
                            >
                              ✕
                            </button>
                          </div>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {viewMode === 'day' && unassignedReservations.length === 0 && filteredTasks.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">
            Aucune intervention pour cette date
          </p>
        </div>
      )}

      {/* Section Gestion des camions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Gestion des camions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 relative">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                  <p className="text-sm text-gray-600">{vehicle.license_plate}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      vehicle.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vehicle.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {vehicle.type === 'truck' ? 'Camion' : 'Utilitaire'} - {vehicle.capacity} m³
                    </span>
                  </div>
                </div>
                <div className="relative menu-container">
                  <button
                    onClick={() => setShowMenu(showMenu === vehicle.id ? null : vehicle.id)}
                    className="text-gray-600 hover:text-gray-900 p-1"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMenu === vehicle.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          setEditingVehicle(vehicle);
                          setVehicleFormData({
                            name: vehicle.name,
                            type: vehicle.type,
                            capacity: vehicle.capacity.toString(),
                            licensePlate: vehicle.license_plate,
                            isActive: vehicle.is_active
                          });
                          setShowVehicleModal(true);
                          setShowMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(vehicle.id);
                          setShowMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modale Ajouter/Modifier Camion */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingVehicle ? 'Modifier le camion' : 'Nouveau camion'}
              </h2>
              <button
                onClick={() => {
                  setShowVehicleModal(false);
                  setEditingVehicle(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingVehicle) {
                setVehicles(prev => prev.map(v =>
                  v.id === editingVehicle.id
                    ? {
                        ...v,
                        name: vehicleFormData.name,
                        type: vehicleFormData.type as 'truck' | 'van',
                        capacity: parseFloat(vehicleFormData.capacity),
                        license_plate: vehicleFormData.licensePlate,
                        is_active: vehicleFormData.isActive
                      }
                    : v
                ));
              } else {
                const newVehicle: Vehicle = {
                  id: `veh_${Date.now()}`,
                  name: vehicleFormData.name,
                  type: vehicleFormData.type as 'truck' | 'van',
                  capacity: parseFloat(vehicleFormData.capacity),
                  license_plate: vehicleFormData.licensePlate,
                  is_active: vehicleFormData.isActive,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                setVehicles(prev => [...prev, newVehicle]);
              }
              setShowVehicleModal(false);
              setEditingVehicle(null);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  required
                  value={vehicleFormData.name}
                  onChange={(e) => setVehicleFormData({...vehicleFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    required
                    value={vehicleFormData.type}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  >
                    <option value="truck">Camion</option>
                    <option value="van">Utilitaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacité (m³) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={vehicleFormData.capacity}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, capacity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plaque d'immatriculation *</label>
                <input
                  type="text"
                  required
                  value={vehicleFormData.licensePlate}
                  onChange={(e) => setVehicleFormData({...vehicleFormData, licensePlate: e.target.value})}
                  placeholder="AB-123-CD"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveVehicle"
                  checked={vehicleFormData.isActive}
                  onChange={(e) => setVehicleFormData({...vehicleFormData, isActive: e.target.checked})}
                  className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
                />
                <label htmlFor="isActiveVehicle" className="text-sm font-medium text-gray-700">
                  Véhicule actif
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowVehicleModal(false);
                    setEditingVehicle(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
                >
                  {editingVehicle ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce camion ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setVehicles(prev => prev.filter(v => v.id !== showDeleteConfirm));
                  setShowDeleteConfirm(null);
                }}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
