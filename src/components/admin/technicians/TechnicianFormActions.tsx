interface TechnicianFormActionsProps {
  isEdit: boolean;
  submitting: boolean;
  onClose: () => void;
}

export default function TechnicianFormActions({
  isEdit,
  submitting,
  onClose,
}: TechnicianFormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        Annuler
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
      >
        {submitting ? 'En cours...' : isEdit ? 'Enregistrer' : 'Créer le technicien'}
      </button>
    </div>
  );
}
