import { usePlanningFilters } from './usePlanningFilters';
import { usePlanningData } from './usePlanningData';
import { usePlanningComputed } from './usePlanningComputed';
import { usePlanningUI } from './usePlanningUI';

export function useAdminPlanning() {
  const filters = usePlanningFilters();
  const data = usePlanningData(filters.selectedDate, filters.viewMode);
  const computed = usePlanningComputed({
    tasksState: data.tasksState,
    selectedDate: filters.selectedDate,
    assignFilter: filters.assignFilter,
    viewMode: filters.viewMode,
    reservations: data.reservations,
    currentMonth: filters.currentMonth,
    currentYear: filters.currentYear,
  });
  const ui = usePlanningUI();

  return {
    ...filters,
    ...data,
    ...computed,
    ...ui,
  };
}
