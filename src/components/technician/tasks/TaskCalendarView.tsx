import { DeliveryTask, Vehicle } from '../../../types';
import { isToday } from '../../../utils/fixedDate';
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  Calendar,
} from 'lucide-react';
import { TaskTimelineCard } from './TaskTimelineCard';

interface CalendarDay {
  date: Date | null;
  dateStr: string;
  tasks: DeliveryTask[];
}

interface TaskCalendarViewProps {
  calendarDays: CalendarDay[];
  currentMonth: number;
  currentYear: number;
  selectedDate: string;
  tasksForDate: DeliveryTask[];
  vehicles: Vehicle[];
  onNavigateMonth: (direction: number) => void;
  onGoToToday: () => void;
  onDateChange: (date: string) => void;
  isCurrentMonth: (date: Date | null) => boolean;
}

export function TaskCalendarView({
  calendarDays,
  currentMonth,
  currentYear,
  selectedDate,
  tasksForDate,
  vehicles,
  onNavigateMonth,
  onGoToToday,
  onDateChange,
  isCurrentMonth,
}: TaskCalendarViewProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Calendrier mensuel */}
      <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header du calendrier */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#000033] to-[#000044]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigateMonth(-1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-white capitalize min-w-[180px] text-center">
                {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              <button
                onClick={() => onNavigateMonth(1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={onGoToToday}
              className="px-4 py-1.5 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#2ee6b8] transition-colors text-sm"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        {/* Grille du calendrier */}
        <div className="p-4">
          {/* En-tetes des jours */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Jours */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => {
              const { date, dateStr, tasks } = dayData;
              if (!date) return <div key={index} />;

              const isTodayDate = isToday(date);
              const isSelected = dateStr === selectedDate;
              const isInCurrentMonth = isCurrentMonth(date);
              const deliveries = tasks.filter((t) => t.type === 'delivery');
              const pickups = tasks.filter((t) => t.type === 'pickup');
              const hasUrgent = tasks.some((t) => t.status === 'in_progress');

              return (
                <button
                  key={index}
                  onClick={() => onDateChange(dateStr)}
                  className={`
                    relative min-h-[80px] p-1.5 rounded-lg text-left transition-all duration-200
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
                  <div
                    className={`
                    text-sm font-semibold mb-1 flex items-center justify-between
                    ${isSelected ? 'text-[#000033]' : isTodayDate ? 'text-blue-700' : isInCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  `}
                  >
                    <span
                      className={`
                      w-6 h-6 flex items-center justify-center rounded-full
                      ${isTodayDate && !isSelected ? 'bg-blue-600 text-white' : ''}
                    `}
                    >
                      {date.getDate()}
                    </span>
                    {hasUrgent && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>

                  {tasks.length > 0 && (
                    <div className="space-y-0.5">
                      {deliveries.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] bg-[#33ffcc]/30 text-[#000033] px-1.5 py-0.5 rounded">
                          <Truck className="w-2.5 h-2.5" />
                          <span className="font-medium">{deliveries.length}</span>
                        </div>
                      )}
                      {pickups.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                          <Package className="w-2.5 h-2.5" />
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

        {/* Legende */}
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

      {/* Panel de detail du jour */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[700px]">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="font-bold text-gray-900 capitalize">
            {new Date(selectedDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {tasksForDate.length} intervention{tasksForDate.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tasksForDate.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">Aucune intervention</p>
              <p className="text-sm">Profitez de votre journee !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksForDate.map((task, idx) => (
                <TaskTimelineCard
                  key={task.id}
                  task={task}
                  vehicle={vehicles.find((v) => v.id === task.vehicleId)}
                  isLast={idx === tasksForDate.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
