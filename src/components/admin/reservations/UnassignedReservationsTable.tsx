import { AlertTriangle } from 'lucide-react';

interface UnassignedAlertProps {
  count: number;
}

export default function UnassignedReservationsTable({
  count,
}: UnassignedAlertProps) {
  if (count === 0) return null;

  return (
    <div className="bg-red-50 border-l-4 border-l-red-500 rounded-r-lg p-4">
      <div className="flex items-center gap-3">
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
    </div>
  );
}
