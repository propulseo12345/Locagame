import { AlertTriangle } from 'lucide-react';
import { useAdminTechnicians } from '../../hooks/admin/useAdminTechnicians';
import {
  TechnicianFormModal,
  TechniciansHeader,
  TechniciansStats,
  TechniciansFilters,
  TechniciansTable,
  TechniciansDeleteModal,
} from '../../components/admin/technicians';

export default function AdminTechniciansPage() {
  const {
    vehicles,
    filteredTechnicians,
    vehicleMap,
    stats,
    loading,
    error,
    searchTerm,
    statusFilter,
    showModal,
    editingTechnician,
    deleteConfirm,
    deleting,
    setSearchTerm,
    setStatusFilter,
    setShowModal,
    setEditingTechnician,
    setDeleteConfirm,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleDelete,
    loadData,
  } = useAdminTechnicians();

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border-l-4 border-l-red-500 rounded-r-lg p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0 animate-pulse" />
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      <TechniciansHeader onCreateClick={handleCreate} totalCount={loading ? undefined : stats.total} />
      <TechniciansStats stats={stats} />
      <TechniciansFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={stats.total}
        filteredCount={filteredTechnicians.length}
      />
      <TechniciansTable
        technicians={filteredTechnicians}
        vehicleMap={vehicleMap}
        onEdit={handleEdit}
        onDelete={setDeleteConfirm}
        loading={loading}
      />

      {showModal && (
        <TechnicianFormModal
          technician={editingTechnician}
          vehicles={vehicles}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingTechnician(null);
          }}
        />
      )}

      {deleteConfirm && (
        <TechniciansDeleteModal
          technician={deleteConfirm}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
