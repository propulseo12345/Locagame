import { Link, useSearchParams } from 'react-router-dom';
import { DeliveryTask, Vehicle } from '../../types';
import { useState, useMemo, useEffect } from 'react';
import { getCurrentDateISO, getCurrentDate, isToday } from '../../utils/fixedDate';
import { DeliveryService, TechniciansService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Play,
  Ban,
  Navigation,
  ExternalLink,
  Filter,
  LayoutList,
  CalendarDays,
  Loader2,
  Search,
  X
} from 'lucide-react';

export default function TechnicianTasks() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFromUrl = searchParams.get('date');
  const fixedDate = getCurrentDate();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(
    dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)
      ? dateFromUrl
      : getCurrentDateISO()
  );
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)) {
      return new Date(dateFromUrl).getMonth();
    }
    return fixedDate.getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    if (dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)) {
      return new Date(dateFromUrl).getFullYear();
    }
    return fixedDate.getFullYear();
  });

  const [allTasks, setAllTasks] = useState<DeliveryTask[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les tâches du technicien
  useEffect(() => {
    loadTasks();
  }, [user]);

  // Mettre à jour la date si elle change dans l'URL
  useEffect(() => {
    if (dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)) {
      setSelectedDate(dateFromUrl);
      const date = new Date(dateFromUrl);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  }, [dateFromUrl]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Récupérer le profil technicien
      const technician = await TechniciansService.getTechnicianByUserId(user.id);
      if (technician) {
        // Récupérer les tâches et véhicules en parallèle
        const [tasks, vehiclesData] = await Promise.all([
          DeliveryService.getTechnicianTasks(technician.id),
          TechniciansService.getAllVehicles()
        ]);
        setAllTasks(tasks);
        setVehicles(vehiclesData);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper pour formater la date en YYYY-MM-DD
  function formatDateStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Filtrer les tâches
  const filteredTasks = useMemo(() => {
    let tasks = [...allTasks];

    if (statusFilter !== 'all') {
      tasks = tasks.filter(t => t.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      tasks = tasks.filter(t => t.type === typeFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      tasks = tasks.filter(t =>
        t.customer.firstName.toLowerCase().includes(search) ||
        t.customer.lastName.toLowerCase().includes(search) ||
        t.address.city.toLowerCase().includes(search) ||
        t.orderNumber.toLowerCase().includes(search)
      );
    }

    // Trier par date et heure
    return tasks.sort((a, b) => {
      const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateCompare !== 0) return dateCompare;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [allTasks, statusFilter, typeFilter, searchTerm]);

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

  // Tâches pour la date sélectionnée (vue calendrier)
  const tasksForDate = useMemo(() => {
    return tasksByDate[selectedDate] || [];
  }, [tasksByDate, selectedDate]);

  // Générer les jours du calendrier
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek < 0) startingDayOfWeek = 6;

    const days: Array<{ date: Date | null; dateStr: string; tasks: DeliveryTask[] }> = [];

    // Jours du mois précédent
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
      const dateStr = formatDateStr(date);
      days.push({ date, dateStr, tasks: tasksByDate[dateStr] || [] });
    }

    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = formatDateStr(date);
      days.push({
        date,
        dateStr,
        tasks: tasksByDate[dateStr] || []
      });
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      const dateStr = formatDateStr(date);
      days.push({ date, dateStr, tasks: tasksByDate[dateStr] || [] });
    }

    return days;
  }, [currentMonth, currentYear, tasksByDate]);

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

  const goToToday = () => {
    const today = getCurrentDate();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    const todayStr = getCurrentDateISO();
    setSelectedDate(todayStr);
    setSearchParams({ date: todayStr });
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSearchParams({ date: newDate });
  };

  const isCurrentMonth = (date: Date | null) => {
    if (!date) return false;
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  };

  const getStatusConfig = (status: DeliveryTask['status']) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
          label: 'Terminé',
          dot: 'bg-emerald-500'
        };
      case 'in_progress':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Play,
          label: 'En cours',
          dot: 'bg-blue-500'
        };
      case 'scheduled':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: Clock,
          label: 'Planifié',
          dot: 'bg-amber-500'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: Ban,
          label: 'Annulé',
          dot: 'bg-red-500'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: AlertCircle,
          label: status,
          dot: 'bg-gray-500'
        };
    }
  };

  const getTypeConfig = (type: 'delivery' | 'pickup') => {
    return type === 'delivery'
      ? {
          color: 'bg-[#33ffcc] text-[#000033]',
          icon: Truck,
          label: 'Livraison',
          accent: '#33ffcc'
        }
      : {
          color: 'bg-orange-500 text-white',
          icon: Package,
          label: 'Retrait',
          accent: '#f97316'
        };
  };

  const getGoogleMapsUrl = (address: DeliveryTask['address']) => {
    const query = encodeURIComponent(`${address.street}, ${address.postalCode} ${address.city}, ${address.country}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || searchTerm !== '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#33ffcc] animate-spin" />
          <p className="text-gray-600">Chargement des interventions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes interventions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredTasks.length} intervention{filteredTasks.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-[#000033] font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Calendrier</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-[#000033] font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span>Liste</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, ville, commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtres select */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] bg-white min-w-[150px]"
            >
              <option value="all">Tous les statuts</option>
              <option value="scheduled">Planifié</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] bg-white min-w-[150px]"
            >
              <option value="all">Tous les types</option>
              <option value="delivery">Livraison</option>
              <option value="pickup">Retrait</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vue Calendrier */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendrier mensuel */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header du calendrier */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#000033] to-[#000044]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-bold text-white capitalize min-w-[180px] text-center">
                    {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="px-4 py-1.5 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#2ee6b8] transition-colors text-sm"
                >
                  Aujourd'hui
                </button>
              </div>
            </div>

            {/* Grille du calendrier */}
            <div className="p-4">
              {/* En-têtes des jours */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Jours */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayData, index) => {
                  const { date, dateStr, tasks } = dayData;
                  if (!date) return <div key={index} />;

                  const isTodayDate = isToday(date);
                  const isSelected = dateStr === selectedDate;
                  const isInCurrentMonth = isCurrentMonth(date);
                  const deliveries = tasks.filter(t => t.type === 'delivery');
                  const pickups = tasks.filter(t => t.type === 'pickup');
                  const hasUrgent = tasks.some(t => t.status === 'in_progress');

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateChange(dateStr)}
                      className={`
                        relative min-h-[80px] p-1.5 rounded-lg text-left transition-all duration-200
                        ${isSelected
                          ? 'bg-[#33ffcc]/20 ring-2 ring-[#33ffcc] shadow-lg'
                          : isTodayDate
                            ? 'bg-blue-50 ring-1 ring-blue-300'
                            : isInCurrentMonth
                              ? 'bg-gray-50 hover:bg-gray-100'
                              : 'bg-gray-25 opacity-40'
                        }
                      `}
                    >
                      <div className={`
                        text-sm font-semibold mb-1 flex items-center justify-between
                        ${isSelected ? 'text-[#000033]' : isTodayDate ? 'text-blue-700' : isInCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      `}>
                        <span className={`
                          w-6 h-6 flex items-center justify-center rounded-full
                          ${isTodayDate && !isSelected ? 'bg-blue-600 text-white' : ''}
                        `}>
                          {date.getDate()}
                        </span>
                        {hasUrgent && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>

                      {tasks.length > 0 && (
                        <div className="space-y-0.5">
                          {deliveries.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] bg-[#33ffcc]/30 text-[#000033] px-1.5 py-0.5 rounded">
                              <Truck className="w-2.5 h-2.5" />
                              <span className="font-medium">{deliveries.length}</span>
                            </div>
                          )}
                          {pickups.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                              <Package className="w-2.5 h-2.5" />
                              <span className="font-medium">{pickups.length}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Légende */}
            <div className="px-4 pb-4 flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#33ffcc]/30 rounded" />
                <span>Livraison</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange-100 rounded" />
                <span>Retrait</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>En cours</span>
              </div>
            </div>
          </div>

          {/* Panel de détail du jour */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[700px]">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-bold text-gray-900 capitalize">
                {new Date(selectedDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {tasksForDate.length} intervention{tasksForDate.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {tasksForDate.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Calendar className="w-12 h-12 mb-3 opacity-50" />
                  <p className="font-medium">Aucune intervention</p>
                  <p className="text-sm">Profitez de votre journée !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasksForDate.map((task, idx) => {
                    const typeConfig = getTypeConfig(task.type);
                    const statusConfig = getStatusConfig(task.status);
                    const TypeIcon = typeConfig.icon;
                    const vehicle = vehicles.find(v => v.id === task.vehicleId);

                    return (
                      <div key={task.id} className="relative group">
                        {/* Timeline connector */}
                        {idx < tasksForDate.length - 1 && (
                          <div
                            className="absolute left-[19px] top-[52px] bottom-[-12px] w-0.5 bg-gray-200"
                            style={{ height: 'calc(100% - 40px)' }}
                          />
                        )}

                        <div className="flex gap-3">
                          {/* Timeline dot */}
                          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>

                          {/* Card content */}
                          <Link
                            to={`/technician/tasks/${task.id}`}
                            className="flex-1 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-[#000033]">
                                  {task.scheduledTime}
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                              </div>
                              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#33ffcc] transition-colors" />
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium text-gray-900">
                                  {task.customer.firstName} {task.customer.lastName}
                                </span>
                              </div>

                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600 line-clamp-1">
                                  {task.address.street}, {task.address.city}
                                </span>
                              </div>

                              {vehicle && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Truck className="w-3 h-3" />
                                  <span>{vehicle.name}</span>
                                </div>
                              )}

                              {/* Produits */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {task.products.slice(0, 2).map((product, pidx) => (
                                  <span
                                    key={pidx}
                                    className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-600"
                                  >
                                    {product.productName} ×{product.quantity}
                                  </span>
                                ))}
                                {task.products.length > 2 && (
                                  <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                                    +{task.products.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quick actions */}
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                              <a
                                href={`tel:${task.customer.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#33ffcc] transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Appeler</span>
                              </a>
                              <span className="text-gray-300">|</span>
                              <a
                                href={getGoogleMapsUrl(task.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#33ffcc] transition-colors"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>Itinéraire</span>
                              </a>
                            </div>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">Aucune intervention trouvée</p>
              <p className="text-sm text-gray-400 mt-1">
                {hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Vous n\'avez aucune intervention planifiée'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTasks.map(task => {
                const typeConfig = getTypeConfig(task.type);
                const statusConfig = getStatusConfig(task.status);
                const TypeIcon = typeConfig.icon;
                const vehicle = vehicles.find(v => v.id === task.vehicleId);

                return (
                  <Link
                    key={task.id}
                    to={`/technician/tasks/${task.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Type icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}>
                        <TypeIcon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(task.scheduledDate).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span className="text-lg font-bold text-[#33ffcc]">
                            {task.scheduledTime}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>

                        <p className="font-semibold text-gray-900 mb-1">
                          {task.customer.firstName} {task.customer.lastName}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">
                            {task.address.street}, {task.address.postalCode} {task.address.city}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {vehicle && (
                            <div className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              <span>{vehicle.name}</span>
                            </div>
                          )}
                          <span>Commande: {task.orderNumber}</span>
                        </div>

                        {/* Produits */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {task.products.map((product, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600"
                            >
                              {product.productName} ×{product.quantity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#33ffcc] transition-colors" />
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${task.customer.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-gray-400 hover:text-[#33ffcc] hover:bg-[#33ffcc]/10 rounded-lg transition-colors"
                            title="Appeler"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={getGoogleMapsUrl(task.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-gray-400 hover:text-[#33ffcc] hover:bg-[#33ffcc]/10 rounded-lg transition-colors"
                            title="Itinéraire"
                          >
                            <Navigation className="w-4 h-4" />
                          </a>
                        </div>
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
