import { Plus } from 'lucide-react';

interface TechniciansHeaderProps {
  onCreateClick: () => void;
}

export default function TechniciansHeader({ onCreateClick }: TechniciansHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Techniciens</h1>
        <p className="text-gray-600 mt-1">Gérez votre équipe de techniciens</p>
      </div>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-4 py-2 bg-[#000033] text-white rounded-lg hover:bg-[#000055] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Nouveau technicien
      </button>
    </div>
  );
}
