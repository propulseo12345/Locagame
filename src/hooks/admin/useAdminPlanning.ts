import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { DeliveryService, TechniciansService, ReservationsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import type { DeliveryTask } from '../../types';
import type { Technician, Vehicle } from '../../services/technicians.service';
import type {
  UnassignedReservation,
  AssignFilter,
  ViewMode,
  VehicleFormData,
} from '../../components/admin/planning/planning.types';
import { DEFAULT_VEHICLE_FORM } from '../../components/admin/planning/planning.types';
import { logger } from '../../lib/logger';
import { toLocalISODate } from '../../utils/dateHolidays';

function getWeekBounds(dateStr: string): { start: string; end: string } {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay(); // 0=dim
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // lundi
  const monday = new Date(date);
  monday.setDate(diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toLocalISODate(monday), end: toLocalISODate(sunday) };
}

export function useAdminPlanning() {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [reservations, setReservations] = useState<UnassignedReservation[]>([]);
  const [tasksState, setTasksState] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(toLocalISODate(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [assignFilter, setAssignFilter] = useState<AssignFilter>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [vehicleFormData, setVehicleFormData] = useState<VehicleFormData>(DEFAULT_VEHICLE_FORM);

  // Charger les donnees
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let tasksPromise: Promise<DeliveryTask[]>;

      if (viewMode === 'week') {
        const { start, end } = getWeekBounds(selectedDate);
        tasksPromise = DeliveryService.getAllTasks({ fromDate: start, toDate: end });
      } else {
        tasksPromise = DeliveryService.getTasksByDate(selectedDate);
      }

      const [vehiclesData, techniciansData, tasksData, unassignedRes] = await Promise.all([
        TechniciansService.getAllVehicles(),
        TechniciansService.getAllTechnicians(),
        tasksPromise,
        ReservationsService.getUnassignedReservations(),
      ]);
      setVehicles(vehiclesData);
      setTechnicians(techniciansData);
      setTasksState(tasksData);
      setReservations(unassignedRes as unknown as UnassignedReservation[]);
    } catch (err) {
      logger.error('Erreur chargement donn\u00e9es', err);
      toastRef.current.error('Erreur lors du chargement des donn\u00e9es');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rafraichir uniquement les taches et reservations (apres une operation)
  const refreshTasksAndReservations = useCallback(async () => {
    try {
      let tasksPromise: Promise<DeliveryTask[]>;

      if (viewMode === 'week') {
        const { start, end } = getWeekBounds(selectedDate);
        tasksPromise = DeliveryService.getAllTasks({ fromDate: start, toDate: end });
      } else {
        tasksPromise = DeliveryService.getTasksByDate(selectedDate);
      }

      const [tasksData, unassignedRes] = await Promise.all([
        tasksPromise,
        ReservationsService.getUnassignedReservations(),
      ]);
      setTasksState(tasksData);
      setReservations(unassignedRes as unknown as UnassignedReservation[]);
    } catch (err) {
      logger.error('Erreur rafra\u00eechissement', err);
    }
  }, [selectedDate, viewMode]);

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
  // Le service getUnassignedReservations() est la source de verite unique :
  // seules les reservations SANS delivery_task assignee y figurent.
  // On filtre par date pour la vue planning.
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

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate + 'T00:00:00');
    if (viewMode === 'week') {
      date.setDate(date.getDate() + (direction * 7));
    } else {
      date.setDate(date.getDate() + direction);
    }
    setSelectedDate(toLocalISODate(date));
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(toLocalISODate(today));
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

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

  return {
    // Data
    vehicles, setVehicles,
    technicians,
    tasksState,
    loading,
    operationInProgress, setOperationInProgress,
    // View state
    selectedDate, setSelectedDate,
    viewMode, setViewMode,
    assignFilter, setAssignFilter,
    currentMonth, setCurrentMonth, currentYear, setCurrentYear,
    // Vehicle modal state
    showVehicleModal, setShowVehicleModal,
    editingVehicle, setEditingVehicle,
    showDeleteConfirm, setShowDeleteConfirm,
    showMenu, setShowMenu,
    vehicleFormData, setVehicleFormData,
    // Computed
    filteredTasks,
    tasksByTechnician,
    unassignedReservations,
    calendarDays,
    // Actions
    navigateDate,
    goToToday,
    navigateMonth,
    refreshTasksAndReservations,
    getWeekBounds,
    toast,
  };
}
