import type { Technician } from '../../../services/technicians.service';
import type { UnassignedReservation } from './planning.types';

interface UnassignedReservationsProps {
  reservations: UnassignedReservation[];
  technicians: Technician[];
  operationInProgress: string | null;
  onAssign: (reservation: UnassignedReservation, technicianId: string, vehicleId: string) => void;
  onDragStart: (e: React.DragEvent, reservation: UnassignedReservation) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export default function UnassignedReservations({
  reservations,
  technicians,
  operationInProgress,
  onAssign,
  onDragStart,
  onDragEnd,
}: UnassignedReservationsProps) {
  if (reservations.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Interventions / Livraisons a faire ({reservations.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reservations.map(reservation => (
          <div
            key={reservation.id}
            className={`p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 cursor-move hover:border-orange-400 hover:bg-orange-100 transition-all duration-200 ${
              operationInProgress?.includes(reservation.id) ? 'opacity-50 pointer-events-none' : ''
            }`}
            draggable={!operationInProgress}
            onDragStart={(e) => onDragStart(e, reservation)}
            onDragEnd={onDragEnd}
          >
            <div className="mb-3">
              <p className="font-semibold text-gray-900 text-sm">
                ORD-{reservation.id.substring(0, 8)}
              </p>
              <p className="text-sm text-gray-700 font-medium mt-1">
                {reservation.customer?.first_name} {reservation.customer?.last_name}
              </p>
              {reservation.delivery_address && (
                <>
                  <p className="text-xs text-gray-600 mt-1">
                    {reservation.delivery_address.address_line1}
                  </p>
                  <p className="text-xs text-gray-600">
                    {reservation.delivery_address.postal_code} {reservation.delivery_address.city}
                  </p>
                </>
              )}
              <div className="mt-2 flex items-center gap-2">
                {reservation.delivery_time && (
                  <span className="text-xs font-semibold text-gray-700">
                    {reservation.delivery_time}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {reservation.reservation_items?.length || 0} produit(s)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Assigner a un livreur:
              </label>
              <select
                disabled={!!operationInProgress}
                onChange={(e) => {
                  const [technicianId, vehicleId] = e.target.value.split('|');
                  if (technicianId) {
                    onAssign(reservation, technicianId, vehicleId || '');
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc] bg-white disabled:opacity-50"
                defaultValue=""
              >
                <option value="">Choisir un livreur...</option>
                {technicians.map(tech => (
                  <option
                    key={tech.id}
                    value={`${tech.id}|${tech.vehicle_id || ''}`}
                  >
                    {tech.first_name} {tech.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
