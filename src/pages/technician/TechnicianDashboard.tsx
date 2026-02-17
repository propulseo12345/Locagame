import { Loader2, AlertCircle } from 'lucide-react';
import { useTechnicianDashboard } from '../../hooks/technician/useTechnicianDashboard';
import {
  DashboardStatsCards,
  DashboardCalendar,
  DashboardDayPanel,
} from '../../components/technician/dashboard';

export default function TechnicianDashboard() {
  const {
    selectedDate,
    setSelectedDate,
    currentMonth,
    currentYear,
    selectedVehicle,
    setSelectedVehicle,
    loading,
    error,
    vehicles,
    tasksForSelectedDate,
    monthStats,
    calendarDays,
    navigateMonth,
    goToToday,
    isCurrentMonth,
  } = useTechnicianDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#33ffcc] animate-spin" />
          <p className="text-gray-600">Chargement du planning...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#33ffcc] text-[#000033] rounded-lg font-medium hover:bg-[#2ee6b8] transition-colors"
          >
            R\u00e9essayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardStatsCards monthStats={monthStats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <DashboardCalendar
          currentMonth={currentMonth}
          currentYear={currentYear}
          selectedDate={selectedDate}
          selectedVehicle={selectedVehicle}
          vehicles={vehicles}
          calendarDays={calendarDays}
          onNavigateMonth={navigateMonth}
          onGoToToday={goToToday}
          onSelectDate={setSelectedDate}
          onSelectVehicle={setSelectedVehicle}
          isCurrentMonth={isCurrentMonth}
        />

        <DashboardDayPanel
          selectedDate={selectedDate}
          tasksForSelectedDate={tasksForSelectedDate}
          vehicles={vehicles}
        />
      </div>
    </div>
  );
}
