import { Save, ExternalLink, Trash2, Copy, Settings, Package, Info } from 'lucide-react';
import { Product } from '../../../types';
import { ProductFormData } from './types';
import { useState } from 'react';

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  product: Product;
  saving: boolean;
  onSubmit: () => void;
}

export default function ProductSidebarSection({ formData, setFormData, product, saving, onSubmit }: Props) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(product.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Statut */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Statut</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Actif</label>
            <button
              type="button"
              role="switch"
              aria-checked={formData.is_active}
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formData.is_active ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                formData.is_active ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Vedette</label>
            <button
              type="button"
              role="switch"
              aria-checked={formData.featured}
              onClick={() => setFormData({ ...formData, featured: !formData.featured })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formData.featured ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                formData.featured ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Stock</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, total_stock: Math.max(0, formData.total_stock - 1) })}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition-colors"
          >
            -
          </button>
          <input
            type="number"
            min="0"
            value={formData.total_stock}
            onChange={(e) => setFormData({ ...formData, total_stock: parseInt(e.target.value) || 0 })}
            className="w-16 h-10 px-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
          />
          <button
            type="button"
            onClick={() => setFormData({ ...formData, total_stock: formData.total_stock + 1 })}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition-colors"
          >
            +
          </button>
          <span className="text-xs text-gray-400 ml-2">unites</span>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
        <a
          href={`/produit/${formData.slug || product.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-10 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Voir sur le site
        </a>
        <button
          type="button"
          className="w-full text-sm text-red-500 hover:text-red-700 py-2 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer le produit
        </button>
      </div>

      {/* Infos */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Informations</h3>
        </div>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Cree le</span>
            <span className="text-gray-700">{new Date(product.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
          {product.updated_at && (
            <div className="flex items-center justify-between">
              <span>Modifie le</span>
              <span className="text-gray-700">{new Date(product.updated_at).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>ID</span>
            <button
              type="button"
              onClick={copyId}
              className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors"
              title="Copier l'ID"
            >
              <span className="font-mono">{product.id.slice(0, 8)}...</span>
              <Copy className="w-3 h-3" />
              {copied && <span className="text-green-600 text-[10px]">Copie !</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
