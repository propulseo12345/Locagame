import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, MoreVertical, Trash2 } from 'lucide-react';
import { Product } from '../../../types';

interface AdminProductsTableProps {
  products: Product[];
  categories: Array<{ id: string; name: string }>;
  onDelete: (productId: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  maintenance: 'Maintenance',
};

export default function AdminProductsTable({ products, categories, onDelete }: AdminProductsTableProps) {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix/jour</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réservations</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const categoryName = categories.find(c => c.id === product.category_id)?.name || 'N/A';
              const productStatus = product.is_active ? 'active' : 'inactive';
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {product.description ? product.description.substring(0, 50) + '...' : 'Aucune description'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{categoryName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.total_stock || 0}</div>
                    {(product.total_stock || 0) === 0 && (
                      <div className="text-xs text-red-600">Rupture</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xl font-bold text-gray-900">{product.pricing?.oneDay || 0}€</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[productStatus] || 'bg-gray-100'}`}>
                      {STATUS_LABELS[productStatus] || productStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">-</div>
                    <div className="text-xs text-gray-500">-</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 relative">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="text-[#33ffcc] hover:text-[#66cccc] mr-2"
                        title="Voir et modifier le produit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <div className="relative menu-container">
                        <button
                          onClick={() => setShowMenu(showMenu === product.id ? null : product.id)}
                          className="text-gray-600 hover:text-gray-900 p-1"
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
                              onClick={() => {
                                onDelete(product.id);
                                setShowMenu(null);
                              }}
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
            })}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun produit trouvé
        </div>
      )}
    </div>
  );
}
