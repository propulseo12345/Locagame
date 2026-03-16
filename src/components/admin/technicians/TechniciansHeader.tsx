import { Plus } from 'lucide-react';

interface TechniciansHeaderProps {
  onCreateClick: () => void;
  totalCount?: number;
}

export default function TechniciansHeader({ onCreateClick, totalCount }: TechniciansHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Techniciens
          {totalCount !== undefined && (
            <span className="text-gray-400 font-normal ml-2 text-lg">{totalCount}</span>
          )}
        </h1>
        <p className="text-gray-600 mt-0.5 text-sm">Gérez votre équipe de techniciens</p>
      </div>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Nouveau technicien
      </button>
    </div>
  );
}
