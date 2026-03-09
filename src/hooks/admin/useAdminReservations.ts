import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ReservationsService, DeliveryService, TechniciansService } from '../../services';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import type {
  ReservationTechnician,
  ReservationVehicle,
  UnassignedReservation,
  ReservationStats,
  DeliveryTaskInfo,
} from '../../components/admin/reservations/types';

export function useAdminReservations() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [allReservations, setAllReservations] = useState<Order[]>([]);
  const [unassignedReservations, setUnassignedReservations] = useState<UnassignedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState<ReservationTechnician[]>([]);
  const [vehicles, setVehicles] = useState<ReservationVehicle[]>([]);

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<UnassignedReservation | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  // Delivery tasks map (reservationId → task info)
  const [deliveryTasksMap, setDeliveryTasksMap] = useState<Record<string, DeliveryTaskInfo>>({});

  // Expanded row state
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [allRes, unassignedRes, techs, vehs, allTasks] = await Promise.all([
        ReservationsService.getAllReservations(),
        ReservationsService.getUnassignedReservations(),
        TechniciansService.getAllTechnicians(),
        TechniciansService.getAllVehicles(),
        DeliveryService.getAllTasks(),
      ]);
      setAllReservations(allRes);
      setUnassignedReservations(unassignedRes);
      setTechnicians(techs);
      setVehicles(vehs);

      // Build delivery tasks map by reservationId
      const techMap = new Map(techs.map(t => [t.id, `${t.first_name} ${t.last_name}`]));
      const tasksMap: Record<string, DeliveryTaskInfo> = {};
      for (const task of allTasks) {
        if (task.reservationId && task.technicianId) {
          tasksMap[task.reservationId] = {
            id: task.id,
            reservationId: task.reservationId,
            technicianId: task.technicianId,
            status: task.status,
            technicianName: techMap.get(task.technicianId),
          };
        }
      }
      setDeliveryTasksMap(tasksMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredReservations = useMemo(() => {
    return allReservations.filter(reservation => {
      const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
      const customer = reservation.customer as any;
      const customerName = customer?.first_name && customer?.last_name
        ? `${customer.first_name} ${customer.last_name}`
        : customer?.email || '';
      const matchesSearch =
        (reservation.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [allReservations, statusFilter, searchTerm]);

  const stats: ReservationStats = useMemo(() => ({
    total: allReservations.length,
    pending_payment: allReservations.filter(r => r.status === 'pending_payment').length,
    pending: allReservations.filter(r => r.status === 'pending').length,
    confirmed: allReservations.filter(r => r.status === 'confirmed').length,
    preparing: allReservations.filter(r => r.status === 'preparing').length,
    delivered: allReservations.filter(r => r.status === 'delivered').length,
    completed: allReservations.filter(r => r.status === 'completed').length,
    unassigned: unassignedReservations.length,
  }), [allReservations, unassignedReservations]);

  const handleRejectReservation = useCallback(async (reservationId: string) => {
    const reason = prompt('Motif du refus (optionnel):');
    if (reason === null) return;
    try {
      await ReservationsService.updateReservationStatus(reservationId, 'cancelled');
      await loadData();
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      alert('Erreur lors du refus');
    }
  }, [loadData]);

  const handleAssignClick = useCallback((reservation: UnassignedReservation) => {
    setSelectedReservation(reservation);
    setSelectedTechnician('');
    setSelectedVehicle('');
    setShowAssignModal(true);
  }, []);

  const handleAssign = useCallback(async () => {
    if (!selectedReservation || !selectedTechnician || !selectedVehicle) {
      alert('Veuillez selectionner un technicien et un vehicule');
      return;
    }

    if (!selectedReservation.delivery_task_id) {
      alert('Erreur: tache de livraison introuvable');
      return;
    }

    try {
      setAssigning(true);
      await DeliveryService.assignTask(
        selectedReservation.delivery_task_id,
        selectedTechnician,
        selectedVehicle
      );

      await loadData();
      setShowAssignModal(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Erreur lors de l\'assignation. Veuillez reessayer.');
    } finally {
      setAssigning(false);
    }
  }, [selectedReservation, selectedTechnician, selectedVehicle, loadData]);

  // Auto-refresh quand il y a des pending_payment (toutes les 10s)
  const hasPendingPayments = useMemo(
    () => allReservations.some(r => r.status === 'pending_payment'),
    [allReservations]
  );

  useEffect(() => {
    if (!hasPendingPayments) return;
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, [hasPendingPayments, loadData]);

  // Realtime: subscribe to delivery_tasks changes for live status updates
  const techniciansRef = useRef(technicians);
  techniciansRef.current = technicians;

  useEffect(() => {
    const channel = supabase
      .channel('delivery_tasks_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'delivery_tasks',
      }, (payload) => {
        const updated = payload.new as { id: string; reservation_id: string; technician_id: string; status: string };
        if (!updated.reservation_id || !updated.technician_id) return;
        const techName = techniciansRef.current.find(t => t.id === updated.technician_id);
        setDeliveryTasksMap(prev => ({
          ...prev,
          [updated.reservation_id]: {
            id: updated.id,
            reservationId: updated.reservation_id,
            technicianId: updated.technician_id,
            status: updated.status,
            technicianName: techName ? `${techName.first_name} ${techName.last_name}` : undefined,
          },
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCloseAssignModal = useCallback(() => {
    setShowAssignModal(false);
    setSelectedReservation(null);
  }, []);

  const handleTechnicianChange = useCallback((techId: string) => {
    setSelectedTechnician(techId);
    const tech = technicians.find(t => t.id === techId);
    if (tech?.vehicle_id) {
      setSelectedVehicle(tech.vehicle_id);
    } else {
      setSelectedVehicle('');
    }
  }, [technicians]);

  return {
    // Data
    loading,
    filteredReservations,
    unassignedReservations,
    stats,
    technicians,
    vehicles,
    deliveryTasksMap,

    // Filters
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,

    // Expanded row
    expandedRow,
    setExpandedRow,

    // Actions
    handleRejectReservation,
    handleAssignClick,

    // Assign modal
    showAssignModal,
    selectedReservation,
    selectedTechnician,
    selectedVehicle,
    setSelectedVehicle,
    assigning,
    handleAssign,
    handleCloseAssignModal,
    handleTechnicianChange,
  };
}
