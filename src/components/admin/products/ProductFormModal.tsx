import { X } from 'lucide-react';
import { Product } from '../../../types';
import { ProductFormData } from '../../../hooks/admin/useProductForm';
import ProductImagesForm from './ProductImagesForm';
import ProductSpecsForm from './ProductSpecsForm';

interface ProductFormModalProps {
  editingProduct: Product | null;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Array<{ id: string; name: string }>;
  newImageUrl: string;
  onNewImageUrlChange: (url: string) => void;
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function ProductFormModal({
  editingProduct,
  formData,
  setFormData,
  categories,
  newImageUrl,
  onNewImageUrlChange,
  onAddImage,
  onRemoveImage,
  onSubmit,
  onClose,
}: ProductFormModalProps) {
  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="auto-généré depuis le nom"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className={inputClass}
              >
                <option value="">Sélectionner une catégorie...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Images */}
          <ProductImagesForm
            images={formData.images}
            newImageUrl={newImageUrl}
            onNewImageUrlChange={onNewImageUrlChange}
            onAddImage={onAddImage}
            onRemoveImage={onRemoveImage}
          />

          {/* Tarification */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tarification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix 1 jour (€) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.pricing.oneDay}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, oneDay: parseFloat(e.target.value) || 0 },
                  }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix week-end (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricing.weekend}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, weekend: parseFloat(e.target.value) || 0 },
                  }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix semaine (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricing.week}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, week: parseFloat(e.target.value) || 0 },
                  }))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Spécifications */}
          <ProductSpecsForm
            specifications={formData.specifications}
            onChange={(specs) => setFormData(prev => ({ ...prev, specifications: specs }))}
          />

          {/* Stock et Statut */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock et Statut</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock total *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.total_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_stock: parseInt(e.target.value) || 0 }))}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
                  />
                  <span className="text-sm font-medium text-gray-700">Produit actif</span>
                </label>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
                  />
                  <span className="text-sm font-medium text-gray-700">Produit vedette</span>
                </label>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">SEO (Optionnel)</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                placeholder="Titre pour les moteurs de recherche"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea
                rows={2}
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="Description pour les moteurs de recherche"
                className={inputClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
            >
              {editingProduct ? 'Enregistrer' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
