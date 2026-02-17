import React from 'react';
import { Package, Truck, Calendar } from 'lucide-react';
import { Order } from '../../../types';
import { TaskTypeBadge } from './reservationBadges';

interface ReservationItemsListProps {
  reservation: Order;
  deliveryTasks: any[];
  technicians: any[];
  selectedTechnician: string;
  updating: boolean;
  onSelectTechnician: (value: string) => void;
  onAssignTechnician: (taskId: string) => Promise<void>;
}

export default function ReservationItemsList({
  reservation,
  deliveryTasks,
  technicians,
  selectedTechnician,
  updating,
  onSelectTechnician,
  onAssignTechnician,
}: ReservationItemsListProps) {
  return (
    <>
      {/* Produits reserves */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#33ffcc]" />
          Produits reserves
        </h2>
        <div className="space-y-3">
          {(reservation.reservation_items || []).map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.product?.name || 'Produit'}</h3>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                  <span>Quantite: <strong>{item.quantity}</strong></span>
                  <span>Duree: <strong>{item.duration_days || 1} jour(s)</strong></span>
                  <span>Prix unitaire: <strong>{item.unit_price}€</strong></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{item.subtotal}€</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Taches de livraison */}
      {deliveryTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-500" />
            Taches de livraison
          </h2>
          <div className="space-y-4">
            {deliveryTasks.map((task: any) => (
              <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TaskTypeBadge type={task.type} />
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'completed' ? 'Terminee' :
                         task.status === 'in_progress' ? 'En cours' :
                         'Planifiee'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(task.scheduled_date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                        {task.scheduled_time && ` a ${task.scheduled_time}`}
                      </div>
                    </div>
                    {task.technician && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Technicien: </span>
                        <span className="font-medium text-gray-900">{task.technician.name}</span>
                      </div>
                    )}
                  </div>

                  {!task.technician_id && (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTechnician}
                        onChange={(e) => onSelectTechnician(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="">Assigner...</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.id}>{tech.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => onAssignTechnician(task.id)}
                        disabled={!selectedTechnician || updating}
                        className="px-3 py-2 bg-[#33ffcc] text-[#000033] text-sm font-medium rounded-lg hover:bg-[#66cccc] disabled:opacity-50"
                      >
                        Assigner
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
