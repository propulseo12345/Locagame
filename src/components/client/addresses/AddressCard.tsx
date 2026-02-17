import { Star, Trash2, Home, Check, Loader2 } from 'lucide-react';
import type { Address } from '../../../hooks/client/useClientAddresses';

interface AddressCardProps {
  address: Address;
  index: number;
  deletingId: string | null;
  settingDefaultId: string | null;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AddressCard({
  address,
  index,
  deletingId,
  settingDefaultId,
  onSetDefault,
  onDelete,
}: AddressCardProps) {
  return (
    <div
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
          Par defaut
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
                onClick={() => onSetDefault(address.id)}
                disabled={settingDefaultId === address.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-[#33ffcc]/10 border border-white/10 hover:border-[#33ffcc]/30 text-white hover:text-[#33ffcc] font-medium rounded-xl transition-all text-sm disabled:opacity-50"
              >
                {settingDefaultId === address.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
                Par defaut
              </button>
              <button
                onClick={() => onDelete(address.id)}
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
  );
}
