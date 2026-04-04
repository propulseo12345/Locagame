import { useState } from 'react';
import type { AssignFilter, ViewMode } from '../../components/admin/planning/planning.types';
import { toLocalISODate } from '../../utils/dateHolidays';

export function getWeekBounds(dateStr: string): { start: string; end: string } {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay(); // 0=dim
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // lundi
  const monday = new Date(date);
  monday.setDate(diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toLocalISODate(monday), end: toLocalISODate(sunday) };
}

export function usePlanningFilters() {
  const [selectedDate, setSelectedDate] = useState(toLocalISODate(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [assignFilter, setAssignFilter] = useState<AssignFilter>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate + 'T00:00:00');
    if (viewMode === 'week') {
      date.setDate(date.getDate() + (direction * 7));
    } else {
      date.setDate(date.getDate() + direction);
    }
    setSelectedDate(toLocalISODate(date));
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(toLocalISODate(today));
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const navigateMonth = (direction: number) => {
    if (direction > 0) {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  return {
    selectedDate, setSelectedDate,
    viewMode, setViewMode,
    assignFilter, setAssignFilter,
    currentMonth, setCurrentMonth,
    currentYear, setCurrentYear,
    navigateDate,
    goToToday,
    navigateMonth,
    getWeekBounds,
  };
}
