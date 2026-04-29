import { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Plus, Star, Quote, Search, CheckCircle } from 'lucide-react';
import { TestimonialsService, type Testimonial } from '../../services';
import { AdminPageSkeleton } from '../../components/ui/skeletons';

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState({
    author_name: '',
    author_role: '',
    author_location: '',
    rating: 5,
    content: '',
    is_featured: false,
    is_active: true,
    display_order: 0
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await TestimonialsService.getAllTestimonials();
      setItems(data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: Testimonial) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        author_name: item.author_name,
        author_role: item.author_role || '',
        author_location: item.author_location || '',
        rating: item.rating,
        content: item.content,
        is_featured: item.is_featured,
        is_active: item.is_active,
        display_order: item.display_order
      });
    } else {
      setEditingItem(null);
      setFormData({ author_name: '', author_role: '', author_location: '', rating: 5, content: '', is_featured: false, is_active: true, display_order: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await TestimonialsService.updateTestimonial(editingItem.id, formData);
      } else {
        await TestimonialsService.createTestimonial({ ...formData, event_date: null });
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await TestimonialsService.deleteTestimonial(id);
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // Filter logic
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm ||
      item.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.is_active) ||
      (statusFilter === 'inactive' && !item.is_active);
    return matchesSearch && matchesStatus;
  });

  // Stats
  const activeCount = items.filter(i => i.is_active).length;
  const featuredCount = items.filter(i => i.is_featured).length;
  const avgRating = (items.reduce((s, i) => s + i.rating, 0) / Math.max(items.length, 1)).toFixed(1);

  if (loading) {
    return <AdminPageSkeleton statsCount={4} tableColumns={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Témoignages{' '}
            <span className="text-gray-400 font-normal">{items.length}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez les avis clients affichés sur le site</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nouveau témoignage
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 md:p-4 border-l-4 border-l-gray-400 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
            <Quote className="w-4 h-4 text-gray-400 opacity-50 hidden md:block" />
          </div>
          <p className="text-xl md:text-2xl font-bold tabular-nums text-gray-900 mt-1 md:mt-2">{items.length}</p>
          <p className="hidden md:block text-xs text-gray-400 mt-0.5">témoignages</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 md:p-4 border-l-4 border-l-green-500 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">Actifs</p>
            <CheckCircle className="w-4 h-4 text-green-400 opacity-50 hidden md:block" />
          </div>
          <p className="text-xl md:text-2xl font-bold tabular-nums text-gray-900 mt-1 md:mt-2">{activeCount}</p>
          <p className="hidden md:block text-xs text-gray-400 mt-0.5">visibles sur le site</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 md:p-4 border-l-4 border-l-yellow-500 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">Mis en avant</p>
            <Star className="w-4 h-4 text-yellow-400 opacity-50 hidden md:block" />
          </div>
          <p className="text-xl md:text-2xl font-bold tabular-nums text-gray-900 mt-1 md:mt-2">{featuredCount}</p>
          <p className="hidden md:block text-xs text-gray-400 mt-0.5">en vedette</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 md:p-4 border-l-4 border-l-amber-500 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">Note moyenne</p>
            <Star className="w-4 h-4 text-amber-400 opacity-50 hidden md:block" />
          </div>
          <p className="text-xl md:text-2xl font-bold tabular-nums text-gray-900 mt-1 md:mt-2 flex items-center gap-1">
            {avgRating}
            <Star className="w-4 h-4 text-amber-400 fill-current" />
          </p>
          <p className="hidden md:block text-xs text-gray-400 mt-0.5">sur 5</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
        {/* Status toggle button group */}
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-11">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 h-full text-sm font-medium transition-colors border-r border-gray-200 last:border-r-0 ${
                statusFilter === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : 'Inactifs'}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {filteredItems.length} · {items.length} témoignages
        </span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 ${
              item.rating >= 4 ? 'border-l-4 border-l-amber-400' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {item.is_featured && (
                  <span className="ring-1 ring-yellow-200 bg-yellow-50 text-yellow-700 rounded-md px-2.5 py-1 text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </span>
                )}
                {!item.is_active && (
                  <span className="ring-1 ring-red-200 bg-red-50 text-red-700 rounded-md px-2.5 py-1 text-xs font-medium">
                    Inactif
                  </span>
                )}
              </div>
            </div>
            <Quote className="w-5 h-5 text-gray-300 mb-2" />
            <p className="text-gray-700 text-sm mb-3 line-clamp-3">"{item.content}"</p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-gray-900 font-medium text-sm">{item.author_name}</p>
                <p className="text-gray-400 text-xs">
                  {[item.author_role, item.author_location].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-16">
          <Quote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucun témoignage trouvé</p>
          {(searchTerm || statusFilter !== 'all') && (
            <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres</p>
          )}
        </div>
      )}

      {/* Form modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Modifier le témoignage' : 'Nouveau témoignage'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <input
                    type="text"
                    value={formData.author_role}
                    onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="Particulier, Responsable CSE..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={formData.author_location}
                    onChange={(e) => setFormData({ ...formData, author_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="Marseille (13)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (1-5)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  >
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Témoignage *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-sm"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">Mis en avant</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 text-sm transition-colors"
                >
                  {editingItem ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce témoignage ?</h3>
            <p className="text-gray-600 text-sm mb-4">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
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
