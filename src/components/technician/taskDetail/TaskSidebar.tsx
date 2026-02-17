import { DeliveryTask, Vehicle } from '../../../types';
import { Technician } from '../../../services/technicians.service';

interface TaskSidebarProps {
  task: DeliveryTask;
  vehicle: Vehicle | null;
  technician: Technician | null;
  onStartTask: () => Promise<void>;
  onCompleteTask: () => Promise<void>;
}

export function TaskSidebar({
  task,
  vehicle,
  technician,
  onStartTask,
  onCompleteTask,
}: TaskSidebarProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${task.address.street}, ${task.address.postalCode} ${task.address.city}`
  )}`;

  return (
    <div className="space-y-6">
      {/* Informations vehicule et technicien */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{"\u00c9quipe"}</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">{"V\u00e9hicule"}</p>
            <p className="text-base font-semibold text-gray-900">
              {vehicle?.name || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              {vehicle?.licensePlate || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Technicien</p>
            <p className="text-base font-semibold text-gray-900">
              {technician?.first_name} {technician?.last_name}
            </p>
            <p className="text-sm text-gray-600">
              {technician?.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="space-y-3">
          {task.status === 'scheduled' && (
            <button
              onClick={onStartTask}
              className="w-full px-4 py-3 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
            >
              {"D\u00e9marrer l'intervention"}
            </button>
          )}
          {task.status === 'in_progress' && (
            <button
              onClick={onCompleteTask}
              className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              {"Terminer l'intervention"}
            </button>
          )}
          <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
            {"Signaler un probl\u00e8me"}
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Ouvrir dans Maps
          </a>
        </div>
      </div>

      {/* Timeline */}
      {(task.startedAt || task.completedAt) && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">{"Planifi\u00e9"}</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(task.scheduledDate).toLocaleDateString('fr-FR')} {"\u00e0 "}{task.scheduledTime}
              </p>
            </div>
            {task.startedAt && (
              <div>
                <p className="text-sm text-gray-600">{"D\u00e9marr\u00e9"}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(task.startedAt).toLocaleString('fr-FR')}
                </p>
              </div>
            )}
            {task.completedAt && (
              <div>
                <p className="text-sm text-gray-600">{"Termin\u00e9"}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(task.completedAt).toLocaleString('fr-FR')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
