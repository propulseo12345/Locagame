import { useParams, Link } from 'react-router-dom';
import { useReservationDetail } from '../../hooks/admin/useReservationDetail';
import { AdminPageSkeleton } from '../../components/ui/skeletons';
import {
  ReservationHeader,
  CustomerInfoCard,
  BillingCard,
  DeliveryInfoCard,
  EventDetailsCard,
  ReservationItemsList,
  ReservationSidebar,
} from '../../components/admin/reservationDetail';

export default function AdminReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const {
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
  } = useReservationDetail(id);

  if (loading) {
    return <AdminPageSkeleton type="detail" />;
  }

  if (error || !reservation) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Réservation introuvable</h3>
          <p className="text-gray-600 mb-4">{error || 'Cette reservation n\'existe pas'}</p>
          <Link
            to="/admin/reservations"
            className="inline-block px-6 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
          >
            Retour aux reservations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReservationHeader
        reservation={reservation}
        updating={updating}
        onStatusChange={handleStatusChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerInfoCard reservation={reservation} />
          <BillingCard reservation={reservation} />
          <DeliveryInfoCard reservation={reservation} deliveryTasks={deliveryTasks} />
          <EventDetailsCard reservation={reservation} />
          <ReservationItemsList
            reservation={reservation}
            deliveryTasks={deliveryTasks}
            technicians={technicians}
            selectedTechnician={selectedTechnician}
            updating={updating}
            onSelectTechnician={setSelectedTechnician}
            onAssignTechnician={handleAssignTechnician}
          />
        </div>

        {/* Sidebar */}
        <ReservationSidebar
          reservation={reservation}
          updating={updating}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
