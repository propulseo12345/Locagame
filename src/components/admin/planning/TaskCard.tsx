import type { DeliveryTask } from '../../../types';
import { getTypeLabel, getStatusColor, getStatusLabel } from './planning.types';

interface TaskCardProps {
  task: DeliveryTask;
  operationInProgress: string | null;
  onDragStart: (e: React.DragEvent, task: DeliveryTask) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onUnassign: (taskId: string) => void;
}

export default function TaskCard({
  task,
  operationInProgress,
  onDragStart,
  onDragEnd,
  onUnassign,
}: TaskCardProps) {
  const isTaskBusy = operationInProgress?.includes(task.id);

  return (
    <div
      className={`p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-move hover:shadow-md transition-all duration-200 ${
        isTaskBusy ? 'opacity-50 pointer-events-none' : ''
      }`}
      draggable={!operationInProgress}
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
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
            <>
              <p className="text-xs text-gray-600 mt-1">
                {task.address.street}
              </p>
              <p className="text-xs text-gray-600">
                {task.address.postalCode} {task.address.city}
              </p>
            </>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {task.orderNumber}
          </p>
          {task.products.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.products.slice(0, 2).map((product, idx) => (
                <span key={idx} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {product.productName}
                </span>
              ))}
              {task.products.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{task.products.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => onUnassign(task.id)}
          disabled={!!operationInProgress}
          className="text-red-600 hover:text-red-800 text-sm ml-2 disabled:opacity-50"
          title="Désassigner"
        >
          &#x2715;
        </button>
      </div>
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
        {getStatusLabel(task.status)}
      </span>
    </div>
  );
}
