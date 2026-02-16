import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, MapPin } from 'lucide-react';
import { DeliveryService } from '../../services';
import { DeliveryZone } from '../../types';
import DeliveryZoneModal from '../../components/admin/DeliveryZoneModal';

export default function AdminDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await DeliveryService.getDeliveryZones();
      setZones(data);
    } catch (err) {
      console.error('Error loading zones:', err);
      setError('Impossible de charger les zones de livraison.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (zone?: DeliveryZone) => {
    setEditingZone(zone || null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await DeliveryService.deleteZone(id);
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#33ffcc] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
          <p className="text-red-300">{error}</p>
          <button onClick={loadData} className="px-4 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium">Réessayer</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Zones de livraison</h1>
          <p className="text-gray-400 mt-1">{zones.length} zone(s)</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#33ffcc] text-[#000033] rounded-lg font-semibold hover:bg-[#66cccc] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle zone
        </button>
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Zone</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Codes postaux</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tarif</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Seuil gratuit</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {zones.map((zone) => (
              <tr key={zone.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#33ffcc]" />
                    <span className="text-white font-medium">{zone.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">
                  {zone.postal_codes.slice(0, 3).join(', ')}{zone.postal_codes.length > 3 ? '...' : ''}
                </td>
                <td className="px-4 py-3 text-white">{zone.delivery_fee} €</td>
                <td className="px-4 py-3 text-gray-400">
                  {zone.free_delivery_threshold ? `${zone.free_delivery_threshold} €` : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(zone)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(zone.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <DeliveryZoneModal
          editingZone={editingZone}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); }}
        />
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#000033] rounded-xl border border-white/10 p-6 max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">Supprimer cette zone ?</h3>
            <p className="text-gray-400 mb-4">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
