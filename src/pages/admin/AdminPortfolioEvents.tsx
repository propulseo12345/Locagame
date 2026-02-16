import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Image, Calendar, MapPin, Users } from 'lucide-react';
import { PortfolioEventsService, EventTypesService, type PortfolioEvent, type EventType } from '../../services';
import PortfolioEventModal from '../../components/admin/PortfolioEventModal';

export default function AdminPortfolioEvents() {
  const [items, setItems] = useState<PortfolioEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setError(null);
    try {
      setLoading(true);
      const [eventsData, typesData] = await Promise.all([
        PortfolioEventsService.getAllPortfolioEvents(),
        EventTypesService.getEventTypes()
      ]);
      setItems(eventsData);
      setEventTypes(typesData);
    } catch (err) {
      console.error('Error loading:', err);
      setError('Impossible de charger les événements.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: PortfolioEvent) => {
    setEditingItem(item || null);
    setShowModal(true);
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
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button onClick={loadData} className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">Réessayer</button>
        </div>
      )}
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
        <PortfolioEventModal
          editingItem={editingItem}
          eventTypes={eventTypes}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); }}
        />
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
