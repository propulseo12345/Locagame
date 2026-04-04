import { useState, useEffect, useCallback, useRef } from 'react';
import { DeliveryService, TechniciansService, ReservationsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
import type { DeliveryTask } from '../../types';
import type { Technician, Vehicle } from '../../services/technicians.service';
import type { UnassignedReservation, ViewMode } from '../../components/admin/planning/planning.types';
import { getWeekBounds } from './usePlanningFilters';
import { logger } from '../../lib/logger';

export function usePlanningData(selectedDate: string, viewMode: ViewMode) {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [reservations, setReservations] = useState<UnassignedReservation[]>([]);
  const [tasksState, setTasksState] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null);

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
      logger.error('Erreur chargement données', err);
      toastRef.current.error('Erreur lors du chargement des données');
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
      logger.error('Erreur rafraîchissement', err);
    }
  }, [selectedDate, viewMode]);

  return {
    vehicles, setVehicles,
    technicians,
    reservations,
    tasksState,
    loading,
    operationInProgress, setOperationInProgress,
    refreshTasksAndReservations,
    toast,
  };
}
