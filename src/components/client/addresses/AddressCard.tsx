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
      className={`group bg-white/[0.03] rounded-xl border overflow-hidden transition-all duration-200 ${
        address.is_default
          ? 'border-[#33ffcc]/20'
          : 'border-white/[0.06] hover:border-white/[0.12]'
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            address.is_default ? 'bg-[#33ffcc]/10' : 'bg-white/[0.04]'
          }`}>
            <Home className={`w-4 h-4 ${address.is_default ? 'text-[#33ffcc]' : 'text-gray-500'}`} />
          </div>
          {address.is_default && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#33ffcc]/10 rounded text-[10px] font-medium text-[#33ffcc]">
              <Star className="w-2.5 h-2.5 fill-current" />
              Par défaut
            </span>
          )}
        </div>

        {/* Address */}
        <div className="space-y-0.5 mb-4">
          <p className="text-sm font-medium text-white">{address.address_line1}</p>
          {address.address_line2 && (
            <p className="text-xs text-gray-400">{address.address_line2}</p>
          )}
          <p className="text-xs text-gray-400">
            {address.postal_code} {address.city}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
          {!address.is_default ? (
            <>
              <button
                onClick={() => onSetDefault(address.id)}
                disabled={settingDefaultId === address.id}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] text-xs font-medium text-gray-400 hover:text-[#33ffcc] border border-white/[0.06] hover:border-[#33ffcc]/20 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
              >
                {settingDefaultId === address.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Star className="w-3.5 h-3.5" />
                )}
                Par défaut
              </button>
              <button
                onClick={() => onDelete(address.id)}
                disabled={deletingId === address.id}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
              >
                {deletingId === address.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-[#33ffcc] text-xs">
              <Check className="w-3.5 h-3.5" />
              Adresse principale
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
