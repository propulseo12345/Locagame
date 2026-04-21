import { FileText, RefreshCw } from 'lucide-react';
import { ProductFormData } from './types';

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  categories: any[];
}

export default function ProductBasicInfoSection({ formData, setFormData, categories }: Props) {
  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, slug });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <FileText className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">Informations generales</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nom du produit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Slug (URL)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.slug}
              readOnly
              className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="h-10 px-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-sm"
              title="Regenerer depuis le nom"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerer
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Catégorie
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors resize-y"
            required
          />
          <p className="mt-1 text-xs text-gray-400">
            {formData.description.length} caracteres
          </p>
        </div>
      </div>
    </div>
  );
}
