import { useMemo } from 'react';
import { Euro } from 'lucide-react';
import { ProductFormData } from './types';
import { calculateLocagamePrice, formatPrice } from '../../../utils/pricing';

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

export default function ProductPricingSection({ formData, setFormData }: Props) {
  const simulations = useMemo(() => {
    const price = formData.pricing.oneDay;
    if (!price || price <= 0) return null;
    return [
      { label: '1 jour', days: 1, price: calculateLocagamePrice(price, 1) },
      { label: '2 jours', days: 2, price: calculateLocagamePrice(price, 2) },
      { label: '5 jours', days: 5, price: calculateLocagamePrice(price, 5) },
      { label: '10 jours', days: 10, price: calculateLocagamePrice(price, 10) },
    ];
  }, [formData.pricing.oneDay]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Euro className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">Tarification</h2>
      </div>

      <div className="space-y-5">
        {/* Prix journalier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Prix journalier de base <span className="text-red-500">*</span>
          </label>
          <div className="relative w-48">
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.pricing.oneDay || ''}
              onChange={(e) => setFormData({
                ...formData,
                pricing: { ...formData.pricing, oneDay: parseFloat(e.target.value) || 0 }
              })}
              className="w-full h-10 pl-3 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">EUR</span>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Les prix multi-jours sont calcules automatiquement par le moteur de tarification LOCAGAME.
          </p>
        </div>

        {/* Simulation tarifaire */}
        {simulations && (
          <div className="border border-gray-100 rounded-lg bg-gray-50/50 p-4">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Simulation tarifaire
            </p>
            <div className="grid grid-cols-4 gap-3">
              {simulations.map((sim) => (
                <div key={sim.days} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{sim.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{formatPrice(sim.price)}</p>
                  {sim.days > 1 && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatPrice(sim.price / sim.days)}/j
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coefficient multi-jours */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
              className="w-28 h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
            />
            {formData.multi_day_coefficient < 1.00 && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ring-1 ring-green-200 bg-green-50 text-green-700">
                -{Math.round((1 - formData.multi_day_coefficient) * 100)}%
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Applique a partir de 2 jours. Min 0.50 (-50%), max 1.00 (pas de reduction).
          </p>
        </div>
      </div>
    </div>
  );
}
