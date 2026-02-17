import { MapPin, X, Home, Building2, Check, Loader2 } from 'lucide-react';
import type { Address, AddressFormData } from '../../../hooks/client/useClientAddresses';

interface AddressFormModalProps {
  editingAddress: Address | null;
  formData: AddressFormData;
  setFormData: (data: AddressFormData) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function AddressFormModal({
  editingAddress,
  formData,
  setFormData,
  loading,
  onSubmit,
  onClose,
}: AddressFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#000033] rounded-2xl shadow-2xl max-w-lg w-full border border-white/10 overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#33ffcc]/20 rounded-xl">
              <MapPin className="w-5 h-5 text-[#33ffcc]" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {editingAddress ? "Modifier l'adresse" : 'Nouvelle adresse'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Adresse (ligne 1) *
            </label>
            <div className="relative">
              <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                placeholder="Numero et nom de rue"
                className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Complement d'adresse
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                placeholder="Appartement, etage, batiment..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Code postal *
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="13001"
                className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Ville *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Marseille"
                className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                required
              />
            </div>
          </div>

          {/* Default checkbox */}
          <label className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-xl cursor-pointer hover:bg-white/[0.05] transition-colors">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                formData.is_default
                  ? 'bg-[#33ffcc] border-[#33ffcc]'
                  : 'border-white/30 bg-transparent'
              }`}>
                {formData.is_default && <Check className="w-4 h-4 text-[#000033]" />}
              </div>
            </div>
            <div>
              <p className="text-white font-medium">Definir comme adresse par defaut</p>
              <p className="text-sm text-white/50">Cette adresse sera utilisee automatiquement</p>
            </div>
          </label>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-white font-medium rounded-xl hover:bg-white/10 border border-white/20 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#4fffdd] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {editingAddress ? 'Modifier' : 'Ajouter'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
