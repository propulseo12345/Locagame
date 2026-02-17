import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ValidationResult } from './types';

interface PreviewStepProps {
  fileName: string;
  validationResults: ValidationResult[];
  importMode: 'upsert' | 'insert';
  setImportMode: (mode: 'upsert' | 'insert') => void;
}

export function PreviewStep({ fileName, validationResults, importMode, setImportMode }: PreviewStepProps) {
  const errorCount = validationResults.filter(r => r.errors.length > 0).length;
  const warningCount = validationResults.filter(r => r.warnings.length > 0 && r.errors.length === 0).length;
  const validCount = validationResults.filter(r => r.errors.length === 0).length;

  return (
    <div className="space-y-4">
      {/* Summary badges */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm text-gray-600">
          Fichier : <strong>{fileName}</strong> ({validationResults.length} lignes)
        </span>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          {validCount} valides
        </span>
        {warningCount > 0 && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {warningCount} avertissements
          </span>
        )}
        {errorCount > 0 && (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {errorCount} erreurs
          </span>
        )}
      </div>

      {/* Import mode */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Mode :</label>
        <select
          value={importMode}
          onChange={(e) => setImportMode(e.target.value as 'upsert' | 'insert')}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400"
        >
          <option value="upsert">Upsert (mise a jour si existant)</option>
          <option value="insert">Insert only (nouveaux uniquement)</option>
        </select>
      </div>

      {/* Errors summary */}
      {errorCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-800">{errorCount} lignes avec erreurs (ne seront pas importees)</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
            {validationResults
              .filter(r => r.errors.length > 0)
              .slice(0, 10)
              .map((r) => (
                <li key={r.rowIndex}>
                  Ligne {r.rowIndex} ({r.row.name || '?'}) : {r.errors.join(', ')}
                </li>
              ))}
            {errorCount > 10 && (
              <li className="italic">... et {errorCount - 10} autres erreurs</li>
            )}
          </ul>
        </div>
      )}

      {/* Preview table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categorie</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix/jour</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix WE</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix sem.</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {validationResults.slice(0, 20).map((r) => {
              const hasError = r.errors.length > 0;
              const hasWarning = r.warnings.length > 0;
              const rowBg = hasError ? 'bg-red-50' : hasWarning ? 'bg-yellow-50' : '';
              return (
                <tr key={r.rowIndex} className={rowBg}>
                  <td className="px-3 py-2 text-gray-500">{r.rowIndex}</td>
                  <td className="px-3 py-2">
                    {hasError ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : hasWarning ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900 max-w-[200px] truncate">{r.row.name}</td>
                  <td className="px-3 py-2 text-gray-600 max-w-[150px] truncate">{r.row.slug}</td>
                  <td className="px-3 py-2 text-gray-600">{r.row.category_id}</td>
                  <td className="px-3 py-2 text-gray-900">{r.row.price_one_day}€</td>
                  <td className="px-3 py-2 text-gray-900">{r.row.price_weekend}€</td>
                  <td className="px-3 py-2 text-gray-900">{r.row.price_week}€</td>
                  <td className="px-3 py-2 text-gray-900">{r.row.total_stock}</td>
                  <td className="px-3 py-2 text-xs">
                    {hasError && <span className="text-red-600">{r.errors.join('; ')}</span>}
                    {hasWarning && !hasError && <span className="text-yellow-600">{r.warnings.join('; ')}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {validationResults.length > 20 && (
          <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-t">
            ... et {validationResults.length - 20} lignes supplementaires
          </div>
        )}
      </div>
    </div>
  );
}
