import { Navigation, Plus } from 'lucide-react';

interface AddressEmptyStateProps {
  onAdd: () => void;
}

export default function AddressEmptyState({ onAdd }: AddressEmptyStateProps) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
      <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-[#33ffcc]/10 rounded-full animate-pulse"></div>
        <Navigation className="w-12 h-12 text-white/30" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">Aucune adresse enregistree</h3>
      <p className="text-white/60 mb-8 max-w-md mx-auto">
        Ajoutez votre premiere adresse de livraison pour faciliter vos futures reservations
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-8 py-4 bg-[#33ffcc] text-[#000033] font-bold rounded-xl hover:bg-[#4fffdd] transition-all"
      >
        <Plus className="w-5 h-5" />
        Ajouter ma premiere adresse
      </button>
    </div>
  );
}
