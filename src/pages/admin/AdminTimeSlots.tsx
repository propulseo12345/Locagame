import { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Plus, Clock, CheckCircle, Layers } from 'lucide-react';
import { TimeSlotsService, type TimeSlot } from '../../services';
import { AdminPageSkeleton } from '../../components/ui/skeletons';

export default function AdminTimeSlots() {
  const [items, setItems] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TimeSlot | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    start_time: '',
    end_time: '',
    slot_type: 'both' as 'delivery' | 'pickup' | 'both',
    is_active: true,
    display_order: 0
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await TimeSlotsService.getAllTimeSlots();
      setItems(data);
    } catch (error) {
      console.error('Error loading time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: TimeSlot) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        label: item.label,
        start_time: item.start_time,
        end_time: item.end_time,
        slot_type: item.slot_type,
        is_active: item.is_active,
        display_order: item.display_order
      });
    } else {
      setEditingItem(null);
      setFormData({ label: '', start_time: '', end_time: '', slot_type: 'both', is_active: true, display_order: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await TimeSlotsService.updateTimeSlot(editingItem.id, formData);
      } else {
        await TimeSlotsService.createTimeSlot(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await TimeSlotsService.deleteTimeSlot(id);
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const totalActive = items.filter(i => i.is_active).length;
  const deliveryCount = items.filter(i => i.slot_type === 'delivery').length;
  const pickupCount = items.filter(i => i.slot_type === 'pickup').length;
  const bothCount = items.filter(i => i.slot_type === 'both').length;

  // Skeleton loading
  if (loading) {
    return <AdminPageSkeleton statsCount={3} tableColumns={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Créneaux horaires <span className="text-gray-400 font-normal">{items.length}</span>
          </h1>
          <p className="text-gray-600 mt-0.5 text-sm">Gérez les créneaux de livraison et de récupération</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau créneau
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-gray-400 hover:shadow-md transition-all relative overflow-hidden">
          <Clock className="absolute top-3 right-3 w-8 h-8 text-gray-400 opacity-50" />
          <p className="text-sm text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900">{items.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">créneaux configurés</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-green-500 hover:shadow-md transition-all relative overflow-hidden">
          <CheckCircle className="absolute top-3 right-3 w-8 h-8 text-green-400 opacity-50" />
          <p className="text-sm text-gray-500 mb-1">Actifs</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900">{totalActive}</p>
          <p className="text-sm text-gray-500 mt-0.5">créneaux actifs</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-blue-500 hover:shadow-md transition-all relative overflow-hidden">
          <Layers className="absolute top-3 right-3 w-8 h-8 text-blue-400 opacity-50" />
          <p className="text-sm text-gray-500 mb-1">Répartition</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900">{bothCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">{deliveryCount} liv. · {pickupCount} récup. · {bothCount} les deux</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-left w-16">Ordre</th>
              <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-left">Libellé</th>
              <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-left">Horaires</th>
              <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-left">Type</th>
              <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-left">Statut</th>
              <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucun créneau configuré</p>
                  <button
                    onClick={() => handleOpenModal()}
                    className="mt-3 text-sm text-gray-900 underline hover:no-underline"
                  >
                    Créer un premier créneau
                  </button>
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-100/60 transition-colors ${index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}
                >
                  <td className="px-4 py-3 text-gray-400 text-sm tabular-nums">{item.display_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-gray-900 font-medium text-sm">{item.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm tabular-nums">
                    {item.start_time} – {item.end_time}
                  </td>
                  <td className="px-4 py-3">
                    {item.slot_type === 'delivery' && (
                      <span className="inline-flex items-center ring-1 ring-blue-200 bg-blue-50 text-blue-700 rounded-md px-2.5 py-1 text-xs font-medium">
                        Livraison
                      </span>
                    )}
                    {item.slot_type === 'pickup' && (
                      <span className="inline-flex items-center ring-1 ring-purple-200 bg-purple-50 text-purple-700 rounded-md px-2.5 py-1 text-xs font-medium">
                        Récupération
                      </span>
                    )}
                    {item.slot_type === 'both' && (
                      <span className="inline-flex items-center ring-1 ring-gray-200 bg-gray-50 text-gray-700 rounded-md px-2.5 py-1 text-xs font-medium">
                        Les deux
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.is_active ? (
                      <span className="inline-flex items-center ring-1 ring-green-200 bg-green-50 text-green-700 rounded-md px-2.5 py-1 text-xs font-medium">
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center ring-1 ring-gray-200 bg-gray-50 text-gray-600 rounded-md px-2.5 py-1 text-xs font-medium">
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{editingItem ? 'Modifier' : 'Nouveau créneau'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                  placeholder="08:00 - 10:00"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure début *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de créneau</label>
                  <select
                    value={formData.slot_type}
                    onChange={e => setFormData({ ...formData, slot_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                  >
                    <option value="both">Les deux</option>
                    <option value="delivery">Livraison uniquement</option>
                    <option value="pickup">Récupération uniquement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-gray-700">Actif</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800">
                  {editingItem ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce créneau ?</h3>
            <p className="text-gray-600 mb-4">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
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
