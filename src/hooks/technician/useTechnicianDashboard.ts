import { useState, useMemo, useEffect } from 'react';
import { DeliveryTask, Vehicle } from '../../types';
import { getCurrentDateISO, getCurrentDate, isToday } from '../../utils/fixedDate';
import { DeliveryService, TechniciansService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateStr } from '../../components/technician/dashboard/technicianDashboard.utils';

export interface CalendarDay {
  date: Date | null;
  dateStr: string;
  tasks: DeliveryTask[];
}

export interface MonthStats {
  total: number;
  deliveries: number;
  pickups: number;
  completed: number;
  pending: number;
  inProgress: number;
  completionRate: number;
}

export function useTechnicianDashboard() {
  const { userProfile } = useAuth();
  const fixedDate = getCurrentDate();

  const [selectedDate, setSelectedDate] = useState(getCurrentDateISO());
  const [currentMonth, setCurrentMonth] = useState(fixedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(fixedDate.getFullYear());
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');

  // Data states
  const [allTasks, setAllTasks] = useState<DeliveryTask[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Supabase
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
        console.error('Erreur chargement donn\u00e9es:', err);
        setError('Impossible de charger vos t\u00e2ches');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userProfile]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};

    allTasks.forEach((task) => {
      if (selectedVehicle !== 'all' && task.vehicleId !== selectedVehicle) return;

      if (!grouped[task.scheduledDate]) {
        grouped[task.scheduledDate] = [];
      }
      grouped[task.scheduledDate].push(task);
    });

    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });

    return grouped;
  }, [allTasks, selectedVehicle]);

  // Tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    return tasksByDate[selectedDate] || [];
  }, [tasksByDate, selectedDate]);

  // Month statistics
  const monthStats = useMemo<MonthStats>(() => {
    const monthTasks = allTasks.filter((task) => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
    });

    const deliveries = monthTasks.filter((t) => t.type === 'delivery');
    const pickups = monthTasks.filter((t) => t.type === 'pickup');
    const completed = monthTasks.filter((t) => t.status === 'completed');

    return {
      total: monthTasks.length,
      deliveries: deliveries.length,
      pickups: pickups.length,
      completed: completed.length,
      pending: monthTasks.filter((t) => t.status === 'scheduled').length,
      inProgress: monthTasks.filter((t) => t.status === 'in_progress').length,
      completionRate:
        monthTasks.length > 0
          ? Math.round((completed.length / monthTasks.length) * 100)
          : 0,
    };
  }, [allTasks, currentMonth, currentYear]);

  // Generate calendar days
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek < 0) startingDayOfWeek = 6;

    const days: CalendarDay[] = [];

    // Previous month days
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
      const dateStr = formatDateStr(date);
      days.push({ date, dateStr, tasks: tasksByDate[dateStr] || [] });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = formatDateStr(date);
      days.push({ date, dateStr, tasks: tasksByDate[dateStr] || [] });
    }

    // Next month days to fill grid
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
    setSelectedDate(getCurrentDateISO());
  };

  const isCurrentMonth = (date: Date | null) => {
    if (!date) return false;
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  };

  return {
    // State
    selectedDate,
    setSelectedDate,
    currentMonth,
    currentYear,
    selectedVehicle,
    setSelectedVehicle,
    loading,
    error,
    vehicles,

    // Computed
    tasksForSelectedDate,
    monthStats,
    calendarDays,

    // Actions
    navigateMonth,
    goToToday,
    isCurrentMonth,
  };
}
