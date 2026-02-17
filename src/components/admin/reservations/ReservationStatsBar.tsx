import type { ReservationStats } from './types';

interface ReservationStatsBarProps {
  stats: ReservationStats;
}

export default function ReservationStatsBar({ stats }: ReservationStatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Total</div>
        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-200">
        <div className="text-sm text-orange-600">Paiement</div>
        <div className="text-2xl font-bold text-orange-600">{stats.pending_payment}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">En attente</div>
        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Confirm&eacute;es</div>
        <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">En pr&eacute;paration</div>
        <div className="text-2xl font-bold text-purple-600">{stats.preparing}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Livr&eacute;es</div>
        <div className="text-2xl font-bold text-indigo-600">{stats.delivered}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-sm text-gray-600">Termin&eacute;es</div>
        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
      </div>
      <div className="bg-orange-50 rounded-lg shadow-sm p-4 border border-orange-200">
        <div className="text-sm text-orange-600">Non assign&eacute;es</div>
        <div className="text-2xl font-bold text-orange-600">{stats.unassigned}</div>
      </div>
    </div>
  );
}
