import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, MapPin, Map, Euro, TrendingDown } from 'lucide-react';
import { DeliveryService } from '../../services';
import { DeliveryZone } from '../../types';
import DeliveryZoneModal from '../../components/admin/DeliveryZoneModal';

export default function AdminDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await DeliveryService.getDeliveryZones();
      setZones(data);
    } catch (err) {
      setError('Impossible de charger les zones de livraison.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (zone?: DeliveryZone) => {
    setEditingZone(zone || null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await DeliveryService.deleteZone(id);
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      // handled silently
    }
  };

  const avgFee = zones.length > 0
    ? (zones.reduce((s, z) => s + z.delivery_fee, 0) / zones.length).toFixed(0)
    : '0';

  const avgThreshold = zones.filter(z => z.free_delivery_threshold).length > 0
    ? (
        zones
          .filter(z => z.free_delivery_threshold)
          .reduce((s, z) => s + (z.free_delivery_threshold ?? 0), 0) /
        zones.filter(z => z.free_delivery_threshold).length
      ).toFixed(0)
    : null;

  const totalPostalCodes = zones.reduce((s, z) => s + z.postal_codes.length, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-gray-200 animate-pulse">
              <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
              <div className="h-7 w-14 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 flex gap-8">
            {['w-24', 'w-32', 'w-16', 'w-24', 'w-16'].map((w, i) => (
              <div key={i} className={`h-3 ${w} bg-gray-200 rounded animate-pulse`} />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-4 border-t border-gray-100 flex gap-8 items-center animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-48 bg-gray-100 rounded" />
              <div className="h-4 w-12 bg-gray-100 rounded" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
              <div className="ml-auto flex gap-2">
                <div className="h-7 w-7 bg-gray-100 rounded" />
                <div className="h-7 w-7 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-l-red-500 rounded-r-lg p-4 flex items-center justify-between">
          <p className="text-red-700 text-sm font-medium">{error}</p>
          <button
            onClick={loadData}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Zones de livraison
            <span className="text-gray-400 font-normal"> · {zones.length} zones</span>
          </h1>
          <p className="text-gray-600 mt-0.5 text-sm">Configurez les zones et tarifs de livraison</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle zone
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <Map className="w-4 h-4 text-blue-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total zones</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{zones.length}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-green-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <Euro className="w-4 h-4 text-green-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Frais moyen</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{avgFee} €</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-violet-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <TrendingDown className="w-4 h-4 text-violet-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Seuil gratuit moy.</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">
            {avgThreshold !== null ? `${avgThreshold} €` : 'N/A'}
          </div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-orange-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <MapPin className="w-4 h-4 text-orange-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Codes postaux</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{totalPostalCodes}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Zone</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Codes postaux</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tarif</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Seuil gratuit</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {zones.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">Aucune zone configurée</p>
                  <button
                    onClick={() => handleOpenModal()}
                    className="mt-3 text-sm text-gray-900 underline underline-offset-2 hover:no-underline"
                  >
                    Créer une première zone
                  </button>
                </td>
              </tr>
            ) : (
              zones.map((zone, idx) => (
                <tr
                  key={zone.id}
                  className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{zone.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">
                    {zone.postal_codes.slice(0, 3).join(', ')}
                    {zone.postal_codes.length > 3 ? (
                      <span className="text-gray-400"> +{zone.postal_codes.length - 3}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 tabular-nums">
                    {zone.delivery_fee} €
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 tabular-nums">
                    {zone.free_delivery_threshold ? `${zone.free_delivery_threshold} €` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenModal(zone)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(zone.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
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

      {/* Zone modal */}
      {showModal && (
        <DeliveryZoneModal
          editingZone={editingZone}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); }}
        />
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer cette zone ?</h3>
            <p className="text-sm text-gray-500 mb-6">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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
