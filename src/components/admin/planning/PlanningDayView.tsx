import type { DeliveryTask } from '../../../types';
import type { Technician, Vehicle } from '../../../services/technicians.service';
import type { UnassignedReservation } from './planning.types';
import { getTypeLabel } from './planning.types';
import { DeliveryService } from '../../../services';
import { useToast } from '../../../contexts/ToastContext';
import TechnicianColumn from './TechnicianColumn';

interface PlanningDayViewProps {
  selectedDate: string;
  technicians: Technician[];
  vehicles: Vehicle[];
  filteredTasks: DeliveryTask[];
  tasksByTechnician: Record<string, DeliveryTask[]>;
  unassignedReservations: UnassignedReservation[];
  operationInProgress: string | null;
  setOperationInProgress: (op: string | null) => void;
  refreshTasksAndReservations: () => Promise<void>;
  draggedReservation: UnassignedReservation | null;
  // Drag handlers
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, techId: string) => void;
  onReservationDrop: (e: React.DragEvent, techId: string) => void;
  onTaskDragStart: (e: React.DragEvent, task: DeliveryTask) => void;
  onTaskDragEnd: (e: React.DragEvent) => void;
  onUnassign: (taskId: string) => void;
}

export default function PlanningDayView({
  selectedDate,
  technicians,
  vehicles,
  filteredTasks,
  tasksByTechnician,
  operationInProgress,
  setOperationInProgress,
  refreshTasksAndReservations,
  draggedReservation,
  onDragOver,
  onDragLeave,
  onDrop,
  onReservationDrop,
  onTaskDragStart,
  onTaskDragEnd,
  onUnassign,
}: PlanningDayViewProps) {
  const toast = useToast();
  const unassignedTasks = tasksByTechnician['__unassigned__'] || [];

  // Inline handler for assigning unassigned tasks via select
  const handleAssignUnassignedTask = async (
    taskId: string,
    techId: string,
    vehicleId: string | undefined,
  ) => {
    setOperationInProgress(`assign-task-${taskId}`);
    try {
      await DeliveryService.assignTask(taskId, techId, vehicleId);
      toast.success('T\u00e2che assign\u00e9e');
      await refreshTasksAndReservations();
    } catch (err) {
      console.error('Erreur assignation:', err);
      toast.error("Erreur lors de l'assignation");
    } finally {
      setOperationInProgress(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Livraisons du {new Date(selectedDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        {filteredTasks.length > 0 && (
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''})
          </span>
        )}
      </h2>

      {/* Taches non assignees */}
      {unassignedTasks.length > 0 && (
        <div className="mb-6 border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50">
          <h3 className="font-bold text-orange-800 text-base mb-3">
            Non assignées ({unassignedTasks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unassignedTasks.map(task => (
              <div key={task.id} className="p-3 bg-white border border-orange-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    task.type === 'delivery'
                      ? 'bg-[#33ffcc] text-[#000033]'
                      : 'bg-orange-500 text-white'
                  }`}>
                    {getTypeLabel(task.type)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {task.scheduledTime}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {task.customer.firstName} {task.customer.lastName}
                </p>
                {task.address.street && (
                  <p className="text-xs text-gray-600 mt-1">
                    {task.address.street}, {task.address.postalCode} {task.address.city}
                  </p>
                )}
                <div className="mt-3">
                  <select
                    disabled={!!operationInProgress}
                    onChange={async (e) => {
                      const [techId, vehId] = e.target.value.split('|');
                      if (techId) {
                        await handleAssignUnassignedTask(task.id, techId, vehId || undefined);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] bg-white disabled:opacity-50"
                    defaultValue=""
                  >
                    <option value="">Assigner un livreur...</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={`${tech.id}|${tech.vehicle_id || ''}`}>
                        {tech.first_name} {tech.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {technicians.map(technicianItem => {
          const vehicle = technicianItem.vehicle_id
            ? vehicles.find(v => v.id === technicianItem.vehicle_id) ?? null
            : null;
          const tasks = tasksByTechnician[technicianItem.id] || [];

          return (
            <TechnicianColumn
              key={technicianItem.id}
              technician={technicianItem}
              vehicle={vehicle}
              tasks={tasks}
              operationInProgress={operationInProgress}
              draggedReservation={draggedReservation}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onReservationDrop={onReservationDrop}
              onTaskDragStart={onTaskDragStart}
              onTaskDragEnd={onTaskDragEnd}
              onUnassign={onUnassign}
            />
          );
        })}
      </div>
    </div>
  );
}
