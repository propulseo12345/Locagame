import { useState } from 'react';
import { DeliveryService } from '../../services';
import type { DeliveryTask } from '../../types';
import type { Technician } from '../../services/technicians.service';
import type { UnassignedReservation } from '../../components/admin/planning/planning.types';

interface UsePlanningDragDropParams {
  technicians: Technician[];
  selectedDate: string;
  setOperationInProgress: (op: string | null) => void;
  refreshTasksAndReservations: () => Promise<void>;
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
  };
}

export function usePlanningDragDrop({
  technicians,
  selectedDate,
  setOperationInProgress,
  refreshTasksAndReservations,
  toast,
}: UsePlanningDragDropParams) {
  const [draggedTask, setDraggedTask] = useState<DeliveryTask | null>(null);
  const [draggedReservation, setDraggedReservation] = useState<UnassignedReservation | null>(null);

  // Drag & drop - taches existantes
  const handleDragStart = (e: React.DragEvent, task: DeliveryTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', task.id);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget as HTMLElement;
    if (target && !target.classList.contains('drag-over')) {
      target.classList.add('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (target && relatedTarget && !target.contains(relatedTarget)) {
      target.classList.remove('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }
  };

  // Drop d'une tache existante vers un autre technicien (reassignation)
  const handleDrop = async (e: React.DragEvent, targetTechnicianId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }
    if (!draggedTask) return;
    if (draggedTask.technicianId === targetTechnicianId) return;

    const targetTechnician = technicians.find(t => t.id === targetTechnicianId);
    setOperationInProgress(`reassign-${draggedTask.id}`);
    try {
      await DeliveryService.assignTask(
        draggedTask.id,
        targetTechnicianId,
        targetTechnician?.vehicle_id || undefined
      );
      toast.success('T\u00e2che r\u00e9assign\u00e9e');
      await refreshTasksAndReservations();
    } catch (err) {
      console.error('Erreur r\u00e9assignation:', err);
      toast.error('Erreur lors de la r\u00e9assignation');
    } finally {
      setOperationInProgress(null);
      setDraggedTask(null);
    }
  };

  // Drag & drop pour les reservations non assignees
  const handleReservationDragStart = (e: React.DragEvent, reservation: UnassignedReservation) => {
    setDraggedReservation(reservation);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', reservation.id);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleReservationDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedReservation(null);
  };

  // Drop d'une reservation sur un technicien
  const handleReservationDrop = async (e: React.DragEvent, targetTechnicianId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove('drag-over', 'border-[#33ffcc]', 'bg-[#33ffcc]/10');
    }
    if (!draggedReservation) return;

    const targetTechnician = technicians.find(t => t.id === targetTechnicianId);
    setOperationInProgress(`create-${draggedReservation.id}`);
    try {
      if (draggedReservation.delivery_task_id) {
        await DeliveryService.assignTask(
          draggedReservation.delivery_task_id,
          targetTechnicianId,
          targetTechnician?.vehicle_id || undefined
        );
      } else {
        await DeliveryService.createDeliveryTask({
          reservationId: draggedReservation.id,
          orderNumber: `ORD-${draggedReservation.id.substring(0, 8)}`,
          type: 'delivery',
          scheduledDate: selectedDate,
          scheduledTime: draggedReservation.delivery_time || '10:00',
          vehicleId: targetTechnician?.vehicle_id || '',
          technicianId: targetTechnicianId,
          status: 'scheduled',
          customer: {
            firstName: draggedReservation.customer?.first_name || '',
            lastName: draggedReservation.customer?.last_name || '',
            phone: draggedReservation.customer?.phone || '',
            email: draggedReservation.customer?.email || '',
          },
          address: {
            street: draggedReservation.delivery_address?.address_line1 || '',
            city: draggedReservation.delivery_address?.city || '',
            postalCode: draggedReservation.delivery_address?.postal_code || '',
            country: 'France',
          },
          products: (draggedReservation.reservation_items || []).map(item => ({
            productId: item.product_id || '',
            productName: item.product?.name || 'Produit',
            quantity: item.quantity || 1,
          })),
        });
      }
      toast.success('Intervention assign\u00e9e avec succ\u00e8s');
      await refreshTasksAndReservations();
    } catch (err) {
      console.error('Erreur assignation par drag:', err);
      toast.error("Erreur lors de l'assignation");
    } finally {
      setOperationInProgress(null);
      setDraggedReservation(null);
    }
  };

  return {
    draggedTask,
    draggedReservation,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleReservationDragStart,
    handleReservationDragEnd,
    handleReservationDrop,
  };
}
