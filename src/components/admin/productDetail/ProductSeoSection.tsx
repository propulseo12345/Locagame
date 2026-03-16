import { Search } from 'lucide-react';
import { ProductFormData } from './types';

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

export default function ProductSeoSection({ formData, setFormData }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Search className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">SEO</h2>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">Meta Title</label>
            <span className={`text-xs ${formData.meta_title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.meta_title.length}/60
            </span>
          </div>
          <input
            type="text"
            value={formData.meta_title}
            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
            placeholder="Titre pour les moteurs de recherche"
            maxLength={80}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">Meta Description</label>
            <span className={`text-xs ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.meta_description.length}/160
            </span>
          </div>
          <textarea
            value={formData.meta_description}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            rows={3}
            placeholder="Description pour les moteurs de recherche"
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors resize-y"
          />
        </div>
      </div>
    </div>
  );
}
