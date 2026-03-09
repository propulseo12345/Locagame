import { Pencil, Trash2 } from 'lucide-react';
import type { Technician, Vehicle } from '../../../services/technicians.service';

interface TechniciansTableProps {
  technicians: Technician[];
  vehicleMap: Map<string, Vehicle>;
  onEdit: (tech: Technician) => void;
  onDelete: (tech: Technician) => void;
}

export default function TechniciansTable({
  technicians,
  vehicleMap,
  onEdit,
  onDelete,
}: TechniciansTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Véhicule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {technicians.map((tech) => {
              const vehicle = tech.vehicle_id ? vehicleMap.get(tech.vehicle_id) : null;
              return (
                <tr key={tech.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {tech.first_name} {tech.last_name}
                    </div>
                    {tech.phone && (
                      <div className="text-xs text-gray-500">{tech.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{tech.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {vehicle ? (
                      <div className="text-sm text-gray-900">
                        {vehicle.name}
                        <span className="text-xs text-gray-500 ml-1">
                          ({vehicle.type === 'truck' ? 'Camion' : 'Fourgon'})
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Aucun</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                        tech.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tech.is_active ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      {tech.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(tech)}
                        className="p-1.5 text-gray-500 hover:text-[#000033] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tech)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {technicians.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun technicien trouvé
        </div>
      )}
    </div>
  );
}
