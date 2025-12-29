import { useState, useMemo, useEffect } from 'react';
import { fakeReservations } from '../../lib/fake-data';
import { fakeTechnicians, fakeVehicles } from '../../lib/fake-data';
import { fakeDeliveryTasks } from '../../lib/fake-data';
import { DeliveryTask } from '../../types';
import { X, Trash2, Edit2, MoreVertical, Truck } from 'lucide-react';

export default function AdminPlanning() {
  const [vehicles, setVehicles] = useState(fakeVehicles);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [assignments, setAssignments] = useState<Record<string, { technicianId: string; vehicleId: string }>>({});
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
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
  const [draggedReservation, setDraggedReservation] = useState<any | null>(null);
  const [tasksState, setTasksState] = useState<DeliveryTask[]>(fakeDeliveryTasks);

  // Réservations qui nécessitent une livraison/retrait
  const reservationsNeedingAssignment = useMemo(() => {
    return fakeReservations.filter(res => 
      res.delivery.type === 'delivery' && 
      (res.status === 'confirmed' || res.status === 'preparing')
    );
  }, []);

  // Tâches déjà assignées pour la date sélectionnée
  const existingTasks = useMemo(() => {
    return tasksState.filter(task => task.scheduledDate === selectedDate);
  }, [selectedDate, tasksState]);

  // Grouper les tâches par technicien
  const tasksByTechnician = useMemo(() => {
    const grouped: Record<string, typeof existingTasks> = {};
    
    existingTasks.forEach(task => {
      if (!grouped[task.technicianId]) {
        grouped[task.technicianId] = [];
      }
      grouped[task.technicianId].push(task);
    });

    // Trier par heure
    Object.keys(grouped).forEach(techId => {
      grouped[techId].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });

    return grouped;
  }, [existingTasks]);

  // Réservations non encore assignées pour cette date
  const unassignedReservations = useMemo(() => {
    const assignedReservationIds = new Set(existingTasks.map(t => t.reservationId));
    return reservationsNeedingAssignment.filter(res => {
      const deliveryDate = res.dates.start;
      return deliveryDate === selectedDate && !assignedReservationIds.has(res.id);
    });
  }, [reservationsNeedingAssignment, selectedDate, existingTasks]);

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
    
    const days: Array<{ date: Date | null; tasks: typeof fakeDeliveryTasks }> = [];
    
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

  const handleAssign = (reservationId: string, technicianId: string, vehicleId: string) => {
    setAssignments(prev => ({
      ...prev,
      [reservationId]: { technicianId, vehicleId }
    }));
    // En production, on enverrait cette assignation au backend
    // TODO: Implémenter l'appel API pour sauvegarder l'assignation
    // Ici on pourrait mettre à jour l'état pour refléter l'assignation immédiatement
  };

  const handleUnassign = (taskId: string) => {
    // En production, on supprimerait la tâche via l'API
  };

  // Gestion du drag & drop
  const handleDragStart = (e: React.DragEvent, task: DeliveryTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', task.id);
    // Style visuel pendant le drag
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Restaurer l'opacité
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Style visuel pour la zone de drop
    const target = e.currentTarget as HTMLElement;
    if (target && !target.classList.contains('drag-over')) {
      target.classList.add('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Retirer le style visuel seulement si on quitte vraiment la zone
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (target && relatedTarget && !target.contains(relatedTarget)) {
      target.classList.remove('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }
  };

  const handleDrop = (e: React.DragEvent, targetTechnicianId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Retirer le style visuel
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }

    if (!draggedTask) return;

    // Trouver le véhicule du technicien cible
    const targetTechnician = fakeTechnicians.find(t => t.id === targetTechnicianId);
    if (!targetTechnician || !targetTechnician.vehicleId) {
      console.warn('Technicien ou véhicule introuvable');
      return;
    }

    // Mettre à jour la tâche avec le nouveau technicien et véhicule
    setTasksState(prevTasks => 
      prevTasks.map(task => 
        task.id === draggedTask.id
          ? {
              ...task,
              technicianId: targetTechnicianId,
              vehicleId: targetTechnician.vehicleId!
            }
          : task
      )
    );

    setDraggedTask(null);
  };

  // Gestion du drag & drop pour les réservations non assignées
  const handleReservationDragStart = (e: React.DragEvent, reservation: any) => {
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

  const handleReservationDrop = (e: React.DragEvent, targetTechnicianId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }

    if (!draggedReservation) return;

    const targetTechnician = fakeTechnicians.find(t => t.id === targetTechnicianId);
    if (!targetTechnician || !targetTechnician.vehicleId) {
      console.warn('Technicien ou véhicule introuvable');
      return;
    }

    // Créer une nouvelle tâche à partir de la réservation
    const newTask: DeliveryTask = {
      id: `task_${Date.now()}`,
      reservationId: draggedReservation.id,
      orderNumber: draggedReservation.orderNumber,
      type: 'delivery',
      scheduledDate: selectedDate,
      scheduledTime: draggedReservation.dates.deliveryTime || '10:00',
      vehicleId: targetTechnician.vehicleId,
      technicianId: targetTechnicianId,
      status: 'scheduled',
      customer: {
        firstName: draggedReservation.customer.firstName,
        lastName: draggedReservation.customer.lastName,
        phone: draggedReservation.customer.phone || '',
        email: draggedReservation.customer.email || ''
      },
      address: {
        street: draggedReservation.delivery.address.street,
        city: draggedReservation.delivery.address.city,
        postalCode: draggedReservation.delivery.address.postalCode || '',
        country: draggedReservation.delivery.address.country || 'France'
      },
      products: draggedReservation.products.map((p: any) => ({
        productId: p.productId || p.id || '',
        productName: p.productName || p.name || '',
        quantity: p.quantity || 1
      }))
    };

    setTasksState(prevTasks => [...prevTasks, newTask]);
    setDraggedReservation(null);
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

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Livraisons</h1>
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

          {/* Contrôles de date selon la vue */}
          {viewMode === 'day' ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateDate(-1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ←
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
                →
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
              >
                Aujourd'hui
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ←
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
                →
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
                if (!tasksByTech[task.technicianId]) {
                  tasksByTech[task.technicianId] = [];
                }
                tasksByTech[task.technicianId].push(task);
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
                      {Object.keys(tasksByTech).slice(0, 2).map(techId => {
                        const tech = fakeTechnicians.find(t => t.id === techId);
                        return (
                          <div key={techId} className="text-xs text-gray-600 truncate">
                            {tech?.firstName} ({tasksByTech[techId].length})
                          </div>
                        );
                      })}
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
                className="p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 cursor-move hover:border-orange-400 hover:bg-orange-100 transition-all duration-200"
                draggable
                onDragStart={(e) => handleReservationDragStart(e, reservation)}
                onDragEnd={handleReservationDragEnd}
              >
                <div className="mb-3">
                  <p className="font-semibold text-gray-900 text-sm">
                    {reservation.orderNumber}
                  </p>
                  <p className="text-sm text-gray-700 font-medium mt-1">
                    {reservation.customer.firstName} {reservation.customer.lastName}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {reservation.delivery.address.street}
                  </p>
                  <p className="text-xs text-gray-600">
                    {reservation.delivery.address.postalCode} {reservation.delivery.address.city}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">
                      {reservation.dates.deliveryTime}
                    </span>
                    <span className="text-xs text-gray-500">
                      {reservation.products.length} produit(s)
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Assigner à un livreur:
                  </label>
                  <select
                    onChange={(e) => {
                      const [technicianId, vehicleId] = e.target.value.split('|');
                      if (technicianId && vehicleId) {
                        handleAssign(reservation.id, technicianId, vehicleId);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] bg-white"
                    defaultValue=""
                  >
                    <option value="">Choisir un livreur...</option>
                    {fakeTechnicians.map(tech => {
                      const techVehicle = tech.vehicleId 
                        ? vehicles.find(v => v.id === tech.vehicleId)
                        : null;
                      if (!techVehicle) return null;
                      return (
                        <option
                          key={tech.id}
                          value={`${tech.id}|${techVehicle.id}`}
                        >
                          {tech.firstName} {tech.lastName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Livraisons par livreur - 4 colonnes - seulement en vue jour */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Livraisons du {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
          {fakeTechnicians.map(technician => {
            const vehicle = technician.vehicleId 
              ? vehicles.find(v => v.id === technician.vehicleId)
              : null;
            const tasks = tasksByTechnician[technician.id] || [];

            return (
              <div 
                key={technician.id} 
                className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[500px] transition-all duration-200"
                onDragOver={(e) => {
                  handleDragOver(e);
                  // Permettre aussi le drop de réservations
                  if (draggedReservation) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }
                }}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  if (draggedReservation) {
                    handleReservationDrop(e, technician.id);
                  } else {
                    handleDrop(e, technician.id);
                  }
                }}
              >
                {/* En-tête livreur */}
                <div className="mb-4 pb-3 border-b border-gray-300">
                  <h3 className="font-bold text-gray-900 text-base">
                    {technician.firstName} {technician.lastName}
                  </h3>
                  {vehicle && (
                    <p className="text-xs text-gray-600 mt-1">
                      {vehicle.name} - {vehicle.licensePlate}
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
                      return (
                        <div
                          key={task.id}
                          className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-move hover:shadow-md transition-all duration-200"
                          draggable
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
                                  {task.type === 'delivery' ? 'Livraison' : 'Retrait'}
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                  {task.scheduledTime}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                {task.customer.firstName} {task.customer.lastName}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {task.address.street}
                              </p>
                              <p className="text-xs text-gray-600">
                                {task.address.postalCode} {task.address.city}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {task.orderNumber}
                              </p>
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
                            </div>
                            <button
                              onClick={() => handleUnassign(task.id)}
                              className="text-red-600 hover:text-red-800 text-sm ml-2"
                              title="Désassigner"
                            >
                              ✕
                            </button>
                          </div>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                            {task.status === 'completed' ? 'Terminé' :
                             task.status === 'in_progress' ? 'En cours' :
                             task.status === 'scheduled' ? 'Planifié' : task.status}
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

      {viewMode === 'day' && unassignedReservations.length === 0 && existingTasks.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">
            Aucune réservation à assigner pour cette date
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
                  <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      vehicle.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vehicle.isActive ? 'Actif' : 'Inactif'}
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
                            licensePlate: vehicle.licensePlate,
                            isActive: vehicle.isActive
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
                        licensePlate: vehicleFormData.licensePlate,
                        isActive: vehicleFormData.isActive
                      }
                    : v
                ));
              } else {
                const newVehicle = {
                  id: `veh_${Date.now()}`,
                  name: vehicleFormData.name,
                  type: vehicleFormData.type as 'truck' | 'van',
                  capacity: parseFloat(vehicleFormData.capacity),
                  licensePlate: vehicleFormData.licensePlate,
                  isActive: vehicleFormData.isActive
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

