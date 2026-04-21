import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Image, Calendar, MapPin, Users, Star, Eye, EyeOff, Search } from 'lucide-react';
import { PortfolioEventsService, EventTypesService, type PortfolioEvent, type EventType } from '../../services';
import PortfolioEventModal from '../../components/admin/PortfolioEventModal';
import { AdminPageSkeleton } from '../../components/ui/skeletons';

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
    const matchesSearch = !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.event_type_id === filterType;
    return matchesSearch && matchesType;
  });

  // Stats
  const activeCount = items.filter(i => i.is_active).length;
  const featuredCount = items.filter(i => i.is_featured).length;
  const totalGuests = items.reduce((sum, i) => sum + (i.guest_count || 0), 0);

  if (loading) {
    return <AdminPageSkeleton statsCount={3} tableColumns={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-l-red-500 rounded-r-lg flex items-center justify-between">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Portfolio / Réalisations{' '}
            <span className="text-gray-400 font-normal">{items.length}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez les événements affichés dans le portfolio</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvel événement
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-gray-400 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
            <Image className="w-4 h-4 text-gray-400 opacity-50" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900 mt-2">{items.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">événements</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-green-500 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actifs</p>
            <Eye className="w-4 h-4 text-green-400 opacity-50" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900 mt-2">{activeCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">visibles sur le site</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-yellow-500 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mis en avant</p>
            <Star className="w-4 h-4 text-yellow-400 opacity-50" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900 mt-2">{featuredCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">en vedette</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-blue-500 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Invités total</p>
            <Users className="w-4 h-4 text-blue-400 opacity-50" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900 mt-2">{totalGuests.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-400 mt-0.5">participants cumulés</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
        >
          <option value="all">Tous les types</option>
          {eventTypes.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {filteredItems.length} · {items.length} événements
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            {/* Image */}
            <div className="relative h-44 bg-gray-100 overflow-hidden">
              {item.featured_image ? (
                <img
                  src={item.featured_image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
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
                  <span className="ring-1 ring-yellow-200 bg-yellow-50 text-yellow-700 rounded-md px-2 py-0.5 text-xs font-medium flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </span>
                )}
                {!item.is_active && (
                  <span className="ring-1 ring-red-200 bg-red-50 text-red-700 rounded-md px-2 py-0.5 text-xs font-medium shadow-sm">
                    Inactif
                  </span>
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
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {new Date(item.event_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
                {item.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
                {item.guest_count && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {item.guest_count} invités
                  </div>
                )}
              </div>

              {item.event_type && (
                <span className="inline-flex ring-1 ring-gray-200 bg-gray-50 text-gray-700 rounded-md px-2.5 py-1 text-xs font-medium">
                  {item.event_type.name}
                </span>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`p-2 rounded-lg transition-colors active:scale-95 ${item.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-50'}`}
                    title={item.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className={`p-2 rounded-lg transition-colors active:scale-95 ${item.is_featured ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-300 hover:bg-gray-50'}`}
                    title={item.is_featured ? 'Retirer des favoris' : 'Mettre en avant'}
                  >
                    <Star className={`w-4 h-4 ${item.is_featured ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-16">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucun événement trouvé.</p>
          {(searchTerm || filterType !== 'all') && (
            <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres</p>
          )}
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
            <p className="text-gray-600 text-sm mb-4">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
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
