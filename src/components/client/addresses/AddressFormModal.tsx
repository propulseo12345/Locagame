import { X, Home, Building2, Check, Loader2 } from 'lucide-react';
import type { Address, AddressFormData } from '../../../hooks/client/useClientAddresses';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

interface AddressFormModalProps {
  editingAddress: Address | null;
  formData: AddressFormData;
  setFormData: (data: AddressFormData) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const inputClass = 'w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#33ffcc]/40 focus:border-[#33ffcc]/30 transition-all';

export default function AddressFormModal({
  editingAddress,
  formData,
  setFormData,
  loading,
  onSubmit,
  onClose,
}: AddressFormModalProps) {
  const containerRef = useFocusTrap(true, onClose);

  return (
    <div ref={containerRef} role="dialog" aria-modal="true" aria-labelledby="address-form-title" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#000033] rounded-xl shadow-2xl max-w-lg w-full border border-white/[0.08] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 id="address-form-title" className="text-sm font-semibold text-white">
            {editingAddress ? "Modifier l'adresse" : 'Nouvelle adresse'}
          </h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Adresse *</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                placeholder="Numéro et nom de rue"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Complément</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                placeholder="Appartement, étage..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Code postal *</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="13001"
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#33ffcc]/40 focus:border-[#33ffcc]/30 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Ville *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Marseille"
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#33ffcc]/40 focus:border-[#33ffcc]/30 transition-all"
                required
              />
            </div>
          </div>

          {/* Default checkbox */}
          <label className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg cursor-pointer hover:bg-white/[0.04] transition-colors">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                formData.is_default
                  ? 'bg-[#33ffcc] border-[#33ffcc]'
                  : 'border-gray-500 bg-transparent'
              }`}>
                {formData.is_default && <Check className="w-3 h-3 text-[#000033]" />}
              </div>
            </div>
            <div>
              <p className="text-sm text-white font-medium">Adresse par défaut</p>
              <p className="text-[11px] text-gray-500">Utilisée automatiquement lors du checkout</p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 min-h-[44px] text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors active:scale-95"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 min-h-[44px] bg-[#33ffcc] text-[#000033] text-sm font-semibold rounded-lg hover:bg-[#4fffdd] transition-colors active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
              ) : (
                editingAddress ? 'Modifier' : 'Ajouter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
