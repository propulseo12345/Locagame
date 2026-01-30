import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProductsService, CategoriesService } from '../../services';
import { Product } from '../../types';
import { ArrowLeft, Save, X, Plus, Trash2, Image as ImageIcon, Calendar, AlertTriangle } from 'lucide-react';

export default function AdminProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    pricing: {
      oneDay: 0,
      weekend: 0,
      week: 0,
      customDurations: [] as any[]
    },
    total_stock: 1,
    is_active: true,
    featured: false,
    images: [] as string[],
    specifications: {
      dimensions: { length: 0, width: 0, height: 0 },
      weight: 0,
      players: { min: 1, max: 1 },
      power_requirements: '',
      setup_time: 0
    },
    meta_title: '',
    meta_description: '',
    multi_day_coefficient: 1.00
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    start_date: '',
    end_date: '',
    quantity: 1,
    status: 'blocked' as 'maintenance' | 'blocked',
    buffer_hours: 24
  });

  useEffect(() => {
    if (id) {
      loadProduct();
      loadCategories();
      loadAvailabilities();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await ProductsService.getProductById(id!);
      if (productData) {
        setProduct(productData);
        const pricing = (productData as any).pricing || {};
        const specs = (productData as any).specifications || {};
        
        setFormData({
          name: productData.name || '',
          slug: (productData as any).slug || '',
          description: productData.description || '',
          category_id: productData.category_id || '',
          pricing: {
            oneDay: pricing.oneDay || 0,
            weekend: pricing.weekend || 0,
            week: pricing.week || 0,
            customDurations: pricing.customDurations || []
          },
          total_stock: productData.total_stock || 1,
          is_active: productData.is_active !== false,
          featured: (productData as any).featured || false,
          images: productData.images || [],
          specifications: {
            dimensions: specs.dimensions || { length: 0, width: 0, height: 0 },
            weight: specs.weight || 0,
            players: specs.players || { min: 1, max: 1 },
            power_requirements: specs.power_requirements || '',
            setup_time: specs.setup_time || 0
          },
          meta_title: (productData as any).meta_title || '',
          meta_description: (productData as any).meta_description || '',
          multi_day_coefficient: productData.multi_day_coefficient ?? 1.00
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await CategoriesService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadAvailabilities = async () => {
    if (!id) return;
    try {
      const data = await ProductsService.getProductAvailability(id);
      // Filtrer uniquement les disponibilités manuelles (maintenance/blocked, sans reservation_id)
      setAvailabilities(data.filter((a: any) => !a.reservation_id && (a.status === 'maintenance' || a.status === 'blocked')));
    } catch (error) {
      console.error('Error loading availabilities:', error);
    }
  };

  const handleAddAvailability = async () => {
    if (!id || !newAvailability.start_date || !newAvailability.end_date) {
      alert('Veuillez remplir toutes les dates');
      return;
    }

    try {
      await ProductsService.createAvailability({
        product_id: id,
        start_date: newAvailability.start_date,
        end_date: newAvailability.end_date,
        quantity: newAvailability.quantity,
        status: newAvailability.status,
        buffer_hours: newAvailability.buffer_hours
      });
      await loadAvailabilities();
      setShowAvailabilityModal(false);
      setNewAvailability({
        start_date: '',
        end_date: '',
        quantity: 1,
        status: 'blocked',
        buffer_hours: 24
      });
    } catch (error) {
      console.error('Error adding availability:', error);
      alert('Erreur lors de l\'ajout de la disponibilité');
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
      return;
    }

    try {
      await ProductsService.deleteAvailability(availabilityId);
      await loadAvailabilities();
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      await ProductsService.updateProduct(id, {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        category_id: formData.category_id || null,
        pricing: formData.pricing,
        total_stock: formData.total_stock,
        is_active: formData.is_active,
        featured: formData.featured,
        images: formData.images,
        specifications: formData.specifications,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        multi_day_coefficient: formData.multi_day_coefficient
      } as any);
      
      alert('Produit mis à jour avec succès !');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Erreur lors de la mise à jour du produit');
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()]
      });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Éditer le produit</h1>
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
            {/* Informations de base */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de base</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-généré depuis le nom"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Laissez vide pour générer automatiquement depuis le nom
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Images</h2>
              <div className="space-y-4">
                {/* Liste des images existantes */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ajouter une nouvelle image */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL de l'image"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Entrez l'URL complète de l'image (ex: https://example.com/image.jpg)
                </p>
              </div>
            </div>

            {/* Prix */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tarification</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix 1 jour (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricing.oneDay}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, oneDay: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix week-end (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricing.weekend}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, weekend: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix semaine (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricing.week}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, week: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Coefficient multi-jours */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coefficient multi-jours
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0.50"
                        max="1.00"
                        value={formData.multi_day_coefficient}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          // Borner la valeur entre 0.50 et 1.00
                          const clampedValue = Math.min(1.00, Math.max(0.50, value || 1.00));
                          setFormData({ ...formData, multi_day_coefficient: clampedValue });
                        }}
                        className={`w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent ${
                          formData.multi_day_coefficient < 0.50 || formData.multi_day_coefficient > 1.00
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                      {formData.multi_day_coefficient < 1.00 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          -{Math.round((1 - formData.multi_day_coefficient) * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Appliqué automatiquement à partir de 2 jours de location. Ex: 0.85 = -15% sur le total.
                      <br />
                      Bornes : minimum 0.50 (-50%), maximum 1.00 (pas de réduction)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Spécifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Spécifications techniques</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longueur (cm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.specifications.dimensions.length}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: {
                            ...formData.specifications.dimensions,
                            length: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Largeur (cm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.specifications.dimensions.width}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: {
                            ...formData.specifications.dimensions,
                            width: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hauteur (cm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.specifications.dimensions.height}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: {
                            ...formData.specifications.dimensions,
                            height: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.specifications.weight}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          weight: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temps de montage (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.specifications.setup_time}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          setup_time: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de joueurs (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.specifications.players.min}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          players: {
                            ...formData.specifications.players,
                            min: parseInt(e.target.value) || 1
                          }
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de joueurs (max)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.specifications.players.max}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          players: {
                            ...formData.specifications.players,
                            max: parseInt(e.target.value) || 1
                          }
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alimentation / Exigences
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.power_requirements}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        power_requirements: e.target.value
                      }
                    })}
                    placeholder="Ex: 220V - 300W, Batterie rechargeable, Aucune"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">SEO (Méta-données)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="Titre pour les moteurs de recherche"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                    placeholder="Description pour les moteurs de recherche"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Gestion de la disponibilité */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Disponibilité manuelle
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAvailabilityModal(true)}
                  className="px-4 py-2 bg-[#33ffcc] hover:bg-[#66cccc] text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Bloquer des périodes ou marquer en maintenance pour empêcher les réservations
              </p>
              
              {availabilities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucune disponibilité manuelle configurée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availabilities.map((availability) => (
                    <div
                      key={availability.id}
                      className={`p-4 rounded-lg border-2 ${
                        availability.status === 'maintenance'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`w-4 h-4 ${
                              availability.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                            <span className={`text-sm font-medium ${
                              availability.status === 'maintenance' ? 'text-yellow-800' : 'text-red-800'
                            }`}>
                              {availability.status === 'maintenance' ? 'Maintenance' : 'Bloqué'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <p>
                              <strong>Du:</strong> {new Date(availability.start_date).toLocaleDateString('fr-FR')}
                            </p>
                            <p>
                              <strong>Au:</strong> {new Date(availability.end_date).toLocaleDateString('fr-FR')}
                            </p>
                            <p>
                              <strong>Quantité:</strong> {availability.quantity} unité(s)
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAvailability(availability.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Statut et disponibilité */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statut</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Produit actif</label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Produit vedette</label>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
                  />
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Disponibilité</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock total
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.total_stock}
                  onChange={(e) => setFormData({ ...formData, total_stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nombre d'unités disponibles en stock
                </p>
              </div>
            </div>

            {/* Informations */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Informations</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Créé le: {new Date(product.created_at).toLocaleDateString('fr-FR')}</p>
                {product.updated_at && (
                  <p>Modifié le: {new Date(product.updated_at).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal d'ajout de disponibilité */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Ajouter une disponibilité</h2>
                <button
                  onClick={() => {
                    setShowAvailabilityModal(false);
                    setNewAvailability({
                      start_date: '',
                      end_date: '',
                      quantity: 1,
                      status: 'blocked',
                      buffer_hours: 24
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newAvailability.status}
                  onChange={(e) => setNewAvailability({
                    ...newAvailability,
                    status: e.target.value as 'maintenance' | 'blocked'
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                >
                  <option value="blocked">Bloqué</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  value={newAvailability.start_date}
                  onChange={(e) => setNewAvailability({
                    ...newAvailability,
                    start_date: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin *
                </label>
                <input
                  type="date"
                  value={newAvailability.end_date}
                  onChange={(e) => setNewAvailability({
                    ...newAvailability,
                    end_date: e.target.value
                  })}
                  min={newAvailability.start_date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité bloquée
                </label>
                <input
                  type="number"
                  min="1"
                  max={formData.total_stock}
                  value={newAvailability.quantity}
                  onChange={(e) => setNewAvailability({
                    ...newAvailability,
                    quantity: parseInt(e.target.value) || 1
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nombre d'unités à bloquer (max: {formData.total_stock})
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAvailabilityModal(false);
                  setNewAvailability({
                    start_date: '',
                    end_date: '',
                    quantity: 1,
                    status: 'blocked',
                    buffer_hours: 24
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddAvailability}
                className="px-4 py-2 bg-[#33ffcc] hover:bg-[#66cccc] text-white rounded-lg font-medium"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

