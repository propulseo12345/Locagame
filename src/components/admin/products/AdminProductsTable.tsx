import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, MoreVertical, Trash2, Package, Loader2 } from 'lucide-react';
import { Product } from '../../../types';
import { stripHtml } from '../../../utils/html';
import { TableRowSkeleton } from '../../ui/skeletons';

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

/* ------------------------------------------------------------------ */
/*  Mobile product card                                                */
/* ------------------------------------------------------------------ */
function MobileProductCard({
  product,
  categoryName,
}: {
  product: Product;
  categoryName: string;
}) {
  const productStatus = product.is_active ? 'active' : 'inactive';
  const hasMissingPrice = product.is_active && (!product.pricing?.oneDay || product.pricing.oneDay <= 0);

  return (
    <Link
      to={`/admin/products/${product.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-3 active:scale-95 transition-transform"
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-16 h-16 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-gray-300" />
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          {/* Row 1: name + price */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
            {hasMissingPrice ? (
              <span className="shrink-0 text-[10px] font-semibold rounded-md px-1.5 py-0.5 ring-1 ring-red-200 bg-red-50 text-red-700">
                Prix ?
              </span>
            ) : (
              <span className="shrink-0 text-sm font-bold tabular-nums text-gray-900">
                {product.pricing?.oneDay || 0}&euro;
              </span>
            )}
          </div>

          {/* Row 2: category */}
          <p className="text-xs text-gray-500 truncate">{categoryName}</p>

          {/* Row 3: stock + status */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-500">
              Stock: <span className={`font-medium ${(product.total_stock || 0) === 0 ? 'text-red-500' : 'text-gray-900'}`}>{product.total_stock || 0}</span>
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-md ${STATUS_BADGE[productStatus] || 'ring-1 ring-gray-200 bg-gray-50 text-gray-600'}`}>
              {STATUS_LABELS[productStatus] || productStatus}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
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

  const getCategoryName = (product: Product) =>
    categories.find(c => c.id === product.category_id)?.name || 'N/A';

  const emptyState = (
    <div className="py-16 text-center">
      <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-sm font-medium text-gray-500">Aucun produit trouvé</p>
    </div>
  );

  return (
    <>
      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          emptyState
        ) : (
          products.map((product) => (
            <MobileProductCard
              key={product.id}
              product={product}
              categoryName={getCategoryName(product)}
            />
          ))
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Liste des produits">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Produit</th>
                <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Prix/jour</th>
                <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Réservations</th>
                <th scope="col" className="px-6 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton columns={7} rows={6} />
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">Aucun produit trouvé</p>
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => {
                  const categoryName = getCategoryName(product);
                  const productStatus = product.is_active ? 'active' : 'inactive';
                  return (
                    <tr
                      key={product.id}
                      className={`border-l-4 ${product.is_active && (!product.pricing?.oneDay || product.pricing.oneDay <= 0) ? 'border-l-red-400' : product.is_active ? 'border-l-green-400' : 'border-l-gray-300'} ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-gray-100/60 transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-400 line-clamp-1">
                          {product.description ? stripHtml(product.description).substring(0, 50) + '...' : 'Aucune description'}
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
                        {product.is_active && (!product.pricing?.oneDay || product.pricing.oneDay <= 0) ? (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md ring-1 ring-red-200 bg-red-50 text-red-700">
                            Prix manquant
                          </span>
                        ) : (
                          <span className="text-sm font-bold tabular-nums text-gray-900">{product.pricing?.oneDay || 0}&euro;</span>
                        )}
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
                            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors active:scale-95"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <div className="relative menu-container">
                            <button
                              onClick={() => setShowMenu(showMenu === product.id ? null : product.id)}
                              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors active:scale-95"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {showMenu === product.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <Link
                                  to={`/admin/products/${product.id}`}
                                  className="w-full text-left px-4 py-3 min-h-[44px] text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 active:scale-95 transition-transform"
                                  onClick={() => setShowMenu(null)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Modifier
                                </Link>
                                <button
                                  onClick={() => { onDelete(product.id); setShowMenu(null); }}
                                  className="w-full text-left px-4 py-3 min-h-[44px] text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 active:scale-95 transition-transform"
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
    </>
  );
}
