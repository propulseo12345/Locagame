import { Link } from 'react-router-dom';
import { ArrowLeft, Save, ExternalLink } from 'lucide-react';
import { useProductDetail } from '../../hooks/admin/useProductDetail';
import { AdminPageSkeleton } from '../../components/ui/skeletons';
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
    isDirty,
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
    return <AdminPageSkeleton type="detail" />;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Produit introuvable</p>
        <Link to="/admin/products" className="text-gray-900 hover:underline font-medium">
          Retour à la liste
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ring-1 ${
                formData.is_active
                  ? 'bg-green-50 text-green-700 ring-green-200'
                  : 'bg-gray-50 text-gray-600 ring-gray-200'
              }`}>
                {formData.is_active ? 'Actif' : 'Inactif'}
              </span>
              {isDirty && (
                <span className="flex items-center gap-1.5 text-xs text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Non sauvegarde
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              <Link to="/admin/products" className="hover:text-gray-700">Produits</Link>
              <span className="mx-1.5">/</span>
              <span>{product.name}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/produit/${formData.slug || product.id}`}
            target="_blank"
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Voir sur le site
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6">
          {/* Colonne principale */}
          <div className="flex-1 space-y-6 min-w-0">
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

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <ProductSidebarSection
                formData={formData}
                setFormData={setFormData}
                product={product}
                saving={saving}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
