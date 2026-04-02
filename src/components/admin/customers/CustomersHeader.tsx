import { Upload, Download, Loader2 } from 'lucide-react';

interface CustomersHeaderProps {
  totalCount: number;
  isExporting: boolean;
  customersExist: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
}

export default function CustomersHeader({
  totalCount,
  isExporting,
  customersExist,
  fileInputRef,
  onExport,
  onImport,
  onDownloadTemplate,
}: CustomersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Clients
          <span className="text-gray-400 font-normal ml-2 text-lg">{totalCount}</span>
        </h1>
        <p className="text-gray-600 mt-0.5 text-sm">Gérez votre base de clients</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDownloadTemplate}
          className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2 hover:no-underline transition-colors"
        >
          Télécharger le modèle
        </button>
        <label className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Importer
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={onImport}
          />
        </label>
        <button
          onClick={onExport}
          disabled={isExporting || !customersExist}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Exporter
        </button>
      </div>
    </div>
  );
}
