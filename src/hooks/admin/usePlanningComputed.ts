import { useMemo } from 'react';
import type { DeliveryTask } from '../../types';
import type { AssignFilter, ViewMode, UnassignedReservation } from '../../components/admin/planning/planning.types';
import { getWeekBounds } from './usePlanningFilters';
import { toLocalISODate } from '../../utils/dateHolidays';

interface UsePlanningComputedParams {
  tasksState: DeliveryTask[];
  selectedDate: string;
  assignFilter: AssignFilter;
  viewMode: ViewMode;
  reservations: UnassignedReservation[];
  currentMonth: number;
  currentYear: number;
}

export function usePlanningComputed({
  tasksState,
  selectedDate,
  assignFilter,
  viewMode,
  reservations,
  currentMonth,
  currentYear,
}: UsePlanningComputedParams) {
  // Taches pour la date selectionnee
  const existingTasks = useMemo(() => {
    return tasksState.filter(task => task.scheduledDate === selectedDate);
  }, [selectedDate, tasksState]);

  // Filtrer les taches selon le filtre d'assignation
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

  // Grouper les taches par technicien
  const tasksByTechnician = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};
    filteredTasks.forEach(task => {
      const key = task.technicianId || '__unassigned__';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    });
    Object.keys(grouped).forEach(techId => {
      grouped[techId].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });
    return grouped;
  }, [filteredTasks]);

  // Reservations non encore assignees pour cette date
  const unassignedReservations = useMemo(() => {
    if (viewMode === 'week') {
      const { start, end } = getWeekBounds(selectedDate);
      return reservations.filter(res => res.start_date >= start && res.start_date <= end);
    }
    return reservations.filter(res => res.start_date === selectedDate);
  }, [reservations, selectedDate, viewMode]);

  // Grouper toutes les taches par date pour la vue mois
  const allTasksByDate = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};
    tasksState.forEach(task => {
      if (!grouped[task.scheduledDate]) grouped[task.scheduledDate] = [];
      grouped[task.scheduledDate].push(task);
    });
    return grouped;
  }, [tasksState]);

  // Generer les jours du mois pour le calendrier
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: Array<{ date: Date | null; tasks: DeliveryTask[] }> = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, tasks: [] });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = toLocalISODate(date);
      days.push({ date, tasks: allTasksByDate[dateStr] || [] });
    }
    return days;
  }, [currentMonth, currentYear, allTasksByDate]);

  return {
    filteredTasks,
    tasksByTechnician,
    unassignedReservations,
    calendarDays,
  };
}
