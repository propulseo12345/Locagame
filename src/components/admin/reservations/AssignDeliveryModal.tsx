import { X, User, Truck } from 'lucide-react';
import type { UnassignedReservation, ReservationTechnician, ReservationVehicle } from './types';

interface AssignDeliveryModalProps {
  reservation: UnassignedReservation;
  technicians: ReservationTechnician[];
  vehicles: ReservationVehicle[];
  selectedTechnician: string;
  selectedVehicle: string;
  assigning: boolean;
  onTechnicianChange: (techId: string) => void;
  onVehicleChange: (vehicleId: string) => void;
  onAssign: () => void;
  onClose: () => void;
}

export default function AssignDeliveryModal({
  reservation,
  technicians,
  vehicles,
  selectedTechnician,
  selectedVehicle,
  assigning,
  onTechnicianChange,
  onVehicleChange,
  onAssign,
  onClose,
}: AssignDeliveryModalProps) {
  const customer = reservation.customer as any;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Assigner une livraison</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Infos de la reservation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Details de la commande</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Client:</span>
                <div className="font-medium text-gray-900">
                  {customer?.first_name} {customer?.last_name}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Date livraison:</span>
                <div className="font-medium text-gray-900">
                  {new Date((reservation as any).start_date).toLocaleDateString('fr-FR')}
                  {(reservation as any).delivery_time && ` a ${(reservation as any).delivery_time}`}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Adresse:</span>
                <div className="font-medium text-gray-900">
                  {((reservation as any).delivery_address as any)?.address_line1 || 'Non specifiee'}
                </div>
              </div>
            </div>
          </div>

          {/* Selection technicien */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Technicien
            </label>
            <select
              value={selectedTechnician}
              onChange={(e) => onTechnicianChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            >
              <option value="">Selectionner un technicien...</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.first_name} {tech.last_name} {tech.vehicle_id ? '(Vehicule assigne)' : '(Sans vehicule)'}
                </option>
              ))}
            </select>
          </div>

          {/* Selection vehicule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Truck className="w-4 h-4 inline mr-2" />
              Vehicule
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => onVehicleChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
              disabled={!selectedTechnician}
            >
              <option value="">Selectionner un vehicule...</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} - {vehicle.license_plate} ({vehicle.type === 'truck' ? 'Camion' : 'Fourgon'})
                </option>
              ))}
            </select>
            {!selectedTechnician && (
              <p className="mt-1 text-xs text-gray-500">Selectionnez d'abord un technicien</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={assigning}
          >
            Annuler
          </button>
          <button
            onClick={onAssign}
            disabled={!selectedTechnician || !selectedVehicle || assigning}
            className="px-4 py-2 bg-[#33ffcc] hover:bg-[#66cccc] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {assigning ? 'Assignation...' : 'Assigner'}
          </button>
        </div>
      </div>
    </div>
  );
}
