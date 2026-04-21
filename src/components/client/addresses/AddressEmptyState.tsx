import { MapPin, Plus } from 'lucide-react';

interface AddressEmptyStateProps {
  onAdd: () => void;
}

export default function AddressEmptyState({ onAdd }: AddressEmptyStateProps) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-12 text-center">
      <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-white mb-2">Aucune adresse</h3>
      <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
        Ajoutez votre première adresse de livraison pour faciliter vos futures réservations
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#33ffcc] text-[#000033] text-sm font-semibold rounded-lg hover:bg-[#4fffdd] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Ajouter une adresse
      </button>
    </div>
  );
}
