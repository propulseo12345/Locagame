import { Plus } from 'lucide-react';

interface AddNewAddressCardProps {
  onAdd: () => void;
}

export default function AddNewAddressCard({ onAdd }: AddNewAddressCardProps) {
  return (
    <button
      onClick={onAdd}
      className="group bg-white/[0.015] border border-dashed border-white/[0.08] rounded-xl p-4 hover:border-[#33ffcc]/20 hover:bg-white/[0.03] transition-all duration-200 flex flex-col items-center justify-center min-h-[160px]"
    >
      <div className="w-10 h-10 rounded-lg bg-white/[0.04] group-hover:bg-[#33ffcc]/10 flex items-center justify-center mb-3 transition-colors">
        <Plus className="w-5 h-5 text-gray-500 group-hover:text-[#33ffcc] transition-colors" />
      </div>
      <p className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Ajouter une adresse</p>
    </button>
  );
}
