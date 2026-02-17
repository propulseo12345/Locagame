import type { DeliveryTask } from '../../../types';
import type { Technician, Vehicle } from '../../../services/technicians.service';
import type { UnassignedReservation } from './planning.types';
import TaskCard from './TaskCard';

interface TechnicianColumnProps {
  technician: Technician;
  vehicle: Vehicle | null;
  tasks: DeliveryTask[];
  operationInProgress: string | null;
  draggedReservation: UnassignedReservation | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, technicianId: string) => void;
  onReservationDrop: (e: React.DragEvent, technicianId: string) => void;
  onTaskDragStart: (e: React.DragEvent, task: DeliveryTask) => void;
  onTaskDragEnd: (e: React.DragEvent) => void;
  onUnassign: (taskId: string) => void;
}

export default function TechnicianColumn({
  technician,
  vehicle,
  tasks,
  operationInProgress,
  draggedReservation,
  onDragOver,
  onDragLeave,
  onDrop,
  onReservationDrop,
  onTaskDragStart,
  onTaskDragEnd,
  onUnassign,
}: TechnicianColumnProps) {
  return (
    <div
      className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[500px] transition-all duration-200"
      onDragOver={(e) => {
        onDragOver(e);
        if (draggedReservation) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        if (draggedReservation) {
          onReservationDrop(e, technician.id);
        } else {
          onDrop(e, technician.id);
        }
      }}
    >
      {/* En-tete livreur */}
      <div className="mb-4 pb-3 border-b border-gray-300">
        <h3 className="font-bold text-gray-900 text-base">
          {technician.first_name} {technician.last_name}
        </h3>
        {vehicle && (
          <p className="text-xs text-gray-600 mt-1">
            {vehicle.name} - {vehicle.license_plate}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {tasks.length} intervention(s)
        </p>
      </div>

      {/* Interventions assignees */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
            Déposez une intervention ici
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              operationInProgress={operationInProgress}
              onDragStart={onTaskDragStart}
              onDragEnd={onTaskDragEnd}
              onUnassign={onUnassign}
            />
          ))
        )}
      </div>
    </div>
  );
}
