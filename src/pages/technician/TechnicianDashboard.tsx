import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DeliveryTask, Vehicle } from '../../types';
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
  CalendarDays,
  LayoutList,
  Filter,
  TrendingUp,
  Loader2
} from 'lucide-react';

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const fixedDate = getCurrentDate();

  const [selectedDate, setSelectedDate] = useState(getCurrentDateISO());
  const [currentMonth, setCurrentMonth] = useState(fixedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(fixedDate.getFullYear());
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

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

  // Grouper toutes les tâches par date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};

    allTasks.forEach(task => {
      if (selectedVehicle !== 'all' && task.vehicleId !== selectedVehicle) return;

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
  }, [allTasks, selectedVehicle]);

  // Tâches pour la date sélectionnée
  const tasksForSelectedDate = useMemo(() => {
    return tasksByDate[selectedDate] || [];
  }, [tasksByDate, selectedDate]);

  // Statistiques du mois
  const monthStats = useMemo(() => {
    const monthTasks = allTasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
    });

    const deliveries = monthTasks.filter(t => t.type === 'delivery');
    const pickups = monthTasks.filter(t => t.type === 'pickup');
    const completed = monthTasks.filter(t => t.status === 'completed');

    return {
      total: monthTasks.length,
      deliveries: deliveries.length,
      pickups: pickups.length,
      completed: completed.length,
      pending: monthTasks.filter(t => t.status === 'scheduled').length,
      inProgress: monthTasks.filter(t => t.status === 'in_progress').length,
      completionRate: monthTasks.length > 0 ? Math.round((completed.length / monthTasks.length) * 100) : 0
    };
  }, [allTasks, currentMonth, currentYear]);

  // Générer les jours du calendrier
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Commencer par Lundi (1) au lieu de Dimanche (0)
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
    const remainingDays = 42 - days.length; // 6 lignes x 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      const dateStr = formatDateStr(date);
      days.push({ date, dateStr, tasks: tasksByDate[dateStr] || [] });
    }

    return days;
  }, [currentMonth, currentYear, tasksByDate]);

  // Helper pour formater la date en YYYY-MM-DD
  function formatDateStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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
    setSelectedDate(getCurrentDateISO());
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

  const isCurrentMonth = (date: Date | null) => {
    if (!date) return false;
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  };

  // Générer le lien Google Maps
  const getGoogleMapsUrl = (address: DeliveryTask['address']) => {
    const query = encodeURIComponent(`${address.street}, ${address.postalCode} ${address.city}, ${address.country}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#33ffcc] animate-spin" />
          <p className="text-gray-600">Chargement du planning...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#33ffcc] text-[#000033] rounded-lg font-medium hover:bg-[#2ee6b8] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats du mois */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#33ffcc]/20 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-[#33ffcc]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{monthStats.total}</p>
              <p className="text-xs text-gray-500">Interventions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#33ffcc]/20 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#33ffcc]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{monthStats.deliveries}</p>
              <p className="text-xs text-gray-500">Livraisons</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{monthStats.pickups}</p>
              <p className="text-xs text-gray-500">Retraits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{monthStats.completionRate}%</p>
              <p className="text-xs text-gray-500">Réalisé</p>
            </div>
          </div>
        </div>
      </div>

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
              <div className="flex items-center gap-2">
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
                >
                  <option value="all" className="text-gray-900">Tous véhicules</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id} className="text-gray-900">
                      {vehicle.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={goToToday}
                  className="px-4 py-1.5 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#2ee6b8] transition-colors text-sm"
                >
                  Aujourd'hui
                </button>
              </div>
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
                    onClick={() => setSelectedDate(dateStr)}
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
              {tasksForSelectedDate.length} intervention{tasksForSelectedDate.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {tasksForSelectedDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Calendar className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-medium">Aucune intervention</p>
                <p className="text-sm">Profitez de votre journée !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasksForSelectedDate.map((task, idx) => {
                  const typeConfig = getTypeConfig(task.type);
                  const statusConfig = getStatusConfig(task.status);
                  const StatusIcon = statusConfig.icon;
                  const TypeIcon = typeConfig.icon;
                  const vehicle = vehicles.find(v => v.id === task.vehicleId);

                  return (
                    <div
                      key={task.id}
                      className="relative group"
                    >
                      {/* Timeline connector */}
                      {idx < tasksForSelectedDate.length - 1 && (
                        <div
                          className="absolute left-[19px] top-[52px] bottom-[-12px] w-0.5 bg-gray-200"
                          style={{ height: 'calc(100% - 40px)' }}
                        />
                      )}

                      <div className="flex gap-3">
                        {/* Timeline dot */}
                        <div
                          className={`
                            relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                            ${typeConfig.color}
                          `}
                        >
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

          {/* Footer avec bouton vers toutes les tâches */}
          {tasksForSelectedDate.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <Link
                to={`/technician/tasks?date=${selectedDate}`}
                className="block w-full py-2.5 bg-[#000033] text-white text-center rounded-lg font-medium hover:bg-[#000044] transition-colors"
              >
                Voir toutes les interventions
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
