import { Loader2 } from 'lucide-react';
import { useAdminPlanning } from '../../hooks/admin/useAdminPlanning';
import { usePlanningDragDrop } from '../../hooks/admin/usePlanningDragDrop';
import { usePlanningAssignment } from '../../hooks/admin/usePlanningAssignment';
import {
  PlanningHeader,
  PlanningMonthView,
  PlanningDayView,
  UnassignedReservations,
  VehicleSection,
} from '../../components/admin/planning';

export default function AdminPlanning() {
  const planning = useAdminPlanning();

  const dragDrop = usePlanningDragDrop({
    technicians: planning.technicians,
    selectedDate: planning.selectedDate,
    setOperationInProgress: planning.setOperationInProgress,
    refreshTasksAndReservations: planning.refreshTasksAndReservations,
    toast: planning.toast,
  });

  const assignment = usePlanningAssignment({
    setOperationInProgress: planning.setOperationInProgress,
    refreshTasksAndReservations: planning.refreshTasksAndReservations,
    toast: planning.toast,
  });

  if (planning.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#33ffcc]" />
        <span className="ml-3 text-gray-600">Chargement des livraisons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PlanningHeader
        viewMode={planning.viewMode}
        setViewMode={planning.setViewMode}
        selectedDate={planning.selectedDate}
        setSelectedDate={planning.setSelectedDate}
        assignFilter={planning.assignFilter}
        setAssignFilter={planning.setAssignFilter}
        currentMonth={planning.currentMonth}
        currentYear={planning.currentYear}
        navigateDate={planning.navigateDate}
        goToToday={planning.goToToday}
        navigateMonth={planning.navigateMonth}
        setShowVehicleModal={planning.setShowVehicleModal}
        setEditingVehicle={planning.setEditingVehicle}
        setVehicleFormData={planning.setVehicleFormData}
        setCurrentMonth={planning.setCurrentMonth}
        setCurrentYear={planning.setCurrentYear}
      />

      {/* Overlay loading pendant une operation */}
      {planning.operationInProgress && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center gap-3 pointer-events-auto">
            <Loader2 className="w-5 h-5 animate-spin text-[#33ffcc]" />
            <span className="text-gray-700 text-sm">Op\u00e9ration en cours...</span>
          </div>
        </div>
      )}

      {/* Vue Mois */}
      {planning.viewMode === 'month' && (
        <PlanningMonthView
          calendarDays={planning.calendarDays}
          selectedDate={planning.selectedDate}
          technicians={planning.technicians}
          setSelectedDate={planning.setSelectedDate}
          setViewMode={planning.setViewMode}
        />
      )}

      {/* Vue Jour - Reservations non assignees */}
      {planning.viewMode === 'day' && (
        <UnassignedReservations
          reservations={planning.unassignedReservations}
          technicians={planning.technicians}
          operationInProgress={planning.operationInProgress}
          onAssign={assignment.handleAssign}
          onDragStart={dragDrop.handleReservationDragStart}
          onDragEnd={dragDrop.handleReservationDragEnd}
        />
      )}

      {/* Vue Jour - Livraisons par livreur */}
      {planning.viewMode === 'day' && (
        <PlanningDayView
          selectedDate={planning.selectedDate}
          technicians={planning.technicians}
          vehicles={planning.vehicles}
          filteredTasks={planning.filteredTasks}
          tasksByTechnician={planning.tasksByTechnician}
          unassignedReservations={planning.unassignedReservations}
          operationInProgress={planning.operationInProgress}
          setOperationInProgress={planning.setOperationInProgress}
          refreshTasksAndReservations={planning.refreshTasksAndReservations}
          draggedReservation={dragDrop.draggedReservation}
          onDragOver={dragDrop.handleDragOver}
          onDragLeave={dragDrop.handleDragLeave}
          onDrop={dragDrop.handleDrop}
          onReservationDrop={dragDrop.handleReservationDrop}
          onTaskDragStart={dragDrop.handleDragStart}
          onTaskDragEnd={dragDrop.handleDragEnd}
          onUnassign={assignment.handleUnassign}
        />
      )}

      {/* Message si aucune intervention */}
      {planning.viewMode === 'day' &&
        planning.unassignedReservations.length === 0 &&
        planning.filteredTasks.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">
            Aucune intervention pour cette date
          </p>
        </div>
      )}

      <VehicleSection
        vehicles={planning.vehicles}
        setVehicles={planning.setVehicles}
        showMenu={planning.showMenu}
        setShowMenu={planning.setShowMenu}
        showVehicleModal={planning.showVehicleModal}
        setShowVehicleModal={planning.setShowVehicleModal}
        editingVehicle={planning.editingVehicle}
        setEditingVehicle={planning.setEditingVehicle}
        vehicleFormData={planning.vehicleFormData}
        setVehicleFormData={planning.setVehicleFormData}
        showDeleteConfirm={planning.showDeleteConfirm}
        setShowDeleteConfirm={planning.setShowDeleteConfirm}
      />
    </div>
  );
}
