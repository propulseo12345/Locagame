import type { Technician } from '../../../services/technicians.service';

interface TechniciansDeleteModalProps {
  technician: Technician;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TechniciansDeleteModal({
  technician,
  deleting,
  onConfirm,
  onCancel,
}: TechniciansDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Supprimer le technicien
        </h3>
        <p className="text-gray-600 mb-1">
          Voulez-vous supprimer{' '}
          <strong>
            {technician.first_name} {technician.last_name}
          </strong>{' '}
          ?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Si des tâches de livraison sont liées, le compte sera désactivé au lieu d'être supprimé.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}
