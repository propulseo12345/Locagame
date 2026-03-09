import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Image, Calendar, MapPin, Users, Star, Eye, EyeOff, Search } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

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

  const handleToggleActive = async (item: PortfolioEvent) => {
    try {
      await PortfolioEventsService.updatePortfolioEvent(item.id, { is_active: !item.is_active });
      loadData();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const handleToggleFeatured = async (item: PortfolioEvent) => {
    try {
      await PortfolioEventsService.updatePortfolioEvent(item.id, { is_featured: !item.is_featured });
      loadData();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  // Filtrage
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.event_type_id === filterType;
    return matchesSearch && matchesType;
  });

  // Stats
  const activeCount = items.filter(i => i.is_active).length;
  const featuredCount = items.filter(i => i.is_featured).length;
  const totalGuests = items.reduce((sum, i) => sum + (i.guest_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#33ffcc] border-t-transparent mb-3"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button onClick={loadData} className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">Réessayer</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio / Réalisations</h1>
          <p className="text-gray-500 mt-1">{items.length} événement(s)</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-5 py-2.5 bg-[#33ffcc] text-[#000033] rounded-xl font-semibold hover:bg-[#66cccc] transition-all hover:shadow-lg">
          <Plus className="w-5 h-5" />Nouvel événement
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Mis en avant</p>
          <p className="text-2xl font-bold text-[#33ccaa]">{featuredCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Invités total</p>
          <p className="text-2xl font-bold text-gray-900">{totalGuests.toLocaleString('fr-FR')}</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent text-sm"
        >
          <option value="all">Tous les types</option>
          {eventTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div key={item.id} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200">
            {/* Image */}
            <div className="relative h-44 bg-gray-100 overflow-hidden">
              {item.featured_image ? (
                <img src={item.featured_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <Image className="w-12 h-12 text-gray-300" />
                </div>
              )}
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute top-3 right-3 flex gap-1.5">
                {item.is_featured && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#33ffcc] text-[#000033] rounded-lg text-xs font-bold shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </span>
                )}
                {!item.is_active && (
                  <span className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-xs font-medium shadow-sm">Inactif</span>
                )}
              </div>

              {/* Image count */}
              {item.images && item.images.length > 0 && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
                  <Image className="w-3 h-3" />
                  {item.images.length}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-gray-900 font-semibold mb-2 line-clamp-1">{item.title}</h3>

              <div className="space-y-1.5 text-sm text-gray-500 mb-3">
                {item.event_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(item.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
                {item.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
                {item.guest_count && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {item.guest_count} invités
                  </div>
                )}
              </div>

              {item.event_type && (
                <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{item.event_type.name}</span>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`p-1.5 rounded-lg transition-colors ${item.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-50'}`}
                    title={item.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className={`p-1.5 rounded-lg transition-colors ${item.is_featured ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-300 hover:bg-gray-50'}`}
                    title={item.is_featured ? 'Retirer des favoris' : 'Mettre en avant'}
                  >
                    <Star className={`w-4 h-4 ${item.is_featured ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun événement trouvé.</p>
        </div>
      )}

      {showModal && (
        <PortfolioEventModal
          editingItem={editingItem}
          eventTypes={eventTypes}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); }}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer cet événement ?</h3>
            <p className="text-gray-600 mb-4">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg">Annuler</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
