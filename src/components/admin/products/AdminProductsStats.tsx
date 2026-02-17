import { Product } from '../../../types';

interface AdminProductsStatsProps {
  products: Product[];
}

export default function AdminProductsStats({ products }: AdminProductsStatsProps) {
  const activeCount = products.filter(p => p.is_active).length;
  const inactiveCount = products.filter(p => !p.is_active).length;
  const totalStock = products.reduce((sum, p) => sum + (p.total_stock || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Total produits</div>
        <div className="text-2xl font-bold text-gray-900">{products.length}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Actifs</div>
        <div className="text-2xl font-bold text-green-600">{activeCount}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Inactifs</div>
        <div className="text-2xl font-bold text-yellow-600">{inactiveCount}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Stock total</div>
        <div className="text-2xl font-bold text-gray-900">{totalStock}</div>
      </div>
    </div>
  );
}
