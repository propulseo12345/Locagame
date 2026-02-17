import { Upload } from 'lucide-react';

interface UploadStepProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadStep({ fileInputRef, onFileUpload }: UploadStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 transition-colors">
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Glissez un fichier Excel ou cliquez pour choisir
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Format attendu : .xlsx avec les colonnes name, slug, category_id, description, price_one_day, price_weekend, price_week, total_stock
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          Choisir un fichier
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileUpload}
          className="hidden"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Format du template</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>name</strong> (requis) - Nom du produit</p>
          <p><strong>slug</strong> (optionnel) - URL slug, auto-genere si vide</p>
          <p><strong>category_id</strong> (requis) - Slug de la categorie (ex: "casino-poker")</p>
          <p><strong>description</strong> - Description du produit</p>
          <p><strong>price_one_day</strong> / <strong>price_weekend</strong> / <strong>price_week</strong> - Tarifs en euros</p>
          <p><strong>total_stock</strong> - Quantite en stock</p>
        </div>
      </div>
    </div>
  );
}
