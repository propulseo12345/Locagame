import { DeliveryService } from '../../services';
import type { UnassignedReservation } from '../../components/admin/planning/planning.types';

interface UsePlanningAssignmentParams {
  setOperationInProgress: (op: string | null) => void;
  refreshTasksAndReservations: () => Promise<void>;
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
  };
}

export function usePlanningAssignment({
  setOperationInProgress,
  refreshTasksAndReservations,
  toast,
}: UsePlanningAssignmentParams) {
  // Assigner un livreur a une reservation via dropdown
  const handleAssign = async (
    reservation: UnassignedReservation,
    technicianId: string,
    vehicleId: string,
  ) => {
    const opKey = `assign-${reservation.id}`;
    setOperationInProgress(opKey);
    try {
      if (reservation.delivery_task_id) {
        await DeliveryService.assignTask(reservation.delivery_task_id, technicianId, vehicleId);
      } else {
        await DeliveryService.createDeliveryTask({
          reservationId: reservation.id,
          orderNumber: `ORD-${reservation.id.substring(0, 8)}`,
          type: 'delivery',
          scheduledDate: reservation.start_date,
          scheduledTime: reservation.delivery_time || '10:00',
          vehicleId: vehicleId,
          technicianId: technicianId,
          status: 'scheduled',
          customer: {
            firstName: reservation.customer?.first_name || '',
            lastName: reservation.customer?.last_name || '',
            phone: reservation.customer?.phone || '',
            email: reservation.customer?.email || '',
          },
          address: {
            street: reservation.delivery_address?.address_line1 || '',
            city: reservation.delivery_address?.city || '',
            postalCode: reservation.delivery_address?.postal_code || '',
            country: 'France',
          },
          products: (reservation.reservation_items || []).map(item => ({
            productId: item.product_id || '',
            productName: item.product?.name || 'Produit',
            quantity: item.quantity || 1,
          })),
        });
      }
      toast.success('Livreur assign\u00e9 avec succ\u00e8s');
      await refreshTasksAndReservations();
    } catch (err) {
      console.error('Erreur assignation:', err);
      toast.error("Erreur lors de l'assignation du livreur");
    } finally {
      setOperationInProgress(null);
    }
  };

  // Desassigner un technicien d'une tache
  const handleUnassign = async (taskId: string) => {
    setOperationInProgress(`unassign-${taskId}`);
    try {
      await DeliveryService.unassignTask(taskId);
      toast.success('T\u00e2che d\u00e9sassign\u00e9e');
      await refreshTasksAndReservations();
    } catch (err) {
      console.error('Erreur d\u00e9sassignation:', err);
      toast.error('Erreur lors de la d\u00e9sassignation');
    } finally {
      setOperationInProgress(null);
    }
  };

  return { handleAssign, handleUnassign };
}
