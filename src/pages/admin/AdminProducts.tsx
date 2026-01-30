import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Edit2, MoreVertical, Plus, Image as ImageIcon } from 'lucide-react';
import { ProductsService, CategoriesService } from '../../services';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    images: [] as string[],
    pricing: {
      oneDay: 0,
      weekend: 0,
      week: 0
    },
    specifications: {
      dimensions: { length: 0, width: 0, height: 0 },
      weight: 0,
      players: { min: 1, max: 1 },
      power_requirements: '',
      setup_time: 0
    },
    total_stock: 1,
    is_active: true,
    featured: false,
    meta_title: '',
    meta_description: ''
  });

  // Charger les produits et catégories au démarrage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Pour l'admin, on veut tous les produits (actifs et inactifs)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('name', { ascending: true });
      
      if (productsError) throw productsError;
      
      const [categoriesData] = await Promise.all([
        CategoriesService.getCategories()
      ]);
      setProducts(productsData as Product[]);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const productStatus = product.is_active ? 'active' : 'inactive';
    const matchesStatus = statusFilter === 'all' || productStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      const pricing = product.pricing || {};
      const specs = product.specifications || {};
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        category_id: product.category_id || '',
        description: product.description || '',
        images: product.images || [],
        pricing: {
          oneDay: pricing.oneDay || 0,
          weekend: pricing.weekend || 0,
          week: pricing.week || 0
        },
        specifications: {
          dimensions: specs.dimensions || { length: 0, width: 0, height: 0 },
          weight: specs.weight || 0,
          players: specs.players || { min: 1, max: 1 },
          power_requirements: specs.power_requirements || '',
          setup_time: specs.setup_time || 0
        },
        total_stock: product.total_stock || 1,
        is_active: product.is_active !== false,
        featured: product.featured || false,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        category_id: '',
        description: '',
        images: [],
        pricing: {
          oneDay: 0,
          weekend: 0,
          week: 0
        },
        specifications: {
          dimensions: { length: 0, width: 0, height: 0 },
          weight: 0,
          players: { min: 1, max: 1 },
          power_requirements: '',
          setup_time: 0
        },
        total_stock: 1,
        is_active: true,
        featured: false,
        meta_title: '',
        meta_description: ''
      });
    }
    setNewImageUrl('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        category_id: formData.category_id || null,
        description: formData.description,
        images: formData.images,
        pricing: formData.pricing,
        specifications: formData.specifications,
        total_stock: formData.total_stock,
        is_active: formData.is_active,
        featured: formData.featured,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null
      };

      if (editingProduct) {
        await ProductsService.updateProduct(editingProduct.id, productData as any);
      } else {
        await ProductsService.createProduct(productData as any);
      }
      // Recharger les données
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de l\'enregistrement du produit');
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await ProductsService.deleteProduct(productId);
      await loadData();
      setShowDeleteConfirm(null);
      setShowMenu(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  // Fermer le menu en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menu-container')) {
        setShowMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    const labels: Record<string, string> = {
      active: 'Actif',
      inactive: 'Inactif',
      maintenance: 'Maintenance'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

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
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
        >
          + Nouveau produit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Total produits</div>
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Actifs</div>
          <div className="text-2xl font-bold text-green-600">
            {products.filter(p => p.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Inactifs</div>
          <div className="text-2xl font-bold text-yellow-600">
            {products.filter(p => !p.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Stock total</div>
          <div className="text-2xl font-bold text-gray-900">
            {products.reduce((sum, p) => sum + (p.total_stock || 0), 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <input
              type="text"
              placeholder="Nom, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
            >
              <option value="all">Toutes</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix/jour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réservations</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const categoryName = categories.find(c => c.id === product.category_id)?.name || 'N/A';
                const productStatus = product.is_active ? 'active' : 'inactive';
                return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{product.description ? product.description.substring(0, 50) + '...' : 'Aucune description'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{categoryName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.total_stock || 0}
                    </div>
                    {(product.total_stock || 0) === 0 && (
                      <div className="text-xs text-red-600">Rupture</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xl font-bold text-gray-900">{product.pricing?.oneDay || 0}€</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(productStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">-</div>
                    <div className="text-xs text-gray-500">-</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 relative">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="text-[#33ffcc] hover:text-[#66cccc] mr-2"
                        title="Voir et modifier le produit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <div className="relative menu-container">
                        <button 
                          onClick={() => setShowMenu(showMenu === product.id ? null : product.id)}
                          className="text-gray-600 hover:text-gray-900 p-1"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMenu === product.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <Link
                              to={`/admin/products/${product.id}`}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => setShowMenu(null)}
                            >
                              <Edit2 className="w-4 h-4" />
                              Modifier
                            </Link>
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(product.id);
                                setShowMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun produit trouvé
          </div>
        )}
      </div>

      {/* Modale Ajouter/Modifier Produit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      placeholder="auto-généré depuis le nom"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Images */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL de l'image (https://...)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Tarification */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Tarification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix 1 jour (€) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.pricing.oneDay}
                      onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, oneDay: parseFloat(e.target.value) || 0}})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix week-end (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricing.weekend}
                      onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, weekend: parseFloat(e.target.value) || 0}})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix semaine (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricing.week}
                      onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, week: parseFloat(e.target.value) || 0}})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Spécifications techniques */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Spécifications techniques</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longueur (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.specifications.dimensions.length}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: {...formData.specifications.dimensions, length: parseInt(e.target.value) || 0}
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Largeur (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.specifications.dimensions.width}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: {...formData.specifications.dimensions, width: parseInt(e.target.value) || 0}
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hauteur (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.specifications.dimensions.height}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: {...formData.specifications.dimensions, height: parseInt(e.target.value) || 0}
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.specifications.weight}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {...formData.specifications, weight: parseFloat(e.target.value) || 0}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Joueurs min</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.specifications.players.min}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          players: {...formData.specifications.players, min: parseInt(e.target.value) || 1}
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Joueurs max</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.specifications.players.max}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          players: {...formData.specifications.players, max: parseInt(e.target.value) || 1}
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Montage (min)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.specifications.setup_time}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {...formData.specifications, setup_time: parseInt(e.target.value) || 0}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alimentation / Exigences</label>
                  <input
                    type="text"
                    value={formData.specifications.power_requirements}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: {...formData.specifications, power_requirements: e.target.value}
                    })}
                    placeholder="Ex: 220V - 300W, Batterie rechargeable, Aucune"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Stock et Statut */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Stock et Statut</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock total *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.total_stock}
                      onChange={(e) => setFormData({...formData, total_stock: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
                      />
                      <span className="text-sm font-medium text-gray-700">Produit actif</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="w-4 h-4 text-[#33ffcc] border-gray-300 rounded focus:ring-[#33ffcc]"
                      />
                      <span className="text-sm font-medium text-gray-700">Produit vedette</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">SEO (Optionnel)</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                    placeholder="Titre pour les moteurs de recherche"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    rows={2}
                    value={formData.meta_description}
                    onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                    placeholder="Description pour les moteurs de recherche"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33ffcc] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#33ffcc] text-[#000033] font-semibold rounded-lg hover:bg-[#66cccc] transition-colors"
                >
                  {editingProduct ? 'Enregistrer' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
