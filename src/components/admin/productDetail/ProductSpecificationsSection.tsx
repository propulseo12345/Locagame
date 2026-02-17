import { ProductFormData } from './types';

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

export default function ProductSpecificationsSection({ formData, setFormData }: Props) {
  const updateDimension = (key: 'length' | 'width' | 'height', value: string) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        dimensions: {
          ...formData.specifications.dimensions,
          [key]: parseInt(value) || 0
        }
      }
    });
  };

  const updateSpec = (key: string, value: any) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [key]: value
      }
    });
  };

  const updatePlayer = (key: 'min' | 'max', value: string) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        players: {
          ...formData.specifications.players,
          [key]: parseInt(value) || 1
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications techniques</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longueur (cm)
            </label>
            <input
              type="number"
              min="0"
              value={formData.specifications.dimensions.length}
              onChange={(e) => updateDimension('length', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Largeur (cm)
            </label>
            <input
              type="number"
              min="0"
              value={formData.specifications.dimensions.width}
              onChange={(e) => updateDimension('width', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hauteur (cm)
            </label>
            <input
              type="number"
              min="0"
              value={formData.specifications.dimensions.height}
              onChange={(e) => updateDimension('height', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poids (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.specifications.weight}
              onChange={(e) => updateSpec('weight', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temps de montage (min)
            </label>
            <input
              type="number"
              min="0"
              value={formData.specifications.setup_time}
              onChange={(e) => updateSpec('setup_time', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de joueurs (min)
            </label>
            <input
              type="number"
              min="1"
              value={formData.specifications.players.min}
              onChange={(e) => updatePlayer('min', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de joueurs (max)
            </label>
            <input
              type="number"
              min="1"
              value={formData.specifications.players.max}
              onChange={(e) => updatePlayer('max', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alimentation / Exigences
          </label>
          <input
            type="text"
            value={formData.specifications.power_requirements}
            onChange={(e) => updateSpec('power_requirements', e.target.value)}
            placeholder="Ex: 220V - 300W, Batterie rechargeable, Aucune"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
