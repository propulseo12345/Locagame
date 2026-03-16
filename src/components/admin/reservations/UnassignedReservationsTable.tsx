import { AlertTriangle } from 'lucide-react';

interface UnassignedAlertProps {
  count: number;
  onViewUnassigned: () => void;
}

export default function UnassignedReservationsTable({
  count,
  onViewUnassigned,
}: UnassignedAlertProps) {
  if (count === 0) return null;

  return (
    <div className="bg-red-50 border-l-4 border-l-red-500 rounded-r-lg p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {count} commande{count > 1 ? 's' : ''} nécessite{count > 1 ? 'nt' : ''} une assignation
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Ces réservations en livraison n'ont pas de technicien assigné
            </p>
          </div>
        </div>
        <button
          onClick={onViewUnassigned}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
        >
          Voir et assigner &rarr;
        </button>
      </div>
    </div>
  );
}
