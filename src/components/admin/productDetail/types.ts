// Types shared across AdminProductDetail sub-components

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  pricing: {
    oneDay: number;
    weekend: number;
    week: number;
    customDurations: any[];
  };
  total_stock: number;
  is_active: boolean;
  featured: boolean;
  images: string[];
  specifications: {
    dimensions: { length: number; width: number; height: number };
    weight: number;
    players: { min: number; max: number };
    power_requirements: string;
    setup_time: number;
  };
  meta_title: string;
  meta_description: string;
  multi_day_coefficient: number;
}

export interface NewAvailability {
  start_date: string;
  end_date: string;
  quantity: number;
  status: 'maintenance' | 'blocked';
  buffer_hours: number;
}

export const INITIAL_FORM_DATA: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  category_id: '',
  pricing: {
    oneDay: 0,
    weekend: 0,
    week: 0,
    customDurations: []
  },
  total_stock: 1,
  is_active: true,
  featured: false,
  images: [],
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
};

export const INITIAL_AVAILABILITY: NewAvailability = {
  start_date: '',
  end_date: '',
  quantity: 1,
  status: 'blocked',
  buffer_hours: 24
};
