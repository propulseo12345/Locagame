import { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Plus, Clock } from 'lucide-react';
import { TimeSlotsService, type TimeSlot } from '../../services';

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

  const getSlotTypeLabel = (type: string) => {
    const labels: Record<string, string> = { delivery: 'Livraison', pickup: 'Récupération', both: 'Les deux' };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Créneaux horaires</h1>
          <p className="text-gray-600 mt-1">{items.length} créneau(x) configuré(s)</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-[#33ffcc] text-[#000033] rounded-lg font-semibold hover:bg-[#66cccc] transition-colors">
          <Plus className="w-5 h-5" />Nouveau créneau
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ordre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Libellé</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Horaires</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Statut</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{item.display_order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#33ffcc]" />
                    <span className="text-gray-900 font-medium">{item.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">{item.start_time} - {item.end_time}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {getSlotTypeLabel(item.slot_type)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(item)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setShowDeleteConfirm(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{editingItem ? 'Modifier' : 'Nouveau créneau'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
                <input type="text" value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent" placeholder="08:00 - 10:00" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure début *</label>
                  <input type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin *</label>
                  <input type="time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de créneau</label>
                  <select value={formData.slot_type} onChange={(e) => setFormData({...formData, slot_type: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent">
                    <option value="both">Les deux</option>
                    <option value="delivery">Livraison uniquement</option>
                    <option value="pickup">Récupération uniquement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                  <input type="number" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent" min="0" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="rounded border-gray-300 text-[#33ffcc] focus:ring-[#33ffcc]" />
                <label htmlFor="is_active" className="text-gray-700">Actif</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-[#33ffcc] text-[#000033] rounded-lg font-semibold hover:bg-[#66cccc]">{editingItem ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce créneau ?</h3>
            <p className="text-gray-600 mb-4">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annuler</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
