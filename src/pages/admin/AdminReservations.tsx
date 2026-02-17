import { useAdminReservations } from '../../hooks/admin/useAdminReservations';
import {
  ReservationStatsBar,
  ReservationFilters,
  UnassignedReservationsTable,
  ReservationsTable,
  AssignDeliveryModal,
} from '../../components/admin/reservations';

export default function AdminReservations() {
  const {
    loading,
    filteredReservations,
    unassignedReservations,
    stats,
    technicians,
    vehicles,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    expandedRow,
    setExpandedRow,
    handleValidateReservation,
    handleRejectReservation,
    handleAssignClick,
    handleSyncPayment,
    syncingId,
    showAssignModal,
    selectedReservation,
    selectedTechnician,
    selectedVehicle,
    setSelectedVehicle,
    assigning,
    handleAssign,
    handleCloseAssignModal,
    handleTechnicianChange,
  } = useAdminReservations();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600 mt-1">Gerez toutes les reservations</p>
        </div>
      </div>

      {/* Stats */}
      <ReservationStatsBar stats={stats} />

      {/* Unassigned reservations */}
      <UnassignedReservationsTable
        reservations={unassignedReservations}
        onAssignClick={handleAssignClick}
      />

      {/* Filters */}
      <ReservationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Reservations Table */}
      <ReservationsTable
        reservations={filteredReservations}
        expandedRow={expandedRow}
        onToggleRow={setExpandedRow}
        onValidate={handleValidateReservation}
        onReject={handleRejectReservation}
        onSyncPayment={handleSyncPayment}
        syncingId={syncingId}
      />

      {/* Assign Modal */}
      {showAssignModal && selectedReservation && (
        <AssignDeliveryModal
          reservation={selectedReservation}
          technicians={technicians}
          vehicles={vehicles}
          selectedTechnician={selectedTechnician}
          selectedVehicle={selectedVehicle}
          assigning={assigning}
          onTechnicianChange={handleTechnicianChange}
          onVehicleChange={setSelectedVehicle}
          onAssign={handleAssign}
          onClose={handleCloseAssignModal}
        />
      )}
    </div>
  );
}
