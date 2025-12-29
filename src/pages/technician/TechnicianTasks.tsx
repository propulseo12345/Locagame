import { Link, useSearchParams } from 'react-router-dom';
import { DeliveryTask } from '../../types';
import { useState, useMemo, useEffect } from 'react';
import { getCurrentDateISO, isToday } from '../../utils/fixedDate';
import { DeliveryService, TechniciansService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

export default function TechnicianTasks() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFromUrl = searchParams.get('date');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(
    dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)
      ? dateFromUrl
      : getCurrentDateISO()
  );
  const [allTasks, setAllTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les tâches du technicien
  useEffect(() => {
    loadTasks();
  }, [user]);

  // Mettre à jour la date si elle change dans l'URL
  useEffect(() => {
    if (dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)) {
      setSelectedDate(dateFromUrl);
    }
  }, [dateFromUrl]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Récupérer le profil technicien
      const technician = await TechniciansService.getTechnicianByUserId(user.id);
      if (technician) {
        // Récupérer les tâches du technicien
        const tasks = await DeliveryService.getTechnicianTasks(technician.id);
        setAllTasks(tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les tâches
  const filteredTasks = useMemo(() => {
    let tasks = [...allTasks];

    if (statusFilter !== 'all') {
      tasks = tasks.filter(t => t.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      tasks = tasks.filter(t => t.type === typeFilter);
    }

    // Trier par date et heure
    return tasks.sort((a, b) => {
      const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateCompare !== 0) return dateCompare;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [allTasks, statusFilter, typeFilter]);

  // Tâches pour la date sélectionnée (vue calendrier)
  const tasksForDate = useMemo(() => {
    return filteredTasks.filter(task => task.scheduledDate === selectedDate);
  }, [filteredTasks, selectedDate]);

  // Grouper par date pour la vue calendrier
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};
    
    filteredTasks.forEach(task => {
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
  }, [filteredTasks]);

  const navigateDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    const newDate = date.toISOString().split('T')[0];
    setSelectedDate(newDate);
    setSearchParams({ date: newDate });
  };

  const goToToday = () => {
    const today = getCurrentDateISO();
    setSelectedDate(today);
    setSearchParams({ date: today });
  };

  // Mettre à jour l'URL quand la date change manuellement
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSearchParams({ date: newDate });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mes interventions</h1>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
              >
                <option value="all">Tous les statuts</option>
                <option value="scheduled">Planifié</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
              >
                <option value="all">Tous les types</option>
                <option value="delivery">Livraison</option>
                <option value="pickup">Retrait</option>
              </select>
            </div>
          </div>

          {/* Contrôles de vue et date */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-200">
            {viewMode === 'calendar' && (
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
                  onChange={(e) => handleDateChange(e.target.value)}
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
            )}

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

      {/* Vue Calendrier */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Planning du {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>

          {tasksForDate.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Aucune intervention planifiée pour cette date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksForDate.map(task => {
                const vehicle = fakeVehicles.find(v => v.id === task.vehicleId);
                return (
                  <Link
                    key={task.id}
                    to={`/technician/tasks/${task.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-[#33ffcc]">
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

          {/* Vue mensuelle simplifiée */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Vue d'ensemble du mois</h3>
            <div className="grid grid-cols-7 gap-2">
              {Object.keys(tasksByDate).sort().slice(0, 7).map(date => {
                const dateObj = new Date(date);
                const dayTasks = tasksByDate[date];
                const isSelected = date === selectedDate;
                const isTodayDate = isToday(date);
                
                return (
                  <button
                    key={date}
                    onClick={() => handleDateChange(date)}
                    className={`p-2 rounded-lg text-center transition-colors ${
                      isSelected
                        ? 'bg-[#33ffcc] text-[#000033] font-semibold'
                        : isTodayDate
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : dayTasks.length > 0
                        ? 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xs">{dateObj.getDate()}</div>
                    {dayTasks.length > 0 && (
                      <div className="text-xs mt-1 font-semibold">{dayTasks.length}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">Aucune intervention trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map(task => {
              const vehicle = fakeVehicles.find(v => v.id === task.vehicleId);
              return (
                <Link
                  key={task.id}
                  to={`/technician/tasks/${task.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {new Date(task.scheduledDate).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                        <span className="text-lg font-semibold text-[#33ffcc]">
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

