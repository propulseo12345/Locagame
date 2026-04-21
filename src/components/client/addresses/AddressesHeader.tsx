import { Plus } from 'lucide-react';

interface AddressesHeaderProps {
  count: number;
  onAdd: () => void;
}

export default function AddressesHeader({ count, onAdd }: AddressesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Mes adresses</h1>
        <p className="text-sm text-gray-400 mt-1">
          {count} adresse{count > 1 ? 's' : ''} enregistrée{count > 1 ? 's' : ''}
        </p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-[#33ffcc] text-[#000033] text-sm font-semibold rounded-lg hover:bg-[#4fffdd] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Ajouter
      </button>
    </div>
  );
}
