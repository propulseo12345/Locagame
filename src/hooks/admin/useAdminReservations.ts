import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReservationsService, DeliveryService, TechniciansService } from '../../services';
import { Order } from '../../types';
import type {
  ReservationTechnician,
  ReservationVehicle,
  UnassignedReservation,
  ReservationStats,
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

  // Expanded row state
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [allRes, unassignedRes, techs, vehs] = await Promise.all([
        ReservationsService.getAllReservations(),
        ReservationsService.getUnassignedReservations(),
        TechniciansService.getAllTechnicians(),
        TechniciansService.getAllVehicles(),
      ]);
      setAllReservations(allRes);
      setUnassignedReservations(unassignedRes);
      setTechnicians(techs);
      setVehicles(vehs);
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

  const handleValidateReservation = useCallback(async (reservationId: string) => {
    if (!confirm('Valider cette demande de reservation ?')) return;
    try {
      await ReservationsService.updateReservationStatus(reservationId, 'confirmed');
      await loadData();
    } catch (error) {
      console.error('Error validating reservation:', error);
      alert('Erreur lors de la validation');
    }
  }, [loadData]);

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

  // Sync payment state
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSyncPayment = useCallback(async (reservationId: string) => {
    setSyncingId(reservationId);
    try {
      const result = await ReservationsService.syncPaymentWithStripe(reservationId);
      if (result.payment_confirmed) {
        await loadData();
      } else {
        alert(result.message || 'Aucun paiement confirme sur Stripe');
      }
    } catch (error) {
      console.error('Error syncing payment:', error);
      alert(error instanceof Error ? error.message : 'Erreur de synchronisation');
    } finally {
      setSyncingId(null);
    }
  }, [loadData]);

  // Auto-refresh quand il y a des pending_payment (toutes les 30s)
  const hasPendingPayments = useMemo(
    () => allReservations.some(r => r.status === 'pending_payment'),
    [allReservations]
  );

  useEffect(() => {
    if (!hasPendingPayments) return;
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [hasPendingPayments, loadData]);

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

    // Filters
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,

    // Expanded row
    expandedRow,
    setExpandedRow,

    // Actions
    handleValidateReservation,
    handleRejectReservation,
    handleAssignClick,

    // Sync payment
    handleSyncPayment,
    syncingId,

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
