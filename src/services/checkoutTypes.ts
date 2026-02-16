/**
 * Types pour le service de checkout LOCAGAME
 */

export interface CheckoutPayload {
  // Client
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  customer_type: 'individual' | 'professional';
  company_name?: string;
  siret?: string;

  // Adresse (si livraison)
  address?: {
    address_line1: string;
    address_line2?: string;
    city: string;
    postal_code: string;
  };

  // Réservation
  start_date: string;
  end_date: string;
  start_slot?: string;
  end_slot?: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_time?: string;
  pickup_time?: string;
  return_time?: string;
  event_type?: string;
  event_details?: Record<string, unknown>;
  recipient_data?: Record<string, unknown>;
  notes?: string;

  // Pricing
  subtotal: number;
  delivery_fee: number;
  discount?: number;
  total: number;
  pricing_breakdown?: Record<string, unknown>;

  // Items
  items: Array<{
    product_id: string;
    quantity: number;
    duration_days: number;
    unit_price: number;
    subtotal: number;
  }>;

  // Flags
  cgv_accepted: boolean;
  newsletter_accepted?: boolean;
  is_business?: boolean;
  delivery_is_mandatory?: boolean;
  pickup_is_mandatory?: boolean;

  // Facturation (si professionnel)
  billing_company_name?: string;
  billing_vat_number?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_postal_code?: string;
  billing_city?: string;
  billing_country?: string;
}

export interface CheckoutResult {
  success: boolean;
  reservation_id?: string;
  order_number?: string;
  customer_id?: string;
  customer_email?: string;
  total?: number;
  deposit_amount?: number;
  status?: string;
  error?: string;
}
