import { useState, useEffect, useCallback } from 'react';
import { ReservationsService } from '../../services';
import { Order } from '../../types';
import { supabase } from '../../lib/supabase';

interface UseReservationDetailReturn {
  reservation: Order | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  technicians: any[];
  deliveryTasks: any[];
  selectedTechnician: string;
  setSelectedTechnician: (value: string) => void;
  handleStatusChange: (newStatus: Order['status']) => Promise<void>;
  handleAssignTechnician: (taskId: string) => Promise<void>;
}

export function useReservationDetail(id: string | undefined): UseReservationDetailReturn {
  const [reservation, setReservation] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [deliveryTasks, setDeliveryTasks] = useState<any[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');

  const loadReservation = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await ReservationsService.getReservationById(id);
      if (data) {
        setReservation(data);
      } else {
        setError('Reservation introuvable');
      }
    } catch (err) {
      console.error('Erreur chargement reservation:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadTechnicians = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('technicians')
        .select('*')
        .eq('is_available', true)
        .order('name');
      setTechnicians(data || []);
    } catch (err) {
      console.error('Erreur chargement techniciens:', err);
    }
  }, []);

  const loadDeliveryTasks = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await supabase
        .from('delivery_tasks')
        .select('*, technician:technicians(*), vehicle:vehicles(*)')
        .eq('reservation_id', id)
        .order('scheduled_date');
      setDeliveryTasks(data || []);
    } catch (err) {
      console.error('Erreur chargement taches:', err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadReservation();
      loadTechnicians();
      loadDeliveryTasks();
    }
  }, [id, loadReservation, loadTechnicians, loadDeliveryTasks]);

  const handleStatusChange = useCallback(async (newStatus: Order['status']) => {
    if (!reservation) return;
    try {
      setUpdating(true);
      await ReservationsService.updateReservationStatus(reservation.id, newStatus);
      await loadReservation();
    } catch (err) {
      console.error('Erreur mise a jour statut:', err);
      alert('Erreur lors de la mise a jour du statut');
    } finally {
      setUpdating(false);
    }
  }, [reservation, loadReservation]);

  const handleAssignTechnician = useCallback(async (taskId: string) => {
    if (!selectedTechnician) return;
    try {
      setUpdating(true);
      await supabase
        .from('delivery_tasks')
        .update({ technician_id: selectedTechnician })
        .eq('id', taskId);
      await loadDeliveryTasks();
      setSelectedTechnician('');
    } catch (err) {
      console.error('Erreur assignation technicien:', err);
      alert('Erreur lors de l\'assignation');
    } finally {
      setUpdating(false);
    }
  }, [selectedTechnician, loadDeliveryTasks]);

  return {
    reservation,
    loading,
    error,
    updating,
    technicians,
    deliveryTasks,
    selectedTechnician,
    setSelectedTechnician,
    handleStatusChange,
    handleAssignTechnician,
  };
}
