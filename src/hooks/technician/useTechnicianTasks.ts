import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DeliveryTask, Vehicle } from '../../types';
import { getCurrentDateISO, getCurrentDate, isToday } from '../../utils/fixedDate';
import { DeliveryService, TechniciansService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateStr } from '../../components/technician/tasks/taskConfigs';

export function useTechnicianTasks() {
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

  // Charger les taches du technicien
  useEffect(() => {
    loadTasks();
  }, [user]);

  // Mettre a jour la date si elle change dans l'URL
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
      const technician = await TechniciansService.getTechnicianByUserId(user.id);
      if (technician) {
        const [tasks, vehiclesData] = await Promise.all([
          DeliveryService.getTechnicianTasks(technician.id),
          TechniciansService.getAllVehicles(),
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

  // Filtrer les taches
  const filteredTasks = useMemo(() => {
    let tasks = [...allTasks];

    if (statusFilter !== 'all') {
      tasks = tasks.filter((t) => t.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      tasks = tasks.filter((t) => t.type === typeFilter);
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.customer.firstName.toLowerCase().includes(search) ||
          t.customer.lastName.toLowerCase().includes(search) ||
          t.address.city.toLowerCase().includes(search) ||
          t.orderNumber.toLowerCase().includes(search)
      );
    }

    return tasks.sort((a, b) => {
      const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateCompare !== 0) return dateCompare;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [allTasks, statusFilter, typeFilter, searchTerm]);

  // Grouper par date pour la vue calendrier
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};
    filteredTasks.forEach((task) => {
      if (!grouped[task.scheduledDate]) {
        grouped[task.scheduledDate] = [];
      }
      grouped[task.scheduledDate].push(task);
    });
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });
    return grouped;
  }, [filteredTasks]);

  // Taches pour la date selectionnee (vue calendrier)
  const tasksForDate = useMemo(() => {
    return tasksByDate[selectedDate] || [];
  }, [tasksByDate, selectedDate]);

  // Generer les jours du calendrier
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek < 0) startingDayOfWeek = 6;

    const days: Array<{ date: Date | null; dateStr: string; tasks: DeliveryTask[] }> = [];

    // Jours du mois precedent
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
      days.push({ date, dateStr, tasks: tasksByDate[dateStr] || [] });
    }

    // Jours du mois suivant pour completer la grille
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

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || searchTerm !== '';

  return {
    // State
    loading,
    viewMode,
    setViewMode,
    selectedDate,
    currentMonth,
    currentYear,
    vehicles,
    // Filters
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    searchTerm,
    setSearchTerm,
    hasActiveFilters,
    clearFilters,
    // Data
    filteredTasks,
    tasksForDate,
    calendarDays,
    // Actions
    navigateMonth,
    goToToday,
    handleDateChange,
    isCurrentMonth,
  };
}
