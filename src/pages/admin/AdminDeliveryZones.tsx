import { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Plus, MapPin } from 'lucide-react';
import { DeliveryService } from '../../services';
import { DeliveryZone } from '../../types';

export default function AdminDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    postal_codes: '',
    cities: '',
    delivery_fee: 0,
    free_delivery_threshold: null as number | null,
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await DeliveryService.getDeliveryZones();
      setZones(data);
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (zone?: DeliveryZone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        postal_codes: zone.postal_codes.join(', '),
        cities: zone.cities.join(', '),
        delivery_fee: zone.delivery_fee,
        free_delivery_threshold: zone.free_delivery_threshold,
        is_active: true,
        display_order: 0
      });
    } else {
      setEditingZone(null);
      setFormData({
        name: '',
        postal_codes: '',
        cities: '',
        delivery_fee: 0,
        free_delivery_threshold: null,
        is_active: true,
        display_order: 0
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const zoneData = {
        name: formData.name,
        postal_codes: formData.postal_codes.split(',').map(s => s.trim()).filter(Boolean),
        cities: formData.cities.split(',').map(s => s.trim()).filter(Boolean),
        delivery_fee: formData.delivery_fee,
        free_delivery_threshold: formData.free_delivery_threshold
      };

      if (editingZone) {
        await DeliveryService.updateZone(editingZone.id, zoneData);
      } else {
        await DeliveryService.createZone(zoneData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving zone:', error);
    }
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

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#33ffcc] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#000033] rounded-xl border border-white/10 w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {editingZone ? 'Modifier la zone' : 'Nouvelle zone'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className={labelClass}>Nom de la zone *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Codes postaux (séparés par des virgules)</label>
                <textarea
                  value={formData.postal_codes}
                  onChange={(e) => setFormData({...formData, postal_codes: e.target.value})}
                  className={`${inputClass} resize-none`}
                  rows={2}
                  placeholder="13001, 13002, 13003..."
                />
              </div>
              <div>
                <label className={labelClass}>Villes (séparées par des virgules)</label>
                <input
                  type="text"
                  value={formData.cities}
                  onChange={(e) => setFormData({...formData, cities: e.target.value})}
                  className={inputClass}
                  placeholder="Marseille, Aix-en-Provence..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Frais de livraison (€) *</label>
                  <input
                    type="number"
                    value={formData.delivery_fee}
                    onChange={(e) => setFormData({...formData, delivery_fee: Number(e.target.value)})}
                    className={inputClass}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Seuil gratuité (€)</label>
                  <input
                    type="number"
                    value={formData.free_delivery_threshold || ''}
                    onChange={(e) => setFormData({...formData, free_delivery_threshold: e.target.value ? Number(e.target.value) : null})}
                    className={inputClass}
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#33ffcc] text-[#000033] rounded-lg font-semibold hover:bg-[#66cccc]"
                >
                  {editingZone ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
