import { useState, useMemo, useEffect, useCallback } from 'react';
import { DeliveryService, TechniciansService, ReservationsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import type { DeliveryTask } from '../../types';
import type { Technician, Vehicle } from '../../services/technicians.service';
import type {
  UnassignedReservation,
  AssignFilter,
  VehicleFormData,
} from '../../components/admin/planning/planning.types';
import { DEFAULT_VEHICLE_FORM } from '../../components/admin/planning/planning.types';

export function useAdminPlanning() {
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
  const [vehicleFormData, setVehicleFormData] = useState<VehicleFormData>(DEFAULT_VEHICLE_FORM);

  // Charger les donnees
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
      console.error('Erreur chargement donn\u00e9es:', err);
      toast.error('Erreur lors du chargement des donn\u00e9es');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rafraichir uniquement les taches et reservations (apres une operation)
  const refreshTasksAndReservations = useCallback(async () => {
    try {
      const [tasksData, unassignedRes] = await Promise.all([
        DeliveryService.getTasksByDate(selectedDate),
        ReservationsService.getUnassignedReservations(),
      ]);
      setTasksState(tasksData);
      setReservations(unassignedRes as unknown as UnassignedReservation[]);
    } catch (err) {
      console.error('Erreur rafra\u00eechissement:', err);
    }
  }, [selectedDate]);

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
    const assignedReservationIds = new Set(existingTasks.map(t => t.reservationId));
    return reservations.filter(res => {
      return res.start_date === selectedDate && !assignedReservationIds.has(res.id);
    });
  }, [reservations, selectedDate, existingTasks]);

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
      const dateStr = date.toISOString().split('T')[0];
      days.push({ date, tasks: allTasksByDate[dateStr] || [] });
    }
    return days;
  }, [currentMonth, currentYear, allTasksByDate]);

  const navigateDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
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
    toast,
  };
}
