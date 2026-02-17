import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useProductDetail } from '../../hooks/admin/useProductDetail';
import {
  ProductBasicInfoSection,
  ProductImagesSection,
  ProductPricingSection,
  ProductSpecificationsSection,
  ProductSeoSection,
  ProductAvailabilitySection,
  ProductSidebarSection,
} from '../../components/admin/productDetail';

export default function AdminProductDetail() {
  const {
    product,
    categories,
    loading,
    saving,
    formData,
    setFormData,
    newImageUrl,
    setNewImageUrl,
    availabilities,
    showAvailabilityModal,
    setShowAvailabilityModal,
    newAvailability,
    setNewAvailability,
    handleSubmit,
    handleAddImage,
    handleRemoveImage,
    handleAddAvailability,
    handleDeleteAvailability,
  } = useProductDetail();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Produit introuvable</p>
        <Link to="/admin/products" className="text-[#33ffcc] hover:underline">
          Retour a la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editer le produit</h1>
            <p className="text-gray-600 mt-1">{product.name}</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2 bg-[#33ffcc] hover:bg-[#66cccc] text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            <ProductBasicInfoSection
              formData={formData}
              setFormData={setFormData}
              categories={categories}
            />
            <ProductImagesSection
              formData={formData}
              newImageUrl={newImageUrl}
              setNewImageUrl={setNewImageUrl}
              onAddImage={handleAddImage}
              onRemoveImage={handleRemoveImage}
            />
            <ProductPricingSection
              formData={formData}
              setFormData={setFormData}
            />
            <ProductSpecificationsSection
              formData={formData}
              setFormData={setFormData}
            />
            <ProductSeoSection
              formData={formData}
              setFormData={setFormData}
            />
            <ProductAvailabilitySection
              formData={formData}
              availabilities={availabilities}
              showAvailabilityModal={showAvailabilityModal}
              setShowAvailabilityModal={setShowAvailabilityModal}
              newAvailability={newAvailability}
              setNewAvailability={setNewAvailability}
              onAddAvailability={handleAddAvailability}
              onDeleteAvailability={handleDeleteAvailability}
            />
          </div>

          {/* Colonne laterale */}
          <ProductSidebarSection
            formData={formData}
            setFormData={setFormData}
            product={product}
          />
        </div>
      </form>
    </div>
  );
}
