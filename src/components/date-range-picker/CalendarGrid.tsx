import { useState } from 'react';

interface CalendarGridProps {
  currentMonth: Date;
  startDate: Date | null;
  endDate: Date | null;
  today: Date;
  onDateClick: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const monthNames = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  const firstDayOfWeek = firstDay.getDay();
  const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  for (let i = daysToAdd; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

export function CalendarGrid({
  currentMonth, startDate, endDate, today,
  onDateClick, onPreviousMonth, onNextMonth,
}: CalendarGridProps) {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const days = getDaysInMonth(currentMonth);

  const isDateDisabled = (date: Date): boolean => date < today;

  const isDateInRange = (date: Date): boolean => {
    if (!startDate) return false;
    const compareDate = endDate || hoverDate;
    if (!compareDate || compareDate <= startDate) return false;
    return date > startDate && date < compareDate;
  };

  const isDateSelected = (date: Date): 'start' | 'end' | 'none' => {
    if (startDate && date.toDateString() === startDate.toDateString()) return 'start';
    if (endDate && date.toDateString() === endDate.toDateString()) return 'end';
    return 'none';
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
      {/* Header du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onPreviousMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors" type="button">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-bold text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={onNextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors" type="button">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">{day}</div>
        ))}
      </div>

      {/* Jours du mois */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isDisabled = isDateDisabled(date);
          const selected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <button
              key={index}
              onClick={() => !isDisabled && onDateClick(date)}
              onMouseEnter={() => startDate && !endDate && !isDisabled && setHoverDate(date)}
              onMouseLeave={() => setHoverDate(null)}
              disabled={isDisabled}
              className={`
                relative aspect-square p-2 text-sm font-medium rounded-lg transition-all duration-200
                ${!isCurrentMonth ? 'text-gray-600' : 'text-white'}
                ${isDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}
                ${selected === 'start' ? 'bg-[#33ffcc] text-[#000033] font-bold ring-2 ring-[#33ffcc] ring-offset-2 ring-offset-[#000033] scale-110 z-10' : ''}
                ${selected === 'end' ? 'bg-[#66cccc] text-[#000033] font-bold ring-2 ring-[#66cccc] ring-offset-2 ring-offset-[#000033] scale-110 z-10' : ''}
                ${inRange && !isDisabled ? 'bg-[#33ffcc]/20 text-white' : ''}
                ${selected === 'none' && !inRange && !isDisabled && isCurrentMonth ? 'hover:bg-white/10 hover:scale-110' : ''}
                ${isToday && selected === 'none' ? 'ring-1 ring-white/30' : ''}
              `}
              type="button"
            >
              <span className="relative z-10">{date.getDate()}</span>
              {selected === 'start' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#000033] rounded-full flex items-center justify-center">
                  <span className="text-[#33ffcc] text-[8px] font-black">1</span>
                </div>
              )}
              {selected === 'end' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#000033] rounded-full flex items-center justify-center">
                  <span className="text-[#66cccc] text-[8px] font-black">2</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
