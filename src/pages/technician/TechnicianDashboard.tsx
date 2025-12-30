import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DeliveryTask, Vehicle } from '../../types';
import { getCurrentDateISO, getCurrentDate, isToday } from '../../utils/fixedDate';
import { DeliveryService, TechniciansService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const fixedDate = getCurrentDate();
  const [selectedDate, setSelectedDate] = useState(getCurrentDateISO());
  const [viewMode, setViewMode] = useState<'calendar' | 'vehicles' | 'list'>('calendar');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(fixedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(fixedDate.getFullYear());

  // États pour les données Supabase
  const [allTasks, setAllTasks] = useState<DeliveryTask[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.id) return;

      try {
        setLoading(true);
        setError(null);
        const [tasksData, vehiclesData] = await Promise.all([
          DeliveryService.getTechnicianTasks(userProfile.id),
          TechniciansService.getAllVehicles(),
        ]);
        setAllTasks(tasksData);
        setVehicles(vehiclesData);
      } catch (err) {
        console.error('Erreur chargement données:', err);
        setError('Impossible de charger vos tâches');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userProfile]);

  // Filtrer les tâches par date
  const tasksForDate = useMemo(() => {
    return allTasks.filter(task => task.scheduledDate === selectedDate);
  }, [selectedDate, allTasks]);

  // Grouper par véhicule
  const tasksByVehicle = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};
    
    tasksForDate.forEach(task => {
      if (selectedVehicle !== 'all' && task.vehicleId !== selectedVehicle) return;
      
      if (!grouped[task.vehicleId]) {
        grouped[task.vehicleId] = [];
      }
      grouped[task.vehicleId].push(task);
    });

    // Trier les tâches par heure
    Object.keys(grouped).forEach(vehicleId => {
      grouped[vehicleId].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });

    return grouped;
  }, [tasksForDate, selectedVehicle]);

  // Toutes les tâches triées chronologiquement pour la vue liste
  const allTasksSorted = useMemo(() => {
    const filtered = selectedVehicle === 'all' 
      ? tasksForDate 
      : tasksForDate.filter(t => t.vehicleId === selectedVehicle);
    
    return filtered.sort((a, b) => {
      const timeCompare = a.scheduledTime.localeCompare(b.scheduledTime);
      if (timeCompare !== 0) return timeCompare;
      return a.type.localeCompare(b.type);
    });
  }, [tasksForDate, selectedVehicle]);

  // Grouper toutes les tâches par date pour le calendrier
  const allTasksByDate = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};

    allTasks.forEach(task => {
      if (!grouped[task.scheduledDate]) {
        grouped[task.scheduledDate] = [];
      }
      grouped[task.scheduledDate].push(task);
    });

    // Trier par heure pour chaque date
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });

    return grouped;
  }, [allTasks]);

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
      // Formater la date en YYYY-MM-DD en utilisant les valeurs locales pour éviter les problèmes de timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;
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

  // Navigation dates
  const navigateDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(getCurrentDateISO());
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

          <div className="flex items-center gap-4">
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
            >
              <option value="all">Tous les véhicules</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} ({vehicle.licensePlate})
                </option>
              ))}
            </select>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-[#000033] font-semibold shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calendrier
              </button>
              <button
                onClick={() => setViewMode('vehicles')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'vehicles'
                    ? 'bg-white text-[#000033] font-semibold shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Par véhicule
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-[#000033] font-semibold shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Liste
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vue Calendrier mensuel */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => {
                  const today = getCurrentDate();
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  setSelectedDate(getCurrentDateISO());
                }}
                className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
          </div>

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

              // Formater la date en YYYY-MM-DD en utilisant les valeurs locales
              const year = dayData.date.getFullYear();
              const month = String(dayData.date.getMonth() + 1).padStart(2, '0');
              const dayStr = String(dayData.date.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${dayStr}`;
              const isTodayDate = isToday(dayData.date);
              const isSelected = dateStr === selectedDate;
              const tasks = dayData.tasks;

              return (
                <button
                  key={index}
                  onClick={() => navigate(`/technician/tasks?date=${dateStr}`)}
                  className={`aspect-square p-2 border rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-[#33ffcc] border-[#33ffcc]'
                      : isTodayDate
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    isSelected ? 'text-[#000033]' : isTodayDate ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {dayData.date.getDate()}
                  </div>
                  {tasks.length > 0 && (
                    <div className="space-y-1">
                      {tasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${
                            task.type === 'delivery'
                              ? 'bg-[#33ffcc] text-[#000033]'
                              : 'bg-orange-500 text-white'
                          }`}
                          title={`${task.scheduledTime} - ${task.customer.firstName} ${task.customer.lastName}`}
                        >
                          {task.scheduledTime} {task.type === 'delivery' ? 'L' : 'R'}
                        </div>
                      ))}
                      {tasks.length > 2 && (
                        <div className="text-xs text-gray-600 font-semibold">
                          +{tasks.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Détails de la date sélectionnée */}
          {selectedDate && allTasksByDate[selectedDate] && allTasksByDate[selectedDate].length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Interventions du {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </h4>
              <div className="space-y-3">
                {allTasksByDate[selectedDate].map(task => (
                  <Link
                    key={task.id}
                    to={`/technician/tasks/${task.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#33ffcc]">
                            {task.scheduledTime}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getTypeColor(task.type)}`}>
                            {getTypeLabel(task.type)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {task.customer.firstName} {task.customer.lastName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {task.address.street}, {task.address.city}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Par véhicule */}
      {viewMode === 'vehicles' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Planning du {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>

          {Object.keys(tasksByVehicle).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Aucune intervention planifiée pour cette date</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(tasksByVehicle).map(([vehicleId, tasks]) => {
                const vehicle = vehicles.find(v => v.id === vehicleId);
                return (
                  <div key={vehicleId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">
                        {vehicle?.name || 'Véhicule inconnu'}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {vehicle?.licensePlate}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <Link
                          key={task.id}
                          to={`/technician/tasks/${task.id}`}
                          className="block p-3 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${getTypeColor(task.type)}`}>
                              {getTypeLabel(task.type)}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {task.scheduledTime}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {task.customer.firstName} {task.customer.lastName}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">
                            {task.address.street}, {task.address.city}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            {task.products.map((product, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {product.productName} x{product.quantity}
                              </span>
                            ))}
                          </div>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Liste chronologique - {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>

          {allTasksSorted.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Aucune intervention planifiée pour cette date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allTasksSorted.map(task => {
                const vehicle = vehicles.find(v => v.id === task.vehicleId);
                return (
                  <Link
                    key={task.id}
                    to={`/technician/tasks/${task.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {task.scheduledTime}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getTypeColor(task.type)}`}>
                            {getTypeLabel(task.type)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-gray-900 mb-1">
                          {task.customer.firstName} {task.customer.lastName}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {task.address.street}, {task.address.postalCode} {task.address.city}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span>Véhicule: {vehicle?.name || 'N/A'}</span>
                          <span>Commande: {task.orderNumber}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {task.products.map((product, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {product.productName} x{product.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className="text-sm text-[#33ffcc] font-semibold">
                          Voir détails →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

