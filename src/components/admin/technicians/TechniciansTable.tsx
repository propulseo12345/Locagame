import { Pencil, Trash2, Users } from 'lucide-react';
import type { Technician, Vehicle } from '../../../services/technicians.service';
import { TableRowSkeleton } from '../../ui/skeletons';

interface TechniciansTableProps {
  technicians: Technician[];
  vehicleMap: Map<string, Vehicle>;
  onEdit: (tech: Technician) => void;
  onDelete: (tech: Technician) => void;
  loading?: boolean;
}

export default function TechniciansTable({
  technicians,
  vehicleMap,
  onEdit,
  onDelete,
  loading = false,
}: TechniciansTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Liste des techniciens">
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
              <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Véhicule</th>
              <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              <th scope="col" className="px-6 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowSkeleton columns={5} rows={6} />
            ) : technicians.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">Aucun technicien trouvé</p>
                </td>
              </tr>
            ) : (
              technicians.map((tech, idx) => {
                const vehicle = tech.vehicle_id ? vehicleMap.get(tech.vehicle_id) : null;
                return (
                  <tr
                    key={tech.id}
                    className={`border-l-4 ${tech.is_active ? 'border-l-green-400' : 'border-l-gray-300'} ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-gray-100/60 transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {tech.first_name} {tech.last_name}
                      </div>
                      {tech.phone && (
                        <div className="text-xs text-gray-400">{tech.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{tech.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {vehicle ? (
                        <div className="text-sm text-gray-900">
                          {vehicle.name}
                          <span className="text-xs text-gray-400 ml-1">
                            ({vehicle.type === 'truck' ? 'Camion' : 'Fourgon'})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Aucun</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${
                        tech.is_active
                          ? 'ring-1 ring-green-200 bg-green-50 text-green-700'
                          : 'ring-1 ring-red-200 bg-red-50 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tech.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        {tech.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(tech)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(tech)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
