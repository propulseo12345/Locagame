interface CustomerImportModalProps {
  result: { success: number; errors: string[] };
  onClose: () => void;
}

export default function CustomerImportModal({ result, onClose }: CustomerImportModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résultat de l'import</h3>
        <div className="flex gap-4 mb-4">
          <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{result.success}</div>
            <div className="text-xs text-green-600 font-medium">Succès</div>
          </div>
          <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-700">{result.errors.length}</div>
            <div className="text-xs text-red-600 font-medium">Erreurs</div>
          </div>
        </div>
        {result.errors.length > 0 && (
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-4">
            {result.errors.map((err, i) => (
              <div key={i} className="text-xs text-red-600 py-1 border-b border-gray-100 last:border-0">
                {err}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
