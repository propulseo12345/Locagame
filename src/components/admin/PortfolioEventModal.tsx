import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { PortfolioEventsService, type PortfolioEvent, type EventType } from '../../services';

interface PortfolioEventModalProps {
  editingItem: PortfolioEvent | null;
  eventTypes: EventType[];
  onClose: () => void;
  onSaved: () => void;
}

export default function PortfolioEventModal({ editingItem, eventTypes, onClose, onSaved }: PortfolioEventModalProps) {
  const [formData, setFormData] = useState({
    title: editingItem?.title || '',
    description: editingItem?.description || '',
    event_date: editingItem?.event_date || '',
    location: editingItem?.location || '',
    guest_count: editingItem?.guest_count ?? null as number | null,
    event_type_id: editingItem?.event_type_id || '',
    featured_image: editingItem?.featured_image || '',
    images: editingItem?.images || [] as string[],
    is_featured: editingItem?.is_featured || false,
    is_active: editingItem?.is_active ?? true,
    display_order: editingItem?.display_order || 0
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      const newImages = [...formData.images, newImageUrl.trim()];
      setFormData(prev => ({
        ...prev,
        images: newImages,
        featured_image: prev.featured_image || newImageUrl.trim()
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        event_type_id: formData.event_type_id || null,
        products_used: []
      };
      if (editingItem) {
        await PortfolioEventsService.updatePortfolioEvent(editingItem.id, data);
      } else {
        await PortfolioEventsService.createPortfolioEvent(data);
      }
      onSaved();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">{editingItem ? 'Modifier' : 'Nouvel événement'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de l'événement</label>
              <input type="date" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'invités</label>
              <input type="number" value={formData.guest_count || ''} onChange={(e) => setFormData({...formData, guest_count: e.target.value ? Number(e.target.value) : null})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent" min="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement</label>
              <select value={formData.event_type_id} onChange={(e) => setFormData({...formData, event_type_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent">
                <option value="">Sélectionnez</option>
                {eventTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <div className="flex gap-2 mb-2">
              <input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent" placeholder="URL de l'image" />
              <button type="button" onClick={handleAddImage} className="px-3 py-2 bg-[#33ffcc] text-[#000033] rounded-lg font-semibold hover:bg-[#66cccc]">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded overflow-hidden border border-gray-200">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 p-0.5 bg-red-500 rounded text-white">
                      <X className="w-3 h-3" />
                    </button>
                    {formData.featured_image === img && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#33ffcc] text-[#000033] text-xs text-center font-medium">Cover</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
              <input type="number" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent" min="0" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="rounded border-gray-300 text-[#33ffcc] focus:ring-[#33ffcc]" />
              <span className="text-gray-700">Mis en avant</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="rounded border-gray-300 text-[#33ffcc] focus:ring-[#33ffcc]" />
              <span className="text-gray-700">Actif</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-[#33ffcc] text-[#000033] rounded-lg font-semibold hover:bg-[#66cccc]">{editingItem ? 'Enregistrer' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
