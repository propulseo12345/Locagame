import { ProductFormData } from '../../../hooks/admin/useProductForm';

interface ProductSpecsFormProps {
  specifications: ProductFormData['specifications'];
  onChange: (specs: ProductFormData['specifications']) => void;
}

export default function ProductSpecsForm({ specifications, onChange }: ProductSpecsFormProps) {
  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent";

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Spécifications techniques</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Longueur (cm)</label>
          <input
            type="number"
            min="0"
            value={specifications.dimensions.length}
            onChange={(e) =>
              onChange({
                ...specifications,
                dimensions: { ...specifications.dimensions, length: parseInt(e.target.value) || 0 },
              })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Largeur (cm)</label>
          <input
            type="number"
            min="0"
            value={specifications.dimensions.width}
            onChange={(e) =>
              onChange({
                ...specifications,
                dimensions: { ...specifications.dimensions, width: parseInt(e.target.value) || 0 },
              })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hauteur (cm)</label>
          <input
            type="number"
            min="0"
            value={specifications.dimensions.height}
            onChange={(e) =>
              onChange({
                ...specifications,
                dimensions: { ...specifications.dimensions, height: parseInt(e.target.value) || 0 },
              })
            }
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={specifications.weight}
            onChange={(e) =>
              onChange({ ...specifications, weight: parseFloat(e.target.value) || 0 })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Joueurs min</label>
          <input
            type="number"
            min="1"
            value={specifications.players.min}
            onChange={(e) =>
              onChange({
                ...specifications,
                players: { ...specifications.players, min: parseInt(e.target.value) || 1 },
              })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Joueurs max</label>
          <input
            type="number"
            min="1"
            value={specifications.players.max}
            onChange={(e) =>
              onChange({
                ...specifications,
                players: { ...specifications.players, max: parseInt(e.target.value) || 1 },
              })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Montage (min)</label>
          <input
            type="number"
            min="0"
            value={specifications.setup_time}
            onChange={(e) =>
              onChange({ ...specifications, setup_time: parseInt(e.target.value) || 0 })
            }
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alimentation / Exigences</label>
        <input
          type="text"
          value={specifications.power_requirements}
          onChange={(e) =>
            onChange({ ...specifications, power_requirements: e.target.value })
          }
          placeholder="Ex: 220V - 300W, Batterie rechargeable, Aucune"
          className={inputClass}
        />
      </div>
    </div>
  );
}
