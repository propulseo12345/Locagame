import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { generateAvailabilityCalendar, isPastDate, isToday } from '../utils/availability';

interface AvailabilityCalendarProps {
  productId: string;
  selectedStartDate?: string;
  selectedEndDate?: string;
  onDateSelect: (startDate: string, endDate: string) => void;
  onClearSelection: () => void;
}

export default function AvailabilityCalendar({
  productId,
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  onClearSelection
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [calendar, setCalendar] = useState<{ date: string; available: boolean; availableQuantity: number; isMaintenance: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendar();
  }, [productId, currentYear, currentMonth]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const cal = await generateAvailabilityCalendar(productId, currentYear, currentMonth);
      setCalendar(cal);
    } catch (error) {
      console.error('Error loading calendar:', error);
      setCalendar([]);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const handleDateClick = (date: string) => {
    if (isPastDate(date)) return;

    const clickedDate = new Date(date);
    const dayData = calendar.find(d => d.date === date);
    if (dayData && !dayData.available) return;

    // Pas de date de début sélectionnée - première sélection
    if (!selectedStartDate) {
      onDateSelect(date, date);
    }
    // Date de début = date de fin (1er clic fait) - on attend le 2ème clic pour la fin
    else if (selectedStartDate === selectedEndDate) {
      if (clickedDate >= new Date(selectedStartDate)) {
        // Clic après la date de début → définir comme date de fin
        onDateSelect(selectedStartDate, date);
      } else {
        // Clic avant la date de début → inverser (nouvelle date devient début)
        onDateSelect(date, selectedStartDate);
      }
    }
    // Les deux dates sont différentes (plage complète) - réinitialiser
    else {
      onDateSelect(date, date);
    }
  };

  const handleClearSelection = () => {
    onClearSelection();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const isDateInRange = (date: string) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const checkDate = new Date(date);
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    return checkDate > start && checkDate < end;
  };

  const isDateSelected = (date: string) => {
    return date === selectedStartDate || date === selectedEndDate;
  };

  const isStartDate = (date: string) => date === selectedStartDate;
  const isEndDate = (date: string) => date === selectedEndDate && selectedEndDate !== selectedStartDate;

  const getDateClassName = (date: string, available: boolean) => {
    const isPast = isPastDate(date);
    const isTodayDate = isToday(date);
    const isSelected = isDateSelected(date);
    const isInRange = isDateInRange(date);
    const isHovered = hoveredDate === date;
    const isStart = isStartDate(date);
    const isEnd = isEndDate(date);

    let baseClasses = 'w-full aspect-square flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200 relative';

    // Rounded corners for range selection
    if (isStart && selectedEndDate && selectedEndDate !== selectedStartDate) {
      baseClasses += ' rounded-l-xl';
    } else if (isEnd) {
      baseClasses += ' rounded-r-xl';
    } else if (isSelected && (!selectedEndDate || selectedEndDate === selectedStartDate)) {
      baseClasses += ' rounded-xl';
    } else if (!isInRange) {
      baseClasses += ' rounded-xl';
    }

    if (isPast) {
      baseClasses += ' text-white/20 cursor-not-allowed';
    } else if (!available) {
      baseClasses += ' text-white/30 bg-white/5 cursor-not-allowed line-through';
    } else if (isSelected) {
      baseClasses += ' bg-[#33ffcc] text-[#000033] font-bold shadow-lg shadow-[#33ffcc]/30';
    } else if (isInRange) {
      baseClasses += ' bg-[#33ffcc]/20 text-[#33ffcc]';
    } else if (isHovered) {
      baseClasses += ' bg-[#33ffcc]/30 text-white scale-110';
    } else if (isTodayDate) {
      baseClasses += ' bg-[#fe1979]/20 text-[#fe1979] font-bold ring-2 ring-[#fe1979]/50';
    } else {
      baseClasses += ' text-white/80 hover:bg-white/10';
    }

    return baseClasses;
  };

  const getSelectionState = () => {
    if (!selectedStartDate) return 'start';
    if (!selectedEndDate) return 'end';
    return 'complete';
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h4 className="text-xl font-black text-white">
          {monthNames[currentMonth - 1]} {currentYear}
        </h4>

        <button
          onClick={() => navigateMonth('next')}
          className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-bold text-white/50 py-2 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendrier */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#33ffcc] border-t-transparent animate-spin"></div>
            </div>
            <p className="text-white/50 text-sm">Chargement des disponibilités...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {calendar.map((day) => (
            <div
              key={day.date}
              className={getDateClassName(day.date, day.available)}
              onClick={() => handleDateClick(day.date)}
              onMouseEnter={() => setHoveredDate(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {new Date(day.date).getDate()}
              {day.available && day.availableQuantity < 3 && !isPastDate(day.date) && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#fe1979] rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Légende compacte */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#33ffcc] rounded-full"></div>
          <span className="text-xs text-white/60">Sélectionné</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#fe1979]/50 rounded-full ring-2 ring-[#fe1979]/50"></div>
          <span className="text-xs text-white/60">Aujourd'hui</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white/10 rounded-full"></div>
          <span className="text-xs text-white/60">Indisponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#fe1979] rounded-full"></div>
          <span className="text-xs text-white/60">Stock limité</span>
        </div>
      </div>

      {/* Message d'aide initial */}
      {!selectedStartDate && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <Sparkles className="w-4 h-4 text-[#33ffcc]" />
            <span className="text-sm text-white/60">Cliquez sur une date pour commencer</span>
          </div>
        </div>
      )}
    </div>
  );
}
