import { Users, User, Building2, Star, UserCheck } from 'lucide-react';
import { useAdminCustomers } from '../../hooks/admin/useAdminCustomers';
import {
  CustomersHeader,
  CustomersFilters,
  CustomersTable,
  CustomerImportModal,
} from '../../components/admin/customers';
import DeleteCustomerModal from '../../components/admin/DeleteCustomerModal';

export default function AdminCustomers() {
  const c = useAdminCustomers();

  return (
    <div className="space-y-6">
      {c.error && (
        <div className="bg-red-50 border-l-4 border-l-red-500 rounded-r-lg p-4 flex items-center justify-between">
          <p className="text-red-700 text-sm font-medium">{c.error}</p>
          <button
            onClick={c.loadCustomers}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      )}

      <CustomersHeader
        totalCount={c.customers.length}
        isExporting={c.isExporting}
        customersExist={c.customers.length > 0}
        fileInputRef={c.fileInputRef}
        onExport={c.handleExport}
        onImport={c.handleImport}
        onDownloadTemplate={c.downloadTemplate}
      />

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 border-l-4 border-l-gray-400 rounded-xl p-4 hover:shadow-md transition-all relative">
          <Users className="w-4 h-4 text-gray-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total clients</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{c.stats.total}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <User className="w-4 h-4 text-blue-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Particuliers</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{c.stats.particulier}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-violet-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <Building2 className="w-4 h-4 text-violet-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Professionnels</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{c.stats.professionnel}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-yellow-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <Star className="w-4 h-4 text-yellow-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">VIP</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{c.stats.vip}</div>
        </div>
        <div className="bg-white border border-gray-200 border-l-4 border-l-green-500 rounded-xl p-4 hover:shadow-md transition-all relative">
          <UserCheck className="w-4 h-4 text-green-400 absolute top-4 right-4" />
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Actifs</div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{c.stats.actif}</div>
        </div>
      </div>

      <CustomersFilters
        searchTerm={c.searchTerm}
        onSearchChange={c.setSearchTerm}
        typeFilter={c.typeFilter}
        onTypeChange={c.setTypeFilter}
        hasActiveFilters={c.hasActiveFilters}
        onClearFilters={c.clearFilters}
        totalCount={c.customers.length}
        filteredCount={c.filteredCustomers.length}
      />

      <CustomersTable
        customers={c.filteredCustomers}
        loading={c.loading}
        hasActiveFilters={c.hasActiveFilters}
        onClearFilters={c.clearFilters}
        onDeleteClick={c.setShowDeleteConfirm}
      />

      {c.showDeleteConfirm && (
        <DeleteCustomerModal
          customer={c.showDeleteConfirm}
          onClose={() => c.setShowDeleteConfirm(null)}
          onDeleted={c.handleDeleteCustomer}
        />
      )}

      {c.importResult && (
        <CustomerImportModal
          result={c.importResult}
          onClose={() => c.setImportResult(null)}
        />
      )}
    </div>
  );
}
