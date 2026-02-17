import { Truck } from 'lucide-react';
import type { AssignFilter, VehicleFormData } from './planning.types';
import { DEFAULT_VEHICLE_FORM } from './planning.types';
import type { Vehicle } from '../../../services/technicians.service';

interface PlanningHeaderProps {
  viewMode: 'day' | 'month';
  setViewMode: (mode: 'day' | 'month') => void;
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
}

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
}: PlanningHeaderProps) {
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
              className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors flex items-center gap-2"
            >
              <Truck className="w-5 h-5" />
              + Nouveau camion
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'day'
                    ? 'bg-white text-[#000033] font-semibold shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Jour
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white text-[#000033] font-semibold shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mois
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'day' ? (
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
                className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
              >
                Aujourd'hui
              </button>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {([
                { key: 'all' as const, label: 'Toutes' },
                { key: 'unassigned' as const, label: 'Non assign\u00e9es' },
                { key: 'assigned' as const, label: 'Assign\u00e9es' },
              ]).map(f => (
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
          </div>
        ) : (
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
                setSelectedDate(today.toISOString().split('T')[0]);
              }}
              className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
            >
              Aujourd'hui
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
