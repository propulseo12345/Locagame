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
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Disponibilite manuelle</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAvailabilityModal(true)}
            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Bloquer des periodes ou marquer en maintenance pour empecher les reservations.
        </p>

        {availabilities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune disponibilite manuelle configuree</p>
          </div>
        ) : (
          <div className="space-y-2">
            {availabilities.map((availability) => (
              <div
                key={availability.id}
                className={`p-3 rounded-lg border ${
                  availability.status === 'maintenance'
                    ? 'bg-yellow-50/50 border-yellow-200'
                    : 'bg-red-50/50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
                      availability.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                    <div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-md ring-1 ${
                        availability.status === 'maintenance'
                          ? 'bg-yellow-50 text-yellow-700 ring-yellow-200'
                          : 'bg-red-50 text-red-700 ring-red-200'
                      }`}>
                        {availability.status === 'maintenance' ? 'Maintenance' : 'Bloque'}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(availability.start_date + 'T00:00:00').toLocaleDateString('fr-FR')}
                        {' → '}
                        {new Date(availability.end_date + 'T00:00:00').toLocaleDateString('fr-FR')}
                        <span className="text-gray-400 ml-2">({availability.quantity} unite(s))</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteAvailability(availability.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Ajouter une disponibilite</h2>
                <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                <select
                  value={newAvailability.status}
                  onChange={(e) => setNewAvailability({
                    ...newAvailability,
                    status: e.target.value as 'maintenance' | 'blocked'
                  })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
                >
                  <option value="blocked">Bloque</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date debut <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newAvailability.start_date}
                    onChange={(e) => setNewAvailability({ ...newAvailability, start_date: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newAvailability.end_date}
                    onChange={(e) => setNewAvailability({ ...newAvailability, end_date: e.target.value })}
                    min={newAvailability.start_date}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantite bloquee</label>
                <input
                  type="number"
                  min="1"
                  max={formData.total_stock}
                  value={newAvailability.quantity}
                  onChange={(e) => setNewAvailability({
                    ...newAvailability,
                    quantity: parseInt(e.target.value) || 1
                  })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Max: {formData.total_stock} unites
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 h-9 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={onAddAvailability}
                className="px-4 h-9 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
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
