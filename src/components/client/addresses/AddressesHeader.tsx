import { MapPin, Plus } from 'lucide-react';

interface AddressesHeaderProps {
  count: number;
  onAdd: () => void;
}

export default function AddressesHeader({ count, onAdd }: AddressesHeaderProps) {
  return (
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
              {count} adresse{count > 1 ? 's' : ''} enregistree{count > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#4fffdd] transition-all hover:shadow-[0_0_30px_rgba(51,255,204,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Ajouter une adresse
        </button>
      </div>
    </div>
  );
}
