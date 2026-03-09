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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#33ffcc] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      )}

      <TechniciansHeader onCreateClick={handleCreate} />
      <TechniciansStats stats={stats} />
      <TechniciansFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <TechniciansTable
        technicians={filteredTechnicians}
        vehicleMap={vehicleMap}
        onEdit={handleEdit}
        onDelete={setDeleteConfirm}
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
