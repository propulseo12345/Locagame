import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminProducts } from '../../hooks/admin/useAdminProducts';
import { useProductForm } from '../../hooks/admin/useProductForm';
import {
  AdminProductsStats,
  AdminProductsFilters,
  AdminProductsTable,
  ProductFormModal,
  DeleteConfirmModal,
} from '../../components/admin/products';
import ImportProductsModal from '../../components/admin/ImportProductsModal';

export default function AdminProducts() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const {
    products,
    categories,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    filteredProducts,
    handleDelete,
    handleExport,
    exporting,
    loadData,
    showDeleteConfirm,
    setShowDeleteConfirm,
  } = useAdminProducts();

  const {
    showModal,
    editingProduct,
    formData,
    setFormData,
    newImageUrl,
    setNewImageUrl,
    openModal,
    closeModal,
    addImage,
    removeImage,
    handleSubmit,
  } = useProductForm(loadData);

  const [showImportModal, setShowImportModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-600">Chargement des produits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600 mt-1">Gérez votre catalogue de jeux et activités</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Export...' : 'Exporter'}
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 border border-green-300 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importer
              </button>
            </>
          )}
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
          >
            + Nouveau produit
          </button>
        </div>
      </div>

      <AdminProductsStats products={products} />

      <AdminProductsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      <AdminProductsTable
        products={filteredProducts}
        categories={categories}
        onDelete={setShowDeleteConfirm}
      />

      {/* Modals */}
      {showModal && (
        <ProductFormModal
          editingProduct={editingProduct}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          newImageUrl={newImageUrl}
          onNewImageUrlChange={setNewImageUrl}
          onAddImage={addImage}
          onRemoveImage={removeImage}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {showImportModal && (
        <ImportProductsModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={() => loadData()}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
          onConfirm={() => handleDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
