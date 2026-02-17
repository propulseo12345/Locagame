import { Loader2, CalendarDays, LayoutList } from 'lucide-react';
import { useTechnicianTasks } from '../../hooks/technician/useTechnicianTasks';
import { TaskFilters, TaskCalendarView, TaskListView } from '../../components/technician/tasks';

export default function TechnicianTasks() {
  const {
    loading,
    viewMode,
    setViewMode,
    selectedDate,
    currentMonth,
    currentYear,
    vehicles,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    searchTerm,
    setSearchTerm,
    hasActiveFilters,
    clearFilters,
    filteredTasks,
    tasksForDate,
    calendarDays,
    navigateMonth,
    goToToday,
    handleDateChange,
    isCurrentMonth,
  } = useTechnicianTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#33ffcc] animate-spin" />
          <p className="text-gray-600">Chargement des interventions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes interventions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredTasks.length} intervention{filteredTasks.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-[#000033] font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Calendrier</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-[#000033] font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span>Liste</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <TaskFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {/* Vue Calendrier */}
      {viewMode === 'calendar' && (
        <TaskCalendarView
          calendarDays={calendarDays}
          currentMonth={currentMonth}
          currentYear={currentYear}
          selectedDate={selectedDate}
          tasksForDate={tasksForDate}
          vehicles={vehicles}
          onNavigateMonth={navigateMonth}
          onGoToToday={goToToday}
          onDateChange={handleDateChange}
          isCurrentMonth={isCurrentMonth}
        />
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <TaskListView
          tasks={filteredTasks}
          vehicles={vehicles}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}
    </div>
  );
}
