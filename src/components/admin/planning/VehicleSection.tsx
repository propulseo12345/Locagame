import { X, Trash2, Edit2, MoreVertical } from 'lucide-react';
import type { Vehicle } from '../../../services/technicians.service';
import type { VehicleFormData } from './planning.types';
import DeleteConfirmModal from '../products/DeleteConfirmModal';

interface VehicleSectionProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  showMenu: string | null;
  setShowMenu: (id: string | null) => void;
  showVehicleModal: boolean;
  setShowVehicleModal: (show: boolean) => void;
  editingVehicle: Vehicle | null;
  setEditingVehicle: (vehicle: Vehicle | null) => void;
  vehicleFormData: VehicleFormData;
  setVehicleFormData: (data: VehicleFormData) => void;
  showDeleteConfirm: string | null;
  setShowDeleteConfirm: (id: string | null) => void;
}

export default function VehicleSection(props: VehicleSectionProps) {
  const {
    vehicles, setVehicles, showMenu, setShowMenu, showVehicleModal,
    setShowVehicleModal, editingVehicle, setEditingVehicle,
    vehicleFormData, setVehicleFormData, showDeleteConfirm, setShowDeleteConfirm,
  } = props;

  const closeModal = () => { setShowVehicleModal(false); setEditingVehicle(null); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      setVehicles(prev => prev.map(v =>
        v.id === editingVehicle.id
          ? {
              ...v,
              name: vehicleFormData.name,
              type: vehicleFormData.type as 'truck' | 'van',
              capacity: parseFloat(vehicleFormData.capacity),
              license_plate: vehicleFormData.licensePlate,
              is_active: vehicleFormData.isActive,
            }
          : v
      ));
    } else {
      const newVehicle: Vehicle = {
        id: `veh_${Date.now()}`,
        name: vehicleFormData.name,
        type: vehicleFormData.type as 'truck' | 'van',
        capacity: parseFloat(vehicleFormData.capacity),
        license_plate: vehicleFormData.licensePlate,
        is_active: vehicleFormData.isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setVehicles(prev => [...prev, newVehicle]);
    }
    closeModal();
  };

  return (
    <>
      {/* Section Gestion des camions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Gestion des camions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 relative">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                  <p className="text-sm text-gray-600">{vehicle.license_plate}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      vehicle.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vehicle.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {vehicle.type === 'truck' ? 'Camion' : 'Utilitaire'} - {vehicle.capacity} m³
                    </span>
                  </div>
                </div>
                <div className="relative menu-container">
                  <button
                    onClick={() => setShowMenu(showMenu === vehicle.id ? null : vehicle.id)}
                    className="text-gray-600 hover:text-gray-900 p-1"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMenu === vehicle.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          setEditingVehicle(vehicle);
                          setVehicleFormData({
                            name: vehicle.name,
                            type: vehicle.type,
                            capacity: vehicle.capacity.toString(),
                            licensePlate: vehicle.license_plate,
                            isActive: vehicle.is_active,
                          });
                          setShowVehicleModal(true);
                          setShowMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(vehicle.id);
                          setShowMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modale Ajouter/Modifier Camion */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingVehicle ? 'Modifier le camion' : 'Nouveau camion'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  required
                  value={vehicleFormData.name}
                  onChange={(e) => setVehicleFormData({...vehicleFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    required
                    value={vehicleFormData.type}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  >
                    <option value="truck">Camion</option>
                    <option value="van">Utilitaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacité (m³) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={vehicleFormData.capacity}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, capacity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plaque d'immatriculation *</label>
                <input
                  type="text"
                  required
                  value={vehicleFormData.licensePlate}
                  onChange={(e) => setVehicleFormData({...vehicleFormData, licensePlate: e.target.value})}
                  placeholder="AB-123-CD"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveVehicle"
                  checked={vehicleFormData.isActive}
                  onChange={(e) => setVehicleFormData({...vehicleFormData, isActive: e.target.checked})}
                  className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
                />
                <label htmlFor="isActiveVehicle" className="text-sm font-medium text-gray-700">
                  Véhicule actif
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
                >
                  {editingVehicle ? 'Enregistrer' : 'Cr\u00e9er'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer ce camion ? Cette action est irréversible."
          onConfirm={() => {
            setVehicles(prev => prev.filter(v => v.id !== showDeleteConfirm));
            setShowDeleteConfirm(null);
          }}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </>
  );
}
