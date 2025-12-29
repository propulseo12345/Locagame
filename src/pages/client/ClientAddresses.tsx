import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AddressesService, AddressInput, Address } from '../../services/addresses.service';
import {
  MapPin,
  Plus,
  X,
  Star,
  Trash2,
  Home,
  Building2,
  Edit3,
  Check,
  Loader2,
  Navigation,
  Sparkles
} from 'lucide-react';

export default function ClientAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const [formData, setFormData] = useState<AddressInput & { label?: string }>({
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    is_default: false,
    label: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'client') return;
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;

    try {
      setLoadingAddresses(true);
      const addressesData = await AddressesService.getCustomerAddresses(user.id);
      setAddresses(addressesData);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        city: address.city,
        postal_code: address.postal_code,
        is_default: address.is_default,
        label: '',
      });
    } else {
      setEditingAddress(null);
      setFormData({
        address_line1: '',
        address_line2: '',
        city: '',
        postal_code: '',
        is_default: addresses.length === 0,
        label: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setFormData({
      address_line1: '',
      address_line2: '',
      city: '',
      postal_code: '',
      is_default: false,
      label: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const addressData: AddressInput = {
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        postal_code: formData.postal_code,
        is_default: formData.is_default || false,
      };

      await AddressesService.createAddress(user.id, addressData);
      await loadAddresses();
      handleCloseModal();
    } catch (error) {
      console.error('Error creating address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) return;

    setDeletingId(addressId);
    try {
      await AddressesService.deleteAddress(addressId);
      await loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    setSettingDefaultId(addressId);
    try {
      await AddressesService.setDefaultAddress(user.id, addressId);
      await loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    } finally {
      setSettingDefaultId(null);
    }
  };

  if (loadingAddresses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#33ffcc] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Chargement des adresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6 md:mt-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#33ffcc]/20 via-[#66cccc]/10 to-transparent backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#33ffcc]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#33ffcc]/20 rounded-2xl">
              <MapPin className="w-8 h-8 text-[#33ffcc]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Mes adresses</h1>
              <p className="text-white/60">
                {addresses.length} adresse{addresses.length > 1 ? 's' : ''} enregistrée{addresses.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#4fffdd] transition-all hover:shadow-[0_0_30px_rgba(51,255,204,0.3)]"
          >
            <Plus className="w-5 h-5" />
            Ajouter une adresse
          </button>
        </div>
      </div>

      {addresses.length === 0 ? (
        /* Empty State */
        <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-[#33ffcc]/10 rounded-full animate-pulse"></div>
            <Navigation className="w-12 h-12 text-white/30" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Aucune adresse enregistrée</h3>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Ajoutez votre première adresse de livraison pour faciliter vos futures réservations
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#4fffdd] transition-all"
          >
            <Plus className="w-5 h-5" />
            Ajouter ma première adresse
          </button>
        </div>
      ) : (
        /* Addresses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {addresses.map((address, index) => (
            <div
              key={address.id}
              className={`group relative bg-white/[0.03] backdrop-blur-md rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                address.is_default
                  ? 'border-[#33ffcc]/50 shadow-lg shadow-[#33ffcc]/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Default badge */}
              {address.is_default && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-[#33ffcc] text-[#000033] rounded-full text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Par défaut
                </div>
              )}

              <div className="p-6">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                  address.is_default ? 'bg-[#33ffcc]/20' : 'bg-white/10'
                }`}>
                  <Home className={`w-6 h-6 ${address.is_default ? 'text-[#33ffcc]' : 'text-white/60'}`} />
                </div>

                {/* Address details */}
                <div className="space-y-2 mb-6">
                  <p className="text-white font-medium">{address.address_line1}</p>
                  {address.address_line2 && (
                    <p className="text-white/60 text-sm">{address.address_line2}</p>
                  )}
                  <p className="text-white/80">
                    {address.postal_code} {address.city}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  {!address.is_default && (
                    <>
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        disabled={settingDefaultId === address.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-[#33ffcc]/10 border border-white/10 hover:border-[#33ffcc]/30 text-white hover:text-[#33ffcc] font-medium rounded-xl transition-all text-sm disabled:opacity-50"
                      >
                        {settingDefaultId === address.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                        Par défaut
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        disabled={deletingId === address.id}
                        className="flex items-center justify-center p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl transition-all disabled:opacity-50"
                      >
                        {deletingId === address.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
                  {address.is_default && (
                    <div className="flex items-center gap-2 text-[#33ffcc] text-sm">
                      <Check className="w-4 h-4" />
                      <span>Adresse principale</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add New Address Card */}
          <button
            onClick={() => handleOpenModal()}
            className="group relative bg-white/[0.02] backdrop-blur-md rounded-2xl border-2 border-dashed border-white/20 p-6 hover:border-[#33ffcc]/50 hover:bg-white/[0.03] transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-[#33ffcc]/10 flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-8 h-8 text-white/40 group-hover:text-[#33ffcc] transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ajouter une adresse</h3>
            <p className="text-sm text-white/50 text-center">
              Nouvelle adresse de livraison
            </p>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#000033] rounded-2xl shadow-2xl max-w-lg w-full border border-white/10 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#33ffcc]/20 rounded-xl">
                  <MapPin className="w-5 h-5 text-[#33ffcc]" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editingAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                    placeholder="Numéro et nom de rue"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#33ffcc]/50 focus:border-[#33ffcc]/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Complément d'adresse
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    placeholder="Appartement, étage, bâtiment..."
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
                  <p className="text-white font-medium">Définir comme adresse par défaut</p>
                  <p className="text-sm text-white/50">Cette adresse sera utilisée automatiquement</p>
                </div>
              </label>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
      )}
    </div>
  );
}
