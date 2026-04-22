import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
} from 'lucide-react';
import { isToday } from '../../../utils/fixedDate';
import type { Vehicle } from '../../../types';
import type { CalendarDay } from '../../../hooks/technician/useTechnicianDashboard';

interface DashboardCalendarProps {
  currentMonth: number;
  currentYear: number;
  selectedDate: string;
  selectedVehicle: string;
  vehicles: Vehicle[];
  calendarDays: CalendarDay[];
  onNavigateMonth: (direction: number) => void;
  onGoToToday: () => void;
  onSelectDate: (dateStr: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
  isCurrentMonth: (date: Date | null) => boolean;
}

export default function DashboardCalendar({
  currentMonth,
  currentYear,
  selectedDate,
  selectedVehicle,
  vehicles,
  calendarDays,
  onNavigateMonth,
  onGoToToday,
  onSelectDate,
  onSelectVehicle,
  isCurrentMonth,
}: DashboardCalendarProps) {
  return (
    <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar header */}
      <div className="p-3 md:p-4 border-b border-gray-100 bg-gradient-to-r from-[#000033] to-[#000044]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => onNavigateMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white active:scale-95">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-sm md:text-lg font-bold text-white capitalize min-w-[120px] md:min-w-[180px] text-center">
              {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => onNavigateMonth(1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white active:scale-95">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedVehicle}
              onChange={(e) => onSelectVehicle(e.target.value)}
              className="hidden md:block px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
            >
              <option value="all" className="text-gray-900">Tous véhicules</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id} className="text-gray-900">{vehicle.name}</option>
              ))}
            </select>
            <button onClick={onGoToToday} className="px-3 py-1.5 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#2ee6b8] transition-colors text-xs md:text-sm active:scale-95">
              Aujourd'hui
            </button>
          </div>
        </div>
        {/* Mobile vehicle filter */}
        <select
          value={selectedVehicle}
          onChange={(e) => onSelectVehicle(e.target.value)}
          className="md:hidden w-full mt-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#33ffcc]"
        >
          <option value="all" className="text-gray-900">Tous véhicules</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id} className="text-gray-900">{vehicle.name}</option>
          ))}
        </select>
      </div>

      {/* Calendar grid */}
      <div className="p-2 md:p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
            <div key={i} className="text-center text-[10px] md:text-xs font-semibold text-gray-500 py-1 md:py-2">
              <span className="md:hidden">{day}</span>
              <span className="hidden md:inline">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}</span>
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-0.5 md:gap-1">
          {calendarDays.map((dayData, index) => {
            const { date, dateStr, tasks } = dayData;
            if (!date) return <div key={index} />;

            const isTodayDate = isToday(date);
            const isSelected = dateStr === selectedDate;
            const isInCurrentMonth = isCurrentMonth(date);
            const deliveries = tasks.filter((t) => t.type === 'delivery');
            const pickups = tasks.filter((t) => t.type === 'pickup');
            const hasUrgent = tasks.some((t) => t.status === 'en_route');

            return (
              <button
                key={index}
                onClick={() => onSelectDate(dateStr)}
                className={`
                  relative min-h-[48px] md:min-h-[80px] p-1 md:p-1.5 rounded-lg text-left transition-all duration-200 active:scale-95
                  ${isSelected
                    ? 'bg-[#33ffcc]/20 ring-2 ring-[#33ffcc] shadow-lg'
                    : isTodayDate
                      ? 'bg-blue-50 ring-1 ring-blue-300'
                      : isInCurrentMonth
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'bg-gray-25 opacity-40'
                  }
                `}
              >
                <div className={`
                  text-xs md:text-sm font-semibold mb-0.5 md:mb-1 flex items-center justify-between
                  ${isSelected ? 'text-[#000033]' : isTodayDate ? 'text-blue-700' : isInCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  <span className={`
                    w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full text-[11px] md:text-sm
                    ${isTodayDate && !isSelected ? 'bg-blue-600 text-white' : ''}
                  `}>
                    {date.getDate()}
                  </span>
                  {hasUrgent && (
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>

                {tasks.length > 0 && (
                  <div className="space-y-0.5">
                    {deliveries.length > 0 && (
                      <div className="flex items-center gap-0.5 text-[10px] md:text-[10px] bg-[#33ffcc]/30 text-[#000033] px-1 md:px-1.5 py-0.5 rounded">
                        <Truck className="w-2.5 h-2.5 md:w-2.5 md:h-2.5" />
                        <span className="font-medium">{deliveries.length}</span>
                      </div>
                    )}
                    {pickups.length > 0 && (
                      <div className="flex items-center gap-0.5 text-[10px] md:text-[10px] bg-orange-100 text-orange-700 px-1 md:px-1.5 py-0.5 rounded">
                        <Package className="w-2.5 h-2.5 md:w-2.5 md:h-2.5" />
                        <span className="font-medium">{pickups.length}</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#33ffcc]/30 rounded" />
          <span>Livraison</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-orange-100 rounded" />
          <span>Retrait</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>En cours</span>
        </div>
      </div>
    </div>
  );
}
