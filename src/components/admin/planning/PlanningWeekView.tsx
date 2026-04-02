import { useMemo } from 'react';
import type { DeliveryTask } from '../../../types';
import type { Technician } from '../../../services/technicians.service';
import type { ViewMode } from './planning.types';
import { toLocalISODate } from '../../../utils/dateHolidays';

interface PlanningWeekViewProps {
  selectedDate: string;
  tasksState: DeliveryTask[];
  technicians: Technician[];
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: ViewMode) => void;
}

const JOURS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getWeekDays(dateStr: string): Date[] {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay(); // 0=dim
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // lundi
  const monday = new Date(date);
  monday.setDate(diff);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function PlanningWeekView({
  selectedDate,
  tasksState,
  technicians,
  setSelectedDate,
  setViewMode,
}: PlanningWeekViewProps) {
  const todayStr = toLocalISODate(new Date());
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, DeliveryTask[]> = {};
    tasksState.forEach(task => {
      if (!grouped[task.scheduledDate]) grouped[task.scheduledDate] = [];
      grouped[task.scheduledDate].push(task);
    });
    // Sort tasks by time within each day
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });
    return grouped;
  }, [tasksState]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const dayStr = toLocalISODate(day);
          const dayTasks = tasksByDate[dayStr] || [];
          const isToday = dayStr === todayStr;
          const isWeekend = i >= 5;

          return (
            <div
              key={dayStr}
              className={`rounded-xl border p-3 min-h-[200px] ${
                isToday ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'
              } ${isWeekend && !isToday ? 'bg-gray-50/30' : ''}`}
            >
              {/* Header du jour */}
              <button
                onClick={() => {
                  setSelectedDate(dayStr);
                  setViewMode('day');
                }}
                className="mb-3 text-left w-full hover:opacity-70 transition-opacity"
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isToday ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {JOURS_FR[i]}
                </p>
                <p
                  className={`text-lg font-bold ${
                    isToday ? 'text-blue-700' : 'text-gray-800'
                  }`}
                >
                  {day.getDate()}
                </p>
              </button>

              {/* Taches du jour */}
              {dayTasks.length === 0 ? (
                <p className="text-xs text-gray-300 text-center mt-4">&mdash;</p>
              ) : (
                <div className="space-y-1.5">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`text-xs rounded-lg p-2 ${
                        task.technicianId
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : 'bg-orange-50 border border-orange-200 text-orange-800'
                      }`}
                    >
                      <p className="font-semibold truncate">
                        {task.customer.firstName} {task.customer.lastName}
                      </p>
                      <p className="text-[10px] opacity-70">{task.scheduledTime}</p>
                      {task.technicianId && (
                        <p className="text-[10px] opacity-70 truncate">
                          {technicians.find(t => t.id === task.technicianId)?.first_name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
