import { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Plus, Image, Calendar, MapPin, Users } from 'lucide-react';
import { PortfolioEventsService, EventTypesService, type PortfolioEvent, type EventType } from '../../services';

export default function AdminPortfolioEvents() {
  const [items, setItems] = useState<PortfolioEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    guest_count: null as number | null,
    event_type_id: '',
    featured_image: '',
    images: [] as string[],
    is_featured: false,
    is_active: true,
    display_order: 0
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, typesData] = await Promise.all([
        PortfolioEventsService.getAllPortfolioEvents(),
        EventTypesService.getEventTypes()
      ]);
      setItems(eventsData);
      setEventTypes(typesData);
    } catch (error) {
      console.error('Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: PortfolioEvent) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        event_date: item.event_date || '',
        location: item.location || '',
        guest_count: item.guest_count,
        event_type_id: item.event_type_id || '',
        featured_image: item.featured_image || '',
        images: item.images || [],
        is_featured: item.is_featured,
        is_active: item.is_active,
        display_order: item.display_order
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '', description: '', event_date: '', location: '', guest_count: null,
        event_type_id: '', featured_image: '', images: [], is_featured: false, is_active: true, display_order: 0
      });
    }
    setNewImageUrl('');
    setShowModal(true);
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
      if (!formData.featured_image) {
        setFormData(prev => ({ ...prev, featured_image: newImageUrl.trim() }));
      }
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
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await PortfolioEventsService.deletePortfolioEvent(id);
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Portfolio / Réalisations</h1>
          <p className="text-gray-600 mt-1">{items.length} événement(s)</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-[#33ffcc] text-[#000033] rounded-lg font-semibold hover:bg-[#66cccc] transition-colors">
          <Plus className="w-5 h-5" />Nouvel événement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-40 bg-gray-100 relative">
              {item.featured_image ? (
                <img src={item.featured_image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Image className="w-12 h-12 text-gray-300" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {item.is_featured && <span className="px-2 py-0.5 bg-[#33ffcc] text-[#000033] rounded text-xs font-medium">Featured</span>}
                {!item.is_active && <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs">Inactif</span>}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-gray-900 font-semibold mb-2">{item.title}</h3>
              <div className="space-y-1 text-sm text-gray-500 mb-3">
                {item.event_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.event_date).toLocaleDateString('fr-FR')}
                  </div>
                )}
                {item.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </div>
                )}
                {item.guest_count && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {item.guest_count} invités
                  </div>
                )}
              </div>
              {item.event_type && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{item.event_type.name}</span>
              )}
              <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => handleOpenModal(item)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setShowDeleteConfirm(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">{editingItem ? 'Modifier' : 'Nouvel événement'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer cet événement ?</h3>
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
