import { useState, useEffect, useCallback } from 'react';
import { DeliveryTask, Vehicle, Order } from '../../types';
import { DeliveryService, TechniciansService, ReservationsService } from '../../services';
import { Technician } from '../../services/technicians.service';

interface UseTaskDetailResult {
  task: DeliveryTask | null;
  vehicle: Vehicle | null;
  technician: Technician | null;
  reservation: Order | null;
  loading: boolean;
  error: string | null;
  setTask: React.Dispatch<React.SetStateAction<DeliveryTask | null>>;
  handleStartTask: () => Promise<void>;
  handleCompleteTask: () => Promise<void>;
}

export function useTaskDetail(id: string | undefined): UseTaskDetailResult {
  const [task, setTask] = useState<DeliveryTask | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [reservation, setReservation] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const taskData = await DeliveryService.getTaskById(id);
        if (!taskData) {
          setError('Intervention introuvable');
          return;
        }
        setTask(taskData);

        const [vehicleData, technicianData, reservationData] = await Promise.all([
          taskData.vehicleId ? TechniciansService.getVehicleById(taskData.vehicleId) : null,
          taskData.technicianId ? TechniciansService.getTechnicianById(taskData.technicianId) : null,
          taskData.reservationId ? ReservationsService.getReservationById(taskData.reservationId) : null,
        ]);
        setVehicle(vehicleData);
        setTechnician(technicianData);
        setReservation(reservationData);
      } catch (err) {
        console.error('Erreur chargement tâche:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleStartTask = useCallback(async () => {
    if (!task) return;
    try {
      await DeliveryService.updateTaskStatus(task.id, 'in_progress');
      setTask({ ...task, status: 'in_progress', startedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Erreur démarrage intervention:', err);
      alert('Erreur lors du démarrage de l\'intervention');
    }
  }, [task]);

  const handleCompleteTask = useCallback(async () => {
    if (!task) return;
    try {
      await DeliveryService.updateTaskStatus(task.id, 'completed');
      setTask({ ...task, status: 'completed', completedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Erreur complétion intervention:', err);
      alert('Erreur lors de la complétion de l\'intervention');
    }
  }, [task]);

  return {
    task,
    vehicle,
    technician,
    reservation,
    loading,
    error,
    setTask,
    handleStartTask,
    handleCompleteTask,
  };
}
