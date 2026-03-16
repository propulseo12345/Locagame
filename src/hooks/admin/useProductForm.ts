import { useState } from 'react';
import { ProductsService } from '../../services';
import { Product } from '../../types';
import { logger } from '../../lib/logger';

export interface ProductFormData {
  name: string;
  slug: string;
  category_ids: string[];
  description: string;
  images: string[];
  pricing: { oneDay: number; weekend: number; week: number };
  specifications: {
    dimensions: string;
    weight: number;
    players: { min: number; max: number };
    power_requirements: string;
    setup_time: number;
  };
  total_stock: number;
  is_active: boolean;
  featured: boolean;
  meta_title: string;
  meta_description: string;
  delivery_people_count: number;
  pickup_people_count: number;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  slug: '',
  category_ids: [],
  description: '',
  images: [],
  pricing: { oneDay: 0, weekend: 0, week: 0 },
  specifications: {
    dimensions: '',
    weight: 0,
    players: { min: 1, max: 1 },
    power_requirements: '',
    setup_time: 0,
  },
  total_stock: 1,
  is_active: true,
  featured: false,
  meta_title: '',
  meta_description: '',
  delivery_people_count: 1,
  pickup_people_count: 1,
};

export function useProductForm(onSuccess: () => void) {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [newImageUrl, setNewImageUrl] = useState('');

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      const pricing = product.pricing || {};
      const specs = product.specifications || {};

      // Extraire les category_ids depuis product_categories (many-to-many)
      // avec fallback sur category_id (legacy)
      let categoryIds: string[] = [];
      if (product.product_categories && product.product_categories.length > 0) {
        categoryIds = product.product_categories.map(pc => pc.category_id);
      } else if (product.categories && product.categories.length > 0) {
        categoryIds = product.categories.map(c => c.id);
      } else if (product.category_id) {
        categoryIds = [product.category_id];
      }

      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        category_ids: categoryIds,
        description: product.description || '',
        images: product.images || [],
        pricing: {
          oneDay: pricing.oneDay || 0,
          weekend: pricing.weekend || 0,
          week: pricing.week || 0,
        },
        specifications: {
          dimensions: typeof specs.dimensions === 'string' ? specs.dimensions : '',
          weight: specs.weight || 0,
          players: specs.players || { min: 1, max: 1 },
          power_requirements: specs.power_requirements || '',
          setup_time: specs.setup_time || 0,
        },
        total_stock: product.total_stock || 1,
        is_active: product.is_active !== false,
        featured: product.featured || false,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        delivery_people_count: product.delivery_people_count ?? 1,
        pickup_people_count: product.pickup_people_count ?? 1,
      });
    } else {
      setEditingProduct(null);
      setFormData(EMPTY_FORM);
    }
    setNewImageUrl('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // category_id = première catégorie sélectionnée (rétrocompat)
      const primaryCategoryId = formData.category_ids[0] || null;

      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        category_id: primaryCategoryId,
        description: formData.description,
        images: formData.images,
        pricing: formData.pricing,
        specifications: formData.specifications,
        total_stock: formData.total_stock,
        is_active: formData.is_active,
        featured: formData.featured,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        delivery_people_count: formData.delivery_people_count,
        pickup_people_count: formData.pickup_people_count,
      };

      let productId: string;
      if (editingProduct) {
        await ProductsService.updateProduct(editingProduct.id, productData as any);
        productId = editingProduct.id;
      } else {
        const created = await ProductsService.createProduct(productData as any);
        productId = created.id;
      }

      // Synchronise la table de liaison many-to-many
      await ProductsService.setProductCategories(productId, formData.category_ids);

      onSuccess();
      closeModal();
    } catch (error) {
      logger.error('Error saving product', error);
      alert("Erreur lors de l'enregistrement du produit");
    }
  };

  return {
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
  };
}
