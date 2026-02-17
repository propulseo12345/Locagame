import {
  CalendarDays,
  Truck,
  Package,
  TrendingUp,
} from 'lucide-react';
import type { MonthStats } from '../../../hooks/technician/useTechnicianDashboard';

interface DashboardStatsCardsProps {
  monthStats: MonthStats;
}

export default function DashboardStatsCards({ monthStats }: DashboardStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#33ffcc]/20 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#33ffcc]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{monthStats.total}</p>
            <p className="text-xs text-gray-500">Interventions</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#33ffcc]/20 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-[#33ffcc]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{monthStats.deliveries}</p>
            <p className="text-xs text-gray-500">Livraisons</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{monthStats.pickups}</p>
            <p className="text-xs text-gray-500">Retraits</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{monthStats.completionRate}%</p>
            <p className="text-xs text-gray-500">Réalisé</p>
          </div>
        </div>
      </div>
    </div>
  );
}
