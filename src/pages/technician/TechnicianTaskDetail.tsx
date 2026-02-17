import { useParams, Link } from 'react-router-dom';
import { useTaskDetail } from '../../hooks/technician/useTaskDetail';
import {
  TaskCustomerInfo,
  TaskRecipientInfo,
  TaskEventDetails,
  TaskAddressInfo,
  TaskProductsList,
  TaskAccessConstraints,
  TaskSidebar,
  getStatusColor,
  getStatusLabel,
  getTypeColor,
  getTypeLabel,
} from '../../components/technician/taskDetail';

export default function TechnicianTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    task,
    vehicle,
    technician,
    reservation,
    loading,
    error,
    handleStartTask,
    handleCompleteTask,
  } = useTaskDetail(id);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-[#33ffcc] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">{error || 'Intervention introuvable'}</p>
        <Link
          to="/technician/dashboard"
          className="text-[#33ffcc] hover:text-[#66cccc] font-semibold"
        >
          {"\u2190 Retour au planning"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-t\u00eate */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/technician/dashboard"
            className="text-[#33ffcc] hover:text-[#66cccc] font-semibold mb-2 inline-block"
          >
            {"\u2190 Retour au planning"}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {"D\u00e9tails de l'intervention"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-semibold rounded ${getTypeColor(task.type)}`}>
            {getTypeLabel(task.type)}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded border ${getStatusColor(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <TaskCustomerInfo customer={task.customer} orderNumber={task.orderNumber} />

          {reservation && <TaskRecipientInfo reservation={reservation} />}

          {reservation && <TaskEventDetails reservation={reservation} />}

          <TaskAddressInfo
            address={task.address}
            scheduledDate={task.scheduledDate}
            scheduledTime={task.scheduledTime}
          />

          <TaskProductsList products={task.products} />

          {task.accessConstraints && (
            <TaskAccessConstraints accessConstraints={task.accessConstraints} />
          )}

          {task.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-base text-gray-700">{task.notes}</p>
            </div>
          )}
        </div>

        {/* Colonne lat\u00e9rale */}
        <TaskSidebar
          task={task}
          vehicle={vehicle}
          technician={technician}
          onStartTask={handleStartTask}
          onCompleteTask={handleCompleteTask}
        />
      </div>
    </div>
  );
}
