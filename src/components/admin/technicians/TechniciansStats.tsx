import { Users, UserCheck, UserX } from 'lucide-react';

interface TechniciansStatsProps {
  stats: { total: number; active: number; inactive: number };
}

export default function TechniciansStats({ stats }: TechniciansStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="relative bg-white rounded-xl border border-gray-200 border-l-4 border-l-gray-400 p-4 hover:shadow-md transition-all">
        <Users className="absolute top-4 right-4 w-5 h-5 text-gray-300" />
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total</div>
        <div className="text-2xl font-bold tabular-nums text-gray-900">{stats.total}</div>
      </div>
      <div className="relative bg-white rounded-xl border border-gray-200 border-l-4 border-l-green-500 p-4 hover:shadow-md transition-all">
        <UserCheck className="absolute top-4 right-4 w-5 h-5 text-green-300" />
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Actifs</div>
        <div className="text-2xl font-bold tabular-nums text-gray-900">{stats.active}</div>
      </div>
      <div className="relative bg-white rounded-xl border border-gray-200 border-l-4 border-l-red-400 p-4 hover:shadow-md transition-all">
        <UserX className="absolute top-4 right-4 w-5 h-5 text-red-300" />
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Inactifs</div>
        <div className="text-2xl font-bold tabular-nums text-gray-900">{stats.inactive}</div>
      </div>
    </div>
  );
}
