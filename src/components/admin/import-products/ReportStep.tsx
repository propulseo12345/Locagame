import { CheckCircle, AlertTriangle } from 'lucide-react';
import { ImportReport } from './types';

interface ReportStepProps {
  report: ImportReport;
}

export function ReportStep({ report }: ReportStepProps) {
  return (
    <div className="space-y-6">
      <div className={`rounded-lg p-6 text-center ${report.errors.length === 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
        {report.errors.length === 0 ? (
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        ) : (
          <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        )}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Import termine</h3>
        <p className="text-gray-600">
          {report.success} / {report.total} produits importes avec succes
        </p>
      </div>

      {report.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">Erreurs ({report.errors.length})</h4>
          <ul className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
            {report.errors.map((e, i) => (
              <li key={i}>
                {e.index >= 0 ? `Ligne ${e.index + 2} : ` : ''}{e.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
