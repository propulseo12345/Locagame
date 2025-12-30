// Types principaux pour la plateforme LOCAGAME

export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  images: string[];
  specifications: {
    dimensions: string;
    weight: number;
    players: {
      min: number;
      max: number;
    };
    electricity: boolean;
    setup_time: number;
  };
  pricing: {
    oneDay: number;
    weekend: number;
    week: number;
    custom: number;
  };
  total_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}

export interface ProductAvailability {
  id: string;
  product_id: string;
  date: string;
  available_quantity: number;
  reserved_quantity: number;
  buffer_hours: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  postal_codes: string[];
  cities: string[];
  delivery_fee: number;
  free_delivery_threshold: number | null;
}

export interface CartItem {
  product: Product;
  start_date: string;
  end_date: string;
  quantity: number;
  delivery_mode: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_city?: string;
  delivery_postal_code?: string;
  delivery_distance?: number;
  delivery_fee: number;
  product_price: number;
  total_price: number;
}

export interface Customer {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name?: string;
  siret?: string;
  is_professional: boolean;
  customer_type?: 'individual' | 'professional';
  loyalty_points?: number;
  is_guest?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RecipientData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  sameAsCustomer: boolean;
}

export interface EventDetails {
  guestCount?: string;
  venueName?: string;
  accessDifficulty?: string;
  accessDetails?: string;
  hasElevator?: boolean;
  floorNumber?: string;
  parkingAvailable?: boolean;
  parkingDetails?: string;
  electricityAvailable?: boolean;
  setupSpace?: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  delivery_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  delivery_date?: string;
  delivery_time?: string;
  delivery_type?: 'pickup' | 'delivery';
  pickup_time?: string;
  return_time?: string;
  pickup_slot?: string;
  event_type: string;
  special_notes?: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'returned' | 'cancelled';
  created_at: string;
  // Nouveaux champs
  recipient_data?: RecipientData | null;
  event_details?: EventDetails | null;
  cgv_accepted?: boolean;
  newsletter_accepted?: boolean;
}

export interface FilterOptions {
  category?: string;
  price_min?: number;
  price_max?: number;
  players_min?: number;
  players_max?: number;
  available_dates?: {
    start: string;
    end: string;
  };
  search?: string;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'popularity' | 'newest';
}

export interface PriceCalculation {
  product_price: number;
  delivery_fee: number;
  total: number;
  duration_days: number;
  delivery_mode: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_city?: string;
  delivery_postal_code?: string;
  delivery_distance?: number;
}

export interface Vehicle {
  id: string;
  name: string; // "Camion 1", "Utilitaire 2"
  type: 'truck' | 'van';
  capacity: number; // m³ ou poids max
  licensePlate: string;
  isActive: boolean;
}

export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleId: string | null; // Véhicule assigné
  isActive: boolean;
}

export interface AccessConstraints {
  floor?: number;
  hasElevator?: boolean;
  accessCode?: string;
  parkingInfo?: string;
  specialInstructions?: string;
  contactOnSite?: string; // Nom et téléphone du contact sur site
}

export interface DeliveryTask {
  id: string;
  reservationId: string;
  orderNumber: string;
  type: 'delivery' | 'pickup';
  scheduledDate: string; // Date de livraison/retrait
  scheduledTime: string; // Heure prévue
  vehicleId: string;
  technicianId: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
  accessConstraints?: AccessConstraints;
  notes?: string;
  completedAt?: string;
  startedAt?: string;
}
