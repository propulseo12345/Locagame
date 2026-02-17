import { Link } from 'react-router-dom';
import { DeliveryTask, Vehicle } from '../../../types';
import {
  MapPin,
  Truck,
  Phone,
  Navigation,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { getStatusConfig, getTypeConfig, getGoogleMapsUrl } from './taskConfigs';

interface TaskListViewProps {
  tasks: DeliveryTask[];
  vehicles: Vehicle[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function TaskListView({
  tasks,
  vehicles,
  hasActiveFilters,
  onClearFilters,
}: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Aucune intervention trouvee</p>
          <p className="text-sm text-gray-400 mt-1">
            {hasActiveFilters
              ? 'Essayez de modifier vos filtres'
              : "Vous n'avez aucune intervention planifiee"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reinitialiser les filtres
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {tasks.map((task) => {
          const typeConfig = getTypeConfig(task.type);
          const statusConfig = getStatusConfig(task.status);
          const TypeIcon = typeConfig.icon;
          const vehicle = vehicles.find((v) => v.id === task.vehicleId);

          return (
            <Link
              key={task.id}
              to={`/technician/tasks/${task.id}`}
              className="block p-4 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                {/* Type icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}
                >
                  <TypeIcon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(task.scheduledDate).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span className="text-lg font-bold text-[#33ffcc]">
                      {task.scheduledTime}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <p className="font-semibold text-gray-900 mb-1">
                    {task.customer.firstName} {task.customer.lastName}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">
                      {task.address.street}, {task.address.postalCode} {task.address.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {vehicle && (
                      <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>{vehicle.name}</span>
                      </div>
                    )}
                    <span>Commande: {task.orderNumber}</span>
                  </div>

                  {/* Produits */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {task.products.map((product, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600"
                      >
                        {product.productName} x{product.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#33ffcc] transition-colors" />
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${task.customer.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-gray-400 hover:text-[#33ffcc] hover:bg-[#33ffcc]/10 rounded-lg transition-colors"
                      title="Appeler"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={getGoogleMapsUrl(task.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-gray-400 hover:text-[#33ffcc] hover:bg-[#33ffcc]/10 rounded-lg transition-colors"
                      title="Itineraire"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
