import { useState } from 'react';
import { X } from 'lucide-react';
import { DeliveryService } from '../../services';
import { DeliveryZone } from '../../types';

interface DeliveryZoneModalProps {
  editingZone: DeliveryZone | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function DeliveryZoneModal({ editingZone, onClose, onSaved }: DeliveryZoneModalProps) {
  const [formData, setFormData] = useState({
    name: editingZone?.name || '',
    postal_codes: editingZone?.postal_codes.join(', ') || '',
    cities: editingZone?.cities.join(', ') || '',
    delivery_fee: editingZone?.delivery_fee || 0,
    free_delivery_threshold: editingZone?.free_delivery_threshold ?? null as number | null,
    is_active: true,
    display_order: 0
  });

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#33ffcc] focus:outline-none";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const zoneData = {
        name: formData.name,
        postal_codes: formData.postal_codes.split(',').map(s => s.trim()).filter(Boolean),
        cities: formData.cities.split(',').map(s => s.trim()).filter(Boolean),
        delivery_fee: formData.delivery_fee,
        free_delivery_threshold: formData.free_delivery_threshold
      };

      if (editingZone) {
        await DeliveryService.updateZone(editingZone.id, zoneData);
      } else {
        await DeliveryService.createZone(zoneData);
      }
      onSaved();
    } catch (error) {
      console.error('Error saving zone:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#000033] rounded-xl border border-white/10 w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {editingZone ? 'Modifier la zone' : 'Nouvelle zone'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className={labelClass}>Nom de la zone *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Codes postaux (séparés par des virgules)</label>
            <textarea
              value={formData.postal_codes}
              onChange={(e) => setFormData({...formData, postal_codes: e.target.value})}
              className={`${inputClass} resize-none`}
              rows={2}
              placeholder="13001, 13002, 13003..."
            />
          </div>
          <div>
            <label className={labelClass}>Villes (séparées par des virgules)</label>
            <input
              type="text"
              value={formData.cities}
              onChange={(e) => setFormData({...formData, cities: e.target.value})}
              className={inputClass}
              placeholder="Marseille, Aix-en-Provence..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Frais de livraison (€) *</label>
              <input
                type="number"
                value={formData.delivery_fee}
                onChange={(e) => setFormData({...formData, delivery_fee: Number(e.target.value)})}
                className={inputClass}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Seuil gratuité (€)</label>
              <input
                type="number"
                value={formData.free_delivery_threshold || ''}
                onChange={(e) => setFormData({...formData, free_delivery_threshold: e.target.value ? Number(e.target.value) : null})}
                className={inputClass}
                min="0"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#33ffcc] text-[#000033] rounded-lg font-semibold hover:bg-[#66cccc]"
            >
              {editingZone ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
