import { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Plus, Search, Tag, CheckCircle, XCircle, Percent, Euro, Calendar } from 'lucide-react';
import { PromoCodesService, type PromoCode } from '../../services';
import { AdminPageSkeleton } from '../../components/ui/skeletons';

type StatusFilter = 'all' | 'active' | 'inactive';

const defaultForm = {
  code: '',
  description: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: 0,
  min_order_amount: 0,
  max_uses: '' as string | number,
  valid_until: '',
  is_active: true,
};

export default function AdminPromoCodes() {
  const [items, setItems] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PromoCode | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await PromoCodesService.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: PromoCode) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        description: item.description || '',
        discount_type: item.discount_type,
        discount_value: item.discount_value,
        min_order_amount: item.min_order_amount,
        max_uses: item.max_uses ?? '',
        valid_until: item.valid_until ? item.valid_until.split('T')[0] : '',
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      setFormData(defaultForm);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const input = {
        code: formData.code,
        description: formData.description || undefined,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_order_amount: formData.min_order_amount || 0,
        max_uses: formData.max_uses ? Number(formData.max_uses) : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until + 'T23:59:59').toISOString() : null,
        is_active: formData.is_active,
      };

      if (editingItem) {
        await PromoCodesService.update(editingItem.id, input);
      } else {
        await PromoCodesService.create(input);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving promo code:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await PromoCodesService.delete(id);
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting promo code:', error);
    }
  };

  const handleToggle = async (item: PromoCode) => {
    try {
      await PromoCodesService.toggleActive(item.id, !item.is_active);
      loadData();
    } catch (error) {
      console.error('Error toggling promo code:', error);
    }
  };

  const isExpired = (item: PromoCode) =>
    item.valid_until && new Date(item.valid_until) < new Date();

  const isMaxedOut = (item: PromoCode) =>
    item.max_uses !== null && item.current_uses >= item.max_uses;

  const filteredItems = items.filter(item => {
    const matchSearch = searchTerm === '' ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && item.is_active && !isExpired(item)) ||
      (statusFilter === 'inactive' && (!item.is_active || isExpired(item)));
    return matchSearch && matchStatus;
  });

  const totalActive = items.filter(i => i.is_active && !isExpired(i) && !isMaxedOut(i)).length;
  const totalExpired = items.filter(i => isExpired(i)).length;
  const totalPercentage = items.filter(i => i.discount_type === 'percentage').length;
  const totalFixed = items.filter(i => i.discount_type === 'fixed').length;

  const formatDiscount = (item: PromoCode) =>
    item.discount_type === 'percentage' ? `${item.discount_value}%` : `${item.discount_value}€`;

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <AdminPageSkeleton statsCount={4} tableColumns={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Codes promo <span className="text-gray-400 font-normal">{items.length}</span>
          </h1>
          <p className="text-gray-600 mt-0.5 text-sm">Gérez les codes de réduction</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 md:p-4 border-l-4 border-l-gray-400 hover:shadow-md transition-all relative overflow-hidden">
          <Tag className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 md:w-8 md:h-8 text-gray-400 opacity-50" />
          <p className="text-[10px] md:text-sm text-gray-500 mb-0.5 md:mb-1">Total</p>
          <p className="text-xl md:text-2xl font-bold tabular-nums text-gray-900">{items.length}</p>
          <p className="hidden md:block text-sm text-gray-500 mt-0.5">codes</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 md:p-4 border-l-4 border-l-green-500 hover:shadow-md transition-all relative overflow-hidden">
          <CheckCircle className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 md:w-8 md:h-8 text-green-400 opacity-50" />
          <p className="text-[10px] md:text-sm text-gray-500 mb-0.5 md:mb-1">Actifs</p>
          <p className="text-xl md:text-2xl font-bold tabular-nums text-gray-900">{totalActive}</p>
          <p className="hidden md:block text-sm text-gray-500 mt-0.5">utilisables</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 md:p-4 border-l-4 border-l-orange-400 hover:shadow-md transition-all relative overflow-hidden">
          <Calendar className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 md:w-8 md:h-8 text-orange-400 opacity-50" />
          <p className="text-[10px] md:text-sm text-gray-500 mb-0.5 md:mb-1">Expirés</p>
          <p className="text-xl md:text-2xl font-bold tabular-nums text-gray-900">{totalExpired}</p>
          <p className="hidden md:block text-sm text-gray-500 mt-0.5">périmés</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 md:p-4 border-l-4 border-l-blue-500 hover:shadow-md transition-all relative overflow-hidden">
          <Percent className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 md:w-8 md:h-8 text-blue-400 opacity-50" />
          <p className="text-[10px] md:text-sm text-gray-500 mb-0.5 md:mb-1">Types</p>
          <p className="text-xl md:text-2xl font-bold tabular-nums text-gray-900">{totalPercentage} / {totalFixed}</p>
          <p className="hidden md:block text-sm text-gray-500 mt-0.5">% / montant fixe</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`h-11 px-3 md:px-4 text-sm font-medium transition-colors ${
                  statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : 'Inactifs'}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap shrink-0">
            {filteredItems.length} · {items.length}
          </span>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucun code promo trouvé</p>
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="mt-3 text-sm text-gray-900 underline hover:no-underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-gray-900 font-mono font-bold text-sm">{item.code}</p>
                  {item.description && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{item.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleToggle(item)}
                    className={`p-2 rounded-lg transition-colors ${item.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    {item.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 ring-1 ring-blue-200 bg-blue-50 text-blue-700 rounded-md px-2 py-0.5 text-[10px] font-medium">
                  {item.discount_type === 'percentage' ? <Percent className="w-3 h-3" /> : <Euro className="w-3 h-3" />}
                  {formatDiscount(item)}
                </span>
                <span className="text-xs text-gray-500 tabular-nums">
                  {item.current_uses}{item.max_uses !== null ? `/${item.max_uses}` : ''} util.
                </span>
                {item.is_active && !isExpired(item) && !isMaxedOut(item) ? (
                  <span className="inline-flex items-center ring-1 ring-green-200 bg-green-50 text-green-700 rounded-md px-2 py-0.5 text-[10px] font-medium">Actif</span>
                ) : (
                  <span className="inline-flex items-center ring-1 ring-gray-200 bg-gray-50 text-gray-700 rounded-md px-2 py-0.5 text-[10px] font-medium">Inactif</span>
                )}
                {isExpired(item) && (
                  <span className="inline-flex items-center ring-1 ring-red-200 bg-red-50 text-red-700 rounded-md px-2 py-0.5 text-[10px] font-medium">Expiré</span>
                )}
              </div>
              {item.valid_until && (
                <p className="text-gray-400 text-xs mt-1.5">Expire: {formatDate(item.valid_until)}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-left">Code</th>
                <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-left">Réduction</th>
                <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-left">Utilisations</th>
                <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-left">Validité</th>
                <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-left">Statut</th>
                <th className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Aucun code promo trouvé</p>
                    <button
                      onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                      className="mt-3 text-sm text-gray-900 underline hover:no-underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  </td>
                </tr>
              ) : filteredItems.map((item, index) => (
                <tr key={item.id} className={`hover:bg-gray-100/60 transition-colors ${index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-gray-900 font-mono font-bold text-sm">{item.code}</p>
                      {item.description && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{item.description}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 ring-1 ring-blue-200 bg-blue-50 text-blue-700 rounded-md px-2.5 py-1 text-xs font-medium">
                      {item.discount_type === 'percentage' ? <Percent className="w-3 h-3" /> : <Euro className="w-3 h-3" />}
                      {formatDiscount(item)}
                    </span>
                    {item.min_order_amount > 0 && (
                      <p className="text-gray-400 text-[10px] mt-0.5">Min. {item.min_order_amount}€</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900 text-sm tabular-nums">
                      {item.current_uses}{item.max_uses !== null ? ` / ${item.max_uses}` : ''}
                    </span>
                    {isMaxedOut(item) && (
                      <p className="text-orange-500 text-[10px]">Épuisé</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-600 text-xs">
                      {formatDate(item.valid_from)}
                      {item.valid_until && (
                        <> → {formatDate(item.valid_until)}</>
                      )}
                    </p>
                    {isExpired(item) && (
                      <p className="text-red-500 text-[10px] font-medium">Expiré</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.is_active && !isExpired(item) && !isMaxedOut(item) ? (
                      <span className="inline-flex items-center ring-1 ring-green-200 bg-green-50 text-green-700 rounded-md px-2.5 py-1 text-xs font-medium">Actif</span>
                    ) : (
                      <span className="inline-flex items-center ring-1 ring-gray-200 bg-gray-50 text-gray-700 rounded-md px-2.5 py-1 text-xs font-medium">Inactif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={item.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {item.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>

      {/* Form modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">{editingItem ? 'Modifier le code' : 'Nouveau code promo'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: SUMMER20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 font-mono uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: 20% de réduction été 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de réduction *</label>
                  <select
                    value={formData.discount_type}
                    onChange={e => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valeur * {formData.discount_type === 'percentage' ? '(%)' : '(€)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value || ''}
                    onChange={e => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    min="0"
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant minimum (€)</label>
                  <input
                    type="number"
                    value={formData.min_order_amount || ''}
                    onChange={e => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max utilisations</label>
                  <input
                    type="number"
                    value={formData.max_uses}
                    onChange={e => setFormData({ ...formData, max_uses: e.target.value === '' ? '' : Number(e.target.value) })}
                    min="1"
                    placeholder="Illimité"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="promo_is_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="promo_is_active" className="text-gray-700">Actif</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800">
                  {editingItem ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce code promo ?</h3>
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
