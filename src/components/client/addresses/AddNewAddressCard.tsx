import { Plus } from 'lucide-react';

interface AddNewAddressCardProps {
  onAdd: () => void;
}

export default function AddNewAddressCard({ onAdd }: AddNewAddressCardProps) {
  return (
    <button
      onClick={onAdd}
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
  );
}
