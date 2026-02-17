import { useState } from 'react';
import { ProductsService } from '../../services';
import { Product } from '../../types';

export interface ProductFormData {
  name: string;
  slug: string;
  category_id: string;
  description: string;
  images: string[];
  pricing: { oneDay: number; weekend: number; week: number };
  specifications: {
    dimensions: { length: number; width: number; height: number };
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
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  slug: '',
  category_id: '',
  description: '',
  images: [],
  pricing: { oneDay: 0, weekend: 0, week: 0 },
  specifications: {
    dimensions: { length: 0, width: 0, height: 0 },
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
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        category_id: product.category_id || '',
        description: product.description || '',
        images: product.images || [],
        pricing: {
          oneDay: pricing.oneDay || 0,
          weekend: pricing.weekend || 0,
          week: pricing.week || 0,
        },
        specifications: {
          dimensions: specs.dimensions || { length: 0, width: 0, height: 0 },
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
        meta_description: formData.meta_description || null,
      };

      if (editingProduct) {
        await ProductsService.updateProduct(editingProduct.id, productData as any);
      } else {
        await ProductsService.createProduct(productData as any);
      }
      onSuccess();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
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
