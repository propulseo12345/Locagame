import { useState, useRef } from 'react';
import { X, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CategoriesService } from '../../services';
import { ProductsService } from '../../services';
import {
  ImportRow, ValidationResult, ImportStep, ImportReport,
  slugify, normalizeHeader, EXPECTED_HEADERS
} from './import-products/types';
import { UploadStep } from './import-products/UploadStep';
import { PreviewStep } from './import-products/PreviewStep';
import { ReportStep } from './import-products/ReportStep';

interface ImportProductsModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

export default function ImportProductsModal({ onClose, onImportComplete }: ImportProductsModalProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [fileName, setFileName] = useState('');
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [importMode, setImportMode] = useState<'upsert' | 'insert'>('upsert');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount = validationResults.filter(r => r.errors.length === 0).length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

      if (jsonData.length === 0) { alert('Le fichier est vide.'); return; }

      const rawHeaders = Object.keys(jsonData[0]);
      const headerMap: Record<string, string> = {};
      for (const raw of rawHeaders) { headerMap[normalizeHeader(raw)] = raw; }

      const missingHeaders = EXPECTED_HEADERS.filter(h => !(h in headerMap));
      if (missingHeaders.length > 0) {
        alert(`Colonnes manquantes dans le fichier : ${missingHeaders.join(', ')}\n\nColonnes attendues : ${EXPECTED_HEADERS.join(', ')}`);
        return;
      }

      const rows: ImportRow[] = jsonData.map((raw) => ({
        name: String(raw[headerMap['name']] || '').trim(),
        slug: String(raw[headerMap['slug']] || '').trim(),
        category_id: String(raw[headerMap['category_id']] || '').trim(),
        description: String(raw[headerMap['description']] || '').trim(),
        price_one_day: parseFloat(raw[headerMap['price_one_day']]) || 0,
        price_weekend: parseFloat(raw[headerMap['price_weekend']]) || 0,
        price_week: parseFloat(raw[headerMap['price_week']]) || 0,
        total_stock: parseInt(raw[headerMap['total_stock']], 10) || 0,
      }));

      const categoriesMap = await CategoriesService.getCategoriesMap();

      const slugCounts: Record<string, number> = {};
      const results: ValidationResult[] = rows.map((row, index) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!row.name) errors.push('Nom requis');
        if (!row.category_id) errors.push('Categorie requise');

        const categoryUuid = row.category_id ? categoriesMap.resolve(row.category_id) : null;
        if (row.category_id && !categoryUuid) {
          errors.push(`Categorie inconnue : "${row.category_id}". Valeurs acceptees : ${categoriesMap.slugs.join(', ')}`);
        }

        if (row.price_one_day < 0) errors.push('Prix 1 jour < 0');
        if (row.price_weekend < 0) errors.push('Prix week-end < 0');
        if (row.price_week < 0) errors.push('Prix semaine < 0');
        if (row.total_stock < 0) errors.push('Stock < 0');

        if (!row.slug && row.name) {
          row.slug = slugify(row.name);
          warnings.push('Slug auto-genere');
        }

        if (row.slug) { slugCounts[row.slug] = (slugCounts[row.slug] || 0) + 1; }

        return { row, rowIndex: index + 2, errors, warnings, categoryUuid };
      });

      for (const result of results) {
        if (result.row.slug && slugCounts[result.row.slug] > 1) {
          result.warnings.push(`Slug duplique dans le fichier : "${result.row.slug}"`);
        }
      }

      const seenSlugs: Record<string, number> = {};
      for (const result of results) {
        if (!result.row.slug) continue;
        if (seenSlugs[result.row.slug] !== undefined) {
          seenSlugs[result.row.slug]++;
          result.row.slug = `${result.row.slug}-${seenSlugs[result.row.slug]}`;
        } else {
          seenSlugs[result.row.slug] = 1;
        }
      }

      setValidationResults(results);
      setStep('preview');
    } catch (err) {
      console.error('Error parsing file:', err);
      alert('Erreur lors de la lecture du fichier Excel.');
    }
  };

  const handleImport = async () => {
    setStep('importing');
    const validRows = validationResults.filter(r => r.errors.length === 0);
    const products = validRows.map(r => ({
      name: r.row.name,
      slug: r.row.slug,
      category_id: r.categoryUuid!,
      description: r.row.description,
      pricing: {
        oneDay: r.row.price_one_day,
        weekend: r.row.price_weekend,
        week: r.row.price_week,
        custom: r.row.price_one_day,
      },
      total_stock: r.row.total_stock,
      is_active: true,
    }));

    try {
      const result = await ProductsService.upsertProductsBatch(products);
      setImportReport({ total: validRows.length, success: result.success, errors: result.errors });
    } catch (err: any) {
      setImportReport({ total: validRows.length, success: 0, errors: [{ index: -1, error: err.message || 'Erreur inconnue' }] });
    }
    setStep('report');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Importer des produits</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <UploadStep fileInputRef={fileInputRef} onFileUpload={handleFileUpload} />
          )}
          {step === 'preview' && (
            <PreviewStep
              fileName={fileName}
              validationResults={validationResults}
              importMode={importMode}
              setImportMode={setImportMode}
            />
          )}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-700">Import en cours...</p>
              <p className="text-sm text-gray-500 mt-1">{validCount} produits a traiter</p>
            </div>
          )}
          {step === 'report' && importReport && (
            <ReportStep report={importReport} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          {step === 'upload' && (
            <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
          )}
          {step === 'preview' && (
            <>
              <button
                onClick={() => {
                  setStep('upload');
                  setValidationResults([]);
                  setFileName('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Changer de fichier
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lancer l'import ({validCount} produits)
              </button>
            </>
          )}
          {step === 'report' && (
            <button
              onClick={() => { onImportComplete(); onClose(); }}
              className="px-6 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
