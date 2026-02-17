import { ProductFormData } from './types';

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

export default function ProductPricingSection({ formData, setFormData }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Tarification</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix 1 jour (EUR)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.pricing.oneDay}
            onChange={(e) => setFormData({
              ...formData,
              pricing: { ...formData.pricing, oneDay: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix week-end (EUR)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.pricing.weekend}
            onChange={(e) => setFormData({
              ...formData,
              pricing: { ...formData.pricing, weekend: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix semaine (EUR)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.pricing.week}
            onChange={(e) => setFormData({
              ...formData,
              pricing: { ...formData.pricing, week: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
          />
        </div>
      </div>

      {/* Coefficient multi-jours */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coefficient multi-jours
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.01"
                min="0.50"
                max="1.00"
                value={formData.multi_day_coefficient}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  const clampedValue = Math.min(1.00, Math.max(0.50, value || 1.00));
                  setFormData({ ...formData, multi_day_coefficient: clampedValue });
                }}
                className={`w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent ${
                  formData.multi_day_coefficient < 0.50 || formData.multi_day_coefficient > 1.00
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              {formData.multi_day_coefficient < 1.00 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  -{Math.round((1 - formData.multi_day_coefficient) * 100)}%
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Applique automatiquement a partir de 2 jours de location. Ex: 0.85 = -15% sur le total.
              <br />
              Bornes : minimum 0.50 (-50%), maximum 1.00 (pas de reduction)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
