interface TechniciansStatsProps {
  stats: { total: number; active: number; inactive: number };
}

export default function TechniciansStats({ stats }: TechniciansStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Total</div>
        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Actifs</div>
        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Inactifs</div>
        <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
      </div>
    </div>
  );
}
