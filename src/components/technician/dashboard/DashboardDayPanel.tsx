import { Link } from 'react-router-dom';
import {
  Calendar,
  Truck,
  MapPin,
  Phone,
  User,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import type { DeliveryTask, Vehicle } from '../../../types';
import { getStatusConfig, getTypeConfig, getGoogleMapsUrl } from './technicianDashboard.utils';

interface DashboardDayPanelProps {
  selectedDate: string;
  tasksForSelectedDate: DeliveryTask[];
  vehicles: Vehicle[];
}

export default function DashboardDayPanel({
  selectedDate,
  tasksForSelectedDate,
  vehicles,
}: DashboardDayPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[700px]">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="font-bold text-gray-900 capitalize">
          {new Date(selectedDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {tasksForSelectedDate.length} intervention{tasksForSelectedDate.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tasksForSelectedDate.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Calendar className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">Aucune intervention</p>
            <p className="text-sm">Profitez de votre journée !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasksForSelectedDate.map((task, idx) => {
              const typeConfig = getTypeConfig(task.type);
              const statusConfig = getStatusConfig(task.status);
              const TypeIcon = typeConfig.icon;
              const vehicle = vehicles.find((v) => v.id === task.vehicleId);

              return (
                <div key={task.id} className="relative group">
                  {/* Timeline connector */}
                  {idx < tasksForSelectedDate.length - 1 && (
                    <div
                      className="absolute left-[19px] top-[52px] bottom-[-12px] w-0.5 bg-gray-200"
                      style={{ height: 'calc(100% - 40px)' }}
                    />
                  )}

                  <div className="flex gap-3">
                    {/* Timeline dot */}
                    <div
                      className={`
                        relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        ${typeConfig.color}
                      `}
                    >
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    {/* Card content */}
                    <Link
                      to={`/technician/tasks/${task.id}`}
                      className="flex-1 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#000033]">
                            {task.scheduledTime}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#33ffcc] transition-colors" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {task.customer.firstName} {task.customer.lastName}
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 line-clamp-1">
                            {task.address.street}, {task.address.city}
                          </span>
                        </div>

                        {vehicle && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Truck className="w-3 h-3" />
                            <span>{vehicle.name}</span>
                          </div>
                        )}

                        {/* Products */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.products.slice(0, 2).map((product, pidx) => (
                            <span
                              key={pidx}
                              className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-600"
                            >
                              {product.productName} x{product.quantity}
                            </span>
                          ))}
                          {task.products.length > 2 && (
                            <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                              +{task.products.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                        <a
                          href={`tel:${task.customer.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#33ffcc] transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Appeler</span>
                        </a>
                        <span className="text-gray-300">|</span>
                        <a
                          href={getGoogleMapsUrl(task.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#33ffcc] transition-colors"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Itinéraire</span>
                        </a>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with link to all tasks */}
      {tasksForSelectedDate.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Link
            to={`/technician/tasks?date=${selectedDate}`}
            className="block w-full py-2.5 bg-[#000033] text-white text-center rounded-lg font-medium hover:bg-[#000044] transition-colors"
          >
            Voir toutes les interventions
          </Link>
        </div>
      )}
    </div>
  );
}
