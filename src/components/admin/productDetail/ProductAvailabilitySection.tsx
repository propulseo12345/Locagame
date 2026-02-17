import { Calendar, Plus, Trash2, AlertTriangle, X } from 'lucide-react';
import { ProductFormData, NewAvailability, INITIAL_AVAILABILITY } from './types';

interface Props {
  formData: ProductFormData;
  availabilities: any[];
  showAvailabilityModal: boolean;
  setShowAvailabilityModal: (show: boolean) => void;
  newAvailability: NewAvailability;
  setNewAvailability: (availability: NewAvailability) => void;
  onAddAvailability: () => void;
  onDeleteAvailability: (id: string) => void;
}

export default function ProductAvailabilitySection({
  formData,
  availabilities,
  showAvailabilityModal,
  setShowAvailabilityModal,
  newAvailability,
  setNewAvailability,
  onAddAvailability,
  onDeleteAvailability,
}: Props) {
  const closeModal = () => {
    setShowAvailabilityModal(false);
    setNewAvailability(INITIAL_AVAILABILITY);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Disponibilite manuelle
          </h2>
          <button
            type="button"
            onClick={() => setShowAvailabilityModal(true)}
            className="px-4 py-2 bg-[#33ffcc] hover:bg-[#66cccc] text-white rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Bloquer des periodes ou marquer en maintenance pour empecher les reservations
        </p>

        {availabilities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Aucune disponibilite manuelle configuree</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilities.map((availability) => (
              <div
                key={availability.id}
                className={`p-4 rounded-lg border-2 ${
                  availability.status === 'maintenance'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${
                        availability.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        availability.status === 'maintenance' ? 'text-yellow-800' : 'text-red-800'
                      }`}>
                        {availability.status === 'maintenance' ? 'Maintenance' : 'Bloque'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p>
                        <strong>Du:</strong> {new Date(availability.start_date).toLocaleDateString('fr-FR')}
                      </p>
                      <p>
                        <strong>Au:</strong> {new Date(availability.end_date).toLocaleDateString('fr-FR')}
                      </p>
                      <p>
                        <strong>Quantite:</strong> {availability.quantity} unite(s)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteAvailability(availability.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout de disponibilite */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Ajouter une disponibilite</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newAvailability.status}
                  onChange={(e) => setNewAvailability({
                    ...newAvailability,
                    status: e.target.value as 'maintenance' | 'blocked'
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                >
                  <option value="blocked">Bloque</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de debut *</label>
                <input
                  type="date"
                  value={newAvailability.start_date}
                  onChange={(e) => setNewAvailability({ ...newAvailability, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin *</label>
                <input
                  type="date"
                  value={newAvailability.end_date}
                  onChange={(e) => setNewAvailability({ ...newAvailability, end_date: e.target.value })}
                  min={newAvailability.start_date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantite bloquee</label>
                <input
                  type="number"
                  min="1"
                  max={formData.total_stock}
                  value={newAvailability.quantity}
                  onChange={(e) => setNewAvailability({
                    ...newAvailability,
                    quantity: parseInt(e.target.value) || 1
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nombre d'unites a bloquer (max: {formData.total_stock})
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={onAddAvailability}
                className="px-4 py-2 bg-[#33ffcc] hover:bg-[#66cccc] text-white rounded-lg font-medium"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
