import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductsService, CategoriesService } from '../../services';
import { Product } from '../../types';
import {
  ProductFormData,
  NewAvailability,
  INITIAL_FORM_DATA,
  INITIAL_AVAILABILITY
} from '../../components/admin/productDetail/types';

export function useProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [newAvailability, setNewAvailability] = useState<NewAvailability>(INITIAL_AVAILABILITY);

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
      setNewAvailability(INITIAL_AVAILABILITY);
    } catch (error) {
      console.error('Error adding availability:', error);
      alert('Erreur lors de l\'ajout de la disponibilite');
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette disponibilite ?')) {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      alert('Produit mis a jour avec succes !');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Erreur lors de la mise a jour du produit');
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

  return {
    id,
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
  };
}
