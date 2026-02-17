import { Product } from '../../../types';
import { ProductFormData } from './types';

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  product: Product;
}

export default function ProductSidebarSection({ formData, setFormData, product }: Props) {
  return (
    <div className="space-y-6">
      {/* Statut et disponibilite */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Statut</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Produit actif</label>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Produit vedette</label>
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
            />
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Disponibilite</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock total
          </label>
          <input
            type="number"
            min="0"
            value={formData.total_stock}
            onChange={(e) => setFormData({ ...formData, total_stock: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Nombre d'unites disponibles en stock
          </p>
        </div>
      </div>

      {/* Informations */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Informations</h3>
        <div className="space-y-1 text-xs text-gray-600">
          <p>Cree le: {new Date(product.created_at).toLocaleDateString('fr-FR')}</p>
          {product.updated_at && (
            <p>Modifie le: {new Date(product.updated_at).toLocaleDateString('fr-FR')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
