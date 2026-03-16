// Types principaux pour la plateforme LOCAGAME

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  category_id: string;
  images: string[];
  specifications: {
    dimensions: string | null;
    weight: number | null;
    players: {
      min: number;
      max: number;
    };
    electricity: boolean;
    setup_time: number;
    power_requirements?: string;
  };
  pricing: {
    oneDay: number;
    weekend: number;
    week: number;
    custom: number;
    customDurations?: Array<{ minDays: number; maxDays: number; price: number }>;
  };
  total_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  featured?: boolean | null;
  meta_title?: string | null;
  meta_description?: string | null;
  multi_day_coefficient?: number;
  weekend_flat_price?: number | null;
  delivery_people_count?: number;
  pickup_people_count?: number;
  /** Catégorie principale jointe (relation Supabase, rétrocompat) */
  category?: Category | null;
  /** Multi-catégories — données brutes de la table de liaison */
  product_categories?: Array<{
    category_id: string;
    categories: { id: string; name: string; slug?: string } | null;
  }>;
  /** Multi-catégories normalisées (extrait de product_categories) */
  categories?: Category[];
}

/** Créneau horaire: matin (AM) ou après-midi (PM) */
export type DaySlot = 'AM' | 'PM';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description: string;
  icon: string;
  display_order?: number | null;
  created_at?: string;
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
  /** Créneau de début: AM (matin) ou PM (après-midi) */
  start_slot?: DaySlot;
  /** Créneau de fin: AM (matin) ou PM (après-midi) */
  end_slot?: DaySlot;
}

export interface Customer {
  id?: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  company_name?: string | null;
  siret?: string | null;
  is_professional?: boolean;
  customer_type?: string | null;
  loyalty_points?: number | null;
  is_guest?: boolean | null;
  stripe_customer_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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

/** Données de facturation pour les clients professionnels */
export interface BillingAddress {
  company_name: string;
  vat_number?: string;
  address_line1: string;
  address_line2?: string;
  postal_code: string;
  city: string;
  country: string;
}

/** Règle tarifaire appliquée à une réservation */
export interface PricingRuleApplied {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: 'flat_rate' | 'surcharge' | 'discount';
}

/** Breakdown complet du pricing pour une réservation */
export interface PricingBreakdownData {
  base_price: number;
  base_price_label: string;
  quantity: number;
  product_subtotal: number;
  duration_days: number;
  rules_applied: PricingRuleApplied[];
  surcharges_total: number;
  total: number;
  weekend_flat_rate_applied: boolean;
  info_message?: string;
}

/** Item d'une réservation (table reservation_items) */
export interface ReservationItem {
  id: string;
  reservation_id?: string | null;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  duration_days: number;
  delivery_people_count?: number | null;
  pickup_people_count?: number | null;
  created_at?: string | null;
  /** Produit joint (relation Supabase) */
  product?: { name: string } & Record<string, unknown>;
}

export interface Order {
  id: string;
  customer_id?: string | null;
  customer?: Customer;
  items?: CartItem[];
  // Dates de la réservation (champs DB obligatoires)
  start_date: string;
  end_date: string;
  // Adresse de livraison
  delivery_address_id?: string | null;
  delivery_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  delivery_time?: string | null;
  delivery_type: string;
  pickup_time?: string | null;
  return_time?: string | null;
  pickup_slot?: string | null;
  event_type?: string | null;
  notes?: string | null;
  subtotal?: number | null;
  delivery_fee?: number | null;
  discount?: number | null;
  total: number;
  status: 'pending_payment' | 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'returned' | 'completed' | 'cancelled';
  payment_status?: 'unpaid' | 'pending_payment' | 'paid' | 'failed' | 'expired' | 'refunded' | string | null;
  payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
  paid_at?: string | null;
  payment_method?: string | null;
  created_at: string | null;
  updated_at?: string | null;
  // Relations
  reservation_items?: ReservationItem[];
  // Métadonnées checkout
  recipient_data?: RecipientData | null;
  event_details?: EventDetails | null;
  cgv_accepted?: boolean | null;
  newsletter_accepted?: boolean | null;
  // Champs de facturation (clients professionnels)
  is_business?: boolean;
  billing_company_name?: string | null;
  billing_vat_number?: string | null;
  billing_address_line1?: string | null;
  billing_address_line2?: string | null;
  billing_postal_code?: string | null;
  billing_city?: string | null;
  billing_country?: string | null;
  // Champs pricing rules (forfait week-end + majorations)
  start_slot?: DaySlot | string | null;
  end_slot?: DaySlot | string | null;
  delivery_is_mandatory?: boolean | null;
  pickup_is_mandatory?: boolean | null;
  pricing_breakdown?: PricingBreakdownData | null;
  deposit_amount?: number | null;
  zone_id?: string | null;
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
  delivery_mode?: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_city?: string;
  delivery_postal_code?: string;
  delivery_distance?: number;
  zone?: DeliveryZone;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'van';
  capacity: number;
  licensePlate: string;
  isActive: boolean;
}

export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleId: string | null;
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
  status: 'scheduled' | 'assigned' | 'en_route' | 'delivered' | 'cancelled';
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
