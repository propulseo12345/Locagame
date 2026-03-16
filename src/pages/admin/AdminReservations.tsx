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
    allReservations,
    filteredReservations,
    unassignedReservations,
    stats,
    technicians,
    vehicles,
    deliveryTasksMap,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    deliveryModeFilter,
    setDeliveryModeFilter,
    technicianFilter,
    setTechnicianFilter,
    clearFilters,
    hasActiveFilters,
    expandedRow,
    setExpandedRow,
    handleRejectReservation,
    handleAssignClick,
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

  const handleStatsFilterClick = (status: string) => {
    setStatusFilter(status === statusFilter ? 'all' : status);
  };

  const handleViewUnassigned = () => {
    clearFilters();
    setStatusFilter('unassigned');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Réservations
            {!loading && (
              <span className="ml-2 text-lg font-normal text-gray-400">({allReservations.length})</span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">Gérez toutes les réservations</p>
        </div>
      </div>

      {/* Stats */}
      <ReservationStatsBar
        stats={stats}
        activeFilter={statusFilter}
        onFilterClick={handleStatsFilterClick}
      />

      {/* Unassigned alert banner */}
      <UnassignedReservationsTable
        count={unassignedReservations.length}
        onViewUnassigned={handleViewUnassigned}
      />

      {/* Filters */}
      <ReservationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        deliveryModeFilter={deliveryModeFilter}
        onDeliveryModeChange={setDeliveryModeFilter}
        technicianFilter={technicianFilter}
        onTechnicianChange={setTechnicianFilter}
        technicians={technicians}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        totalCount={allReservations.length}
        filteredCount={filteredReservations.length}
      />

      {/* Reservations Table */}
      <ReservationsTable
        reservations={filteredReservations}
        expandedRow={expandedRow}
        onToggleRow={setExpandedRow}
        onReject={handleRejectReservation}
        onAssignClick={handleAssignClick}
        deliveryTasksMap={deliveryTasksMap}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
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
