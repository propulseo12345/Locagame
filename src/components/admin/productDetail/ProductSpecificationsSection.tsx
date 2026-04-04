import { Wrench, Users, Plus, Minus } from 'lucide-react';
import { ProductFormData } from './types';

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

function stripHtml(value: any): string {
  if (typeof value !== 'string') return String(value || '');
  return value.replace(/<[^>]*>/g, '').trim();
}

export default function ProductSpecificationsSection({ formData, setFormData }: Props) {
  const updateSpec = (key: string, value: any) => {
    setFormData({
      ...formData,
      specifications: { ...formData.specifications, [key]: value }
    });
  };

  const updatePlayer = (key: 'min' | 'max', value: string) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        players: { ...formData.specifications.players, [key]: parseInt(value) || 1 }
      }
    });
  };

  const adjustCount = (field: 'delivery_people_count' | 'pickup_people_count', delta: number) => {
    setFormData({ ...formData, [field]: Math.max(1, formData[field] + delta) });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Wrench className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">Specifications techniques</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Dimensions</label>
          <textarea
            value={stripHtml(formData.specifications.dimensions)}
            onChange={(e) => updateSpec('dimensions', e.target.value)}
            placeholder="Ex: 200 x 100 x 150 cm"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Poids (kg)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.specifications.weight || ''}
            onChange={(e) => updateSpec('weight', parseFloat(e.target.value) || 0)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Temps montage (min)</label>
          <input
            type="number"
            min="0"
            value={formData.specifications.setup_time || ''}
            onChange={(e) => updateSpec('setup_time', parseInt(e.target.value) || 0)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Alimentation</label>
          <input
            type="text"
            value={formData.specifications.power_requirements}
            onChange={(e) => updateSpec('power_requirements', e.target.value)}
            placeholder="Ex: 220V - 300W"
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Joueurs min</label>
            <input
              type="number"
              min="1"
              value={formData.specifications.players.min}
              onChange={(e) => updatePlayer('min', e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Joueurs max</label>
            <input
              type="number"
              min="1"
              value={formData.specifications.players.max}
              onChange={(e) => updatePlayer('max', e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Personnel logistique */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Personnel logistique</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Livraison (pers.)</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => adjustCount('delivery_people_count', -1)}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <input
                type="number"
                min="1"
                value={formData.delivery_people_count}
                onChange={(e) => setFormData({ ...formData, delivery_people_count: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-16 h-10 px-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => adjustCount('delivery_people_count', 1)}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reprise (pers.)</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => adjustCount('pickup_people_count', -1)}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <input
                type="number"
                min="1"
                value={formData.pickup_people_count}
                onChange={(e) => setFormData({ ...formData, pickup_people_count: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-16 h-10 px-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => adjustCount('pickup_people_count', 1)}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
