import { useState, useEffect } from 'react';
import { fakeDeliveryZones } from '../../lib/fake-data';
import { X, Trash2, Edit2, MoreVertical } from 'lucide-react';

export default function AdminZones() {
  const [zones, setZones] = useState(fakeDeliveryZones);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cities: '',
    postalCodes: '',
    deliveryFee: '',
    freeDeliveryThreshold: '',
    estimatedDeliveryTime: '',
    availableDays: [] as string[],
    isActive: true,
    note: ''
  });

  const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  const handleOpenModal = (zone?: any) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        cities: zone.cities.join(', '),
        postalCodes: zone.postalCodes.join(', '),
        deliveryFee: zone.deliveryFee.toString(),
        freeDeliveryThreshold: zone.freeDeliveryThreshold?.toString() || '',
        estimatedDeliveryTime: zone.estimatedDeliveryTime,
        availableDays: zone.availableDays,
        isActive: zone.isActive,
        note: (zone as any).note || ''
      });
    } else {
      setEditingZone(null);
      setFormData({
        name: '',
        cities: '',
        postalCodes: '',
        deliveryFee: '',
        freeDeliveryThreshold: '',
        estimatedDeliveryTime: '',
        availableDays: [],
        isActive: true,
        note: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingZone(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      setZones(prev => prev.map(z => 
        z.id === editingZone.id 
          ? {
              ...z,
              name: formData.name,
              cities: formData.cities.split(',').map(c => c.trim()).filter(c => c),
              postalCodes: formData.postalCodes.split(',').map(c => c.trim()).filter(c => c),
              deliveryFee: parseFloat(formData.deliveryFee),
              freeDeliveryThreshold: formData.freeDeliveryThreshold ? parseFloat(formData.freeDeliveryThreshold) : null,
              estimatedDeliveryTime: formData.estimatedDeliveryTime,
              availableDays: formData.availableDays,
              isActive: formData.isActive,
              note: formData.note
            }
          : z
      ));
    } else {
      const newZone = {
        id: `zone_${Date.now()}`,
        name: formData.name,
        cities: formData.cities.split(',').map(c => c.trim()).filter(c => c),
        postalCodes: formData.postalCodes.split(',').map(c => c.trim()).filter(c => c),
        deliveryFee: parseFloat(formData.deliveryFee),
        freeDeliveryThreshold: formData.freeDeliveryThreshold ? parseFloat(formData.freeDeliveryThreshold) : null,
        estimatedDeliveryTime: formData.estimatedDeliveryTime,
        availableDays: formData.availableDays,
        isActive: formData.isActive,
        note: formData.note
      };
      setZones(prev => [...prev, newZone]);
    }
    handleCloseModal();
  };

  const handleDelete = (zoneId: string) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
    setShowDeleteConfirm(null);
    setShowMenu(null);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menu-container')) {
        setShowMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zones de livraison</h1>
          <p className="text-gray-600 mt-1">Gérez les zones et tarifs de livraison</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
        >
          + Nouvelle zone
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Total zones</div>
          <div className="text-2xl font-bold text-gray-900">{zones.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Zones actives</div>
          <div className="text-2xl font-bold text-green-600">
            {zones.filter(z => z.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Code postal moyen</div>
          <div className="text-2xl font-bold text-gray-900">
            {zones.length > 0 ? Math.round(zones.reduce((sum, z) => sum + z.postalCodes.length, 0) / zones.length) : 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Frais moyen</div>
          <div className="text-2xl font-bold text-gray-900">
            {zones.length > 0 ? Math.round(zones.reduce((sum, z) => sum + z.deliveryFee, 0) / zones.length) : 0}€
          </div>
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                <div className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  zone.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {zone.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="relative menu-container">
                <button 
                  onClick={() => setShowMenu(showMenu === zone.id ? null : zone.id)}
                  className="text-gray-600 hover:text-gray-900 p-1"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showMenu === zone.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        handleOpenModal(zone);
                        setShowMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(zone.id);
                        setShowMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Villes</div>
                <div className="text-sm text-gray-600">{zone.cities.join(', ')}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Codes postaux</div>
                <div className="text-sm text-gray-600">
                  {zone.postalCodes.length} code(s) postal(aux)
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {zone.postalCodes.slice(0, 3).join(', ')}
                  {zone.postalCodes.length > 3 && ` +${zone.postalCodes.length - 3} autres`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Frais de livraison</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {zone.deliveryFee === 0 ? 'Gratuit' : `${zone.deliveryFee}€`}
                  </div>
                  {(zone as any).note && (
                    <div className="text-sm text-orange-600 mt-1 font-medium">{(zone as any).note}</div>
                  )}
                </div>
                {zone.freeDeliveryThreshold && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Gratuit à partir de</div>
                    <div className="text-3xl font-bold text-gray-900">{zone.freeDeliveryThreshold}€</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Délai de livraison</div>
                <div className="text-sm font-medium text-gray-900">{zone.estimatedDeliveryTime}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Jours disponibles</div>
                <div className="text-sm text-gray-600">{zone.availableDays.join(', ')}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button 
                onClick={() => handleOpenModal(zone)}
                className="w-full px-3 py-2 text-sm bg-[#33ffcc] text-[#000033] font-medium rounded-lg hover:bg-[#66cccc] transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modale Ajouter/Modifier Zone */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingZone ? 'Modifier la zone' : 'Nouvelle zone'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la zone *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Villes (séparées par des virgules) *</label>
                  <input
                    type="text"
                    required
                    value={formData.cities}
                    onChange={(e) => setFormData({...formData, cities: e.target.value})}
                    placeholder="Marseille, Aix-en-Provence"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Codes postaux (séparés par des virgules) *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCodes}
                    onChange={(e) => setFormData({...formData, postalCodes: e.target.value})}
                    placeholder="13001, 13002, 13003"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frais de livraison (€) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({...formData, deliveryFee: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gratuit à partir de (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.freeDeliveryThreshold}
                    onChange={(e) => setFormData({...formData, freeDeliveryThreshold: e.target.value})}
                    placeholder="Laisser vide si non applicable"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Délai de livraison *</label>
                <input
                  type="text"
                  required
                  value={formData.estimatedDeliveryTime}
                  onChange={(e) => setFormData({...formData, estimatedDeliveryTime: e.target.value})}
                  placeholder="Ex: 2-4 heures, J+1, Lendemain"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jours disponibles *</label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        formData.availableDays.includes(day)
                          ? 'bg-[#33ffcc] text-[#000033] border-[#33ffcc] font-semibold'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note (optionnel)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Ex: Frais kilométriques en supplément"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Zone active
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
                >
                  {editingZone ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette zone ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
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
