import type { DeliveryTask } from '../../../types';
import type { Technician } from '../../../services/technicians.service';

interface PlanningMonthViewProps {
  calendarDays: Array<{ date: Date | null; tasks: DeliveryTask[] }>;
  selectedDate: string;
  technicians: Technician[];
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: 'day' | 'month') => void;
}

export default function PlanningMonthView({
  calendarDays,
  selectedDate,
  technicians,
  setSelectedDate,
  setViewMode,
}: PlanningMonthViewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* En-tetes des jours de la semaine */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((dayData, index) => {
          if (!dayData.date) {
            return <div key={index} className="aspect-square"></div>;
          }

          const dateStr = dayData.date.toISOString().split('T')[0];
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;
          const tasks = dayData.tasks;

          // Grouper les taches par technicien pour ce jour
          const tasksByTech: Record<string, DeliveryTask[]> = {};
          tasks.forEach(task => {
            const key = task.technicianId || '__unassigned__';
            if (!tasksByTech[key]) tasksByTech[key] = [];
            tasksByTech[key].push(task);
          });

          return (
            <button
              key={index}
              onClick={() => {
                setSelectedDate(dateStr);
                setViewMode('day');
              }}
              className={`aspect-square p-2 border rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-[#33ffcc] border-[#33ffcc]'
                  : isToday
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className={`text-sm font-semibold mb-1 ${
                isSelected ? 'text-[#000033]' : isToday ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {dayData.date.getDate()}
              </div>
              {tasks.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-700">
                    {tasks.length} intervention(s)
                  </div>
                  {Object.keys(tasksByTech)
                    .filter(k => k !== '__unassigned__')
                    .slice(0, 2)
                    .map(techId => {
                      const tech = technicians.find(t => t.id === techId);
                      return (
                        <div key={techId} className="text-xs text-gray-600 truncate">
                          {tech?.first_name} ({tasksByTech[techId].length})
                        </div>
                      );
                    })}
                  {tasksByTech['__unassigned__'] && (
                    <div className="text-xs text-orange-600 truncate">
                      Non assigné ({tasksByTech['__unassigned__'].length})
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
