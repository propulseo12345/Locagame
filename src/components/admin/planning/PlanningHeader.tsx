import { Truck } from 'lucide-react';
import type { AssignFilter, ViewMode, VehicleFormData } from './planning.types';
import { DEFAULT_VEHICLE_FORM } from './planning.types';
import type { Vehicle } from '../../../services/technicians.service';
import { toLocalISODate } from '../../../utils/dateHolidays';

interface PlanningHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  assignFilter: AssignFilter;
  setAssignFilter: (filter: AssignFilter) => void;
  currentMonth: number;
  currentYear: number;
  navigateDate: (days: number) => void;
  goToToday: () => void;
  navigateMonth: (direction: number) => void;
  setShowVehicleModal: (show: boolean) => void;
  setEditingVehicle: (vehicle: Vehicle | null) => void;
  setVehicleFormData: (data: VehicleFormData) => void;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  getWeekBounds: (dateStr: string) => { start: string; end: string };
}

function formatWeekLabel(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startLabel = s.toLocaleDateString('fr-FR', opts);
  const endLabel = e.toLocaleDateString('fr-FR', { ...opts, year: 'numeric' });
  return `${startLabel} — ${endLabel}`;
}

const ASSIGN_FILTERS: Array<{ key: AssignFilter; label: string }> = [
  { key: 'all', label: 'Toutes' },
  { key: 'unassigned', label: 'Non assignées' },
  { key: 'assigned', label: 'Assignées' },
];

export default function PlanningHeader({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  assignFilter,
  setAssignFilter,
  currentMonth,
  currentYear,
  navigateDate,
  goToToday,
  navigateMonth,
  setShowVehicleModal,
  setEditingVehicle,
  setVehicleFormData,
  setCurrentMonth,
  setCurrentYear,
  getWeekBounds,
}: PlanningHeaderProps) {

  const renderAssignFilters = () => (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {ASSIGN_FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => setAssignFilter(f.key)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            assignFilter === f.key
              ? 'bg-white text-[#000033] font-semibold shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  const renderNavigation = () => {
    if (viewMode === 'day') {
      return (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate(-1)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              &larr;
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
            />
            <button
              onClick={() => navigateDate(1)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              &rarr;
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Aujourd'hui
            </button>
          </div>
          {renderAssignFilters()}
        </div>
      );
    }

    if (viewMode === 'week') {
      const { start, end } = getWeekBounds(selectedDate);
      return (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate(-1)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              &larr;
            </button>
            <h2 className="text-lg font-semibold text-gray-900 px-2">
              {formatWeekLabel(start, end)}
            </h2>
            <button
              onClick={() => navigateDate(1)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              &rarr;
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Aujourd'hui
            </button>
          </div>
          {renderAssignFilters()}
        </div>
      );
    }

    // month
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          &larr;
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          &rarr;
        </button>
        <button
          onClick={() => {
            const today = new Date();
            setCurrentMonth(today.getMonth());
            setCurrentYear(today.getFullYear());
            setSelectedDate(toLocalISODate(today));
          }}
          className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Aujourd'hui
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Livraisons</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingVehicle(null);
                setVehicleFormData(DEFAULT_VEHICLE_FORM);
                setShowVehicleModal(true);
              }}
              className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Truck className="w-5 h-5" />
              + Nouveau camion
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['day', 'week', 'month'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-[#000033] font-semibold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {{ day: 'Jour', week: 'Semaine', month: 'Mois' }[mode]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {renderNavigation()}
      </div>
    </div>
  );
}
