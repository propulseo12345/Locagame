import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, MoreVertical, Trash2, Package } from 'lucide-react';
import { Product } from '../../../types';

interface AdminProductsTableProps {
  products: Product[];
  categories: Array<{ id: string; name: string }>;
  onDelete: (productId: string) => void;
  loading?: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  active: 'ring-1 ring-green-200 bg-green-50 text-green-700',
  inactive: 'ring-1 ring-gray-200 bg-gray-50 text-gray-600',
  maintenance: 'ring-1 ring-yellow-200 bg-yellow-50 text-yellow-700',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  maintenance: 'Maintenance',
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-40 mb-1" />
        <div className="h-3 bg-gray-100 rounded w-28" />
      </td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8" /></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-12 ml-auto" /></td>
    </tr>
  );
}

export default function AdminProductsTable({ products, categories, onDelete, loading = false }: AdminProductsTableProps) {
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menu-container')) {
        setShowMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Produit</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Prix/jour</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Réservations</th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">Aucun produit trouvé</p>
                </td>
              </tr>
            ) : (
              products.map((product, idx) => {
                const categoryName = categories.find(c => c.id === product.category_id)?.name || 'N/A';
                const productStatus = product.is_active ? 'active' : 'inactive';
                return (
                  <tr
                    key={product.id}
                    className={`border-l-4 ${product.is_active ? 'border-l-green-400' : 'border-l-gray-300'} ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-gray-100/60 transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-400 line-clamp-1">
                        {product.description ? product.description.substring(0, 50) + '...' : 'Aucune description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{categoryName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.total_stock || 0}</div>
                      {(product.total_stock || 0) === 0 && (
                        <div className="text-xs text-red-500">Rupture</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold tabular-nums text-gray-900">{product.pricing?.oneDay || 0}€</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${STATUS_BADGE[productStatus] || 'ring-1 ring-gray-200 bg-gray-50 text-gray-600'}`}>
                        {STATUS_LABELS[productStatus] || productStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">-</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 relative">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <div className="relative menu-container">
                          <button
                            onClick={() => setShowMenu(showMenu === product.id ? null : product.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {showMenu === product.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <Link
                                to={`/admin/products/${product.id}`}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => setShowMenu(null)}
                              >
                                <Edit2 className="w-4 h-4" />
                                Modifier
                              </Link>
                              <button
                                onClick={() => { onDelete(product.id); setShowMenu(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
