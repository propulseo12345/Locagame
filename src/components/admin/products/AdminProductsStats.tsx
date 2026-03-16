import { Package, CheckCircle, XCircle, Archive } from 'lucide-react';
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
      <div className="relative bg-white rounded-xl border border-gray-200 border-l-4 border-l-gray-400 p-4 hover:shadow-md transition-all">
        <Package className="absolute top-4 right-4 w-5 h-5 text-gray-300" />
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total produits</div>
        <div className="text-2xl font-bold tabular-nums text-gray-900">{products.length}</div>
      </div>
      <div className="relative bg-white rounded-xl border border-gray-200 border-l-4 border-l-green-500 p-4 hover:shadow-md transition-all">
        <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-green-300" />
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Actifs</div>
        <div className="text-2xl font-bold tabular-nums text-gray-900">{activeCount}</div>
      </div>
      <div className="relative bg-white rounded-xl border border-gray-200 border-l-4 border-l-yellow-500 p-4 hover:shadow-md transition-all">
        <XCircle className="absolute top-4 right-4 w-5 h-5 text-yellow-300" />
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Inactifs</div>
        <div className="text-2xl font-bold tabular-nums text-gray-900">{inactiveCount}</div>
      </div>
      <div className="relative bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 p-4 hover:shadow-md transition-all">
        <Archive className="absolute top-4 right-4 w-5 h-5 text-blue-300" />
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Stock total</div>
        <div className="text-2xl font-bold tabular-nums text-gray-900">{totalStock}</div>
      </div>
    </div>
  );
}
