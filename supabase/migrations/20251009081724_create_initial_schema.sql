/*
  # LOCAGAME Initial Database Schema

  ## Overview
  Complete database structure for LOCAGAME e-commerce rental platform supporting
  product catalog, real-time availability tracking, reservations, delivery zones,
  and customer management.

  ## Tables Created

  ### 1. categories
  - Product organization by 8 main categories (Casino, Bar Games, Video Games, etc.)
  - Fields: id, name, slug, description, display_order, icon

  ### 2. products
  - Complete product catalog with specifications and pricing tiers
  - Fields: id, category_id, name, slug, description, specifications (JSONB),
    pricing (JSONB), total_stock, images (array), seo metadata, status
  - Pricing structure supports: 1-day, weekend, week, custom durations
  - Specifications: dimensions, weight, players, power requirements, setup time

  ### 3. delivery_zones
  - PACA region delivery zone management
  - Fields: id, name, postal_codes, cities, delivery_fee, free_threshold,
    estimated_time, is_active
  - Supports Marseille free delivery and regional pricing

  ### 4. customers
  - Customer profiles linked to Supabase auth
  - Fields: id (auth.uid), email, first_name, last_name, phone, customer_type,
    loyalty_points, created_at
  - Customer types: individual, professional

  ### 5. addresses
  - Delivery address management per customer
  - Fields: id, customer_id, address components, zone_id, is_default

  ### 6. reservations
  - Main booking records with pricing and status tracking
  - Fields: id, customer_id, dates, delivery details, pricing breakdown,
    payment info, status, notes
  - Statuses: pending, confirmed, preparing, delivered, completed, cancelled

  ### 7. reservation_items
  - Individual products within each reservation
  - Fields: id, reservation_id, product_id, quantity, duration_days, unit_price,
    subtotal

  ### 8. product_availability
  - Real-time availability tracking with buffer periods
  - Fields: id, product_id, reservation_id, start_date, end_date, quantity,
    buffer_hours, status

  ### 9. admin_users
  - Back-office user management
  - Fields: id, user_id (auth.uid), role, permissions (JSONB), is_active

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Restrictive policies requiring authentication
  - Customers can only access their own data
  - Admin users have elevated permissions based on roles

  ## Important Notes
  - All timestamps use timestamptz for timezone support
  - JSONB fields for flexible data structures (pricing, specifications, permissions)
  - Foreign keys with CASCADE for data integrity
  - Indexes on frequently queried fields (dates, slugs, zones)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  specifications jsonb DEFAULT '{}'::jsonb,
  pricing jsonb NOT NULL DEFAULT '{
    "oneDay": 0,
    "weekend": 0,
    "week": 0,
    "customDurations": []
  }'::jsonb,
  total_stock integer DEFAULT 1,
  images text[] DEFAULT ARRAY[]::text[],
  meta_title text,
  meta_description text,
  is_active boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable when active"
  ON products FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Delivery zones table
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  postal_codes text[] DEFAULT ARRAY[]::text[],
  cities text[] DEFAULT ARRAY[]::text[],
  delivery_fee numeric(10,2) DEFAULT 0,
  free_delivery_threshold numeric(10,2),
  estimated_delivery_time text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Delivery zones are publicly readable when active"
  ON delivery_zones FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  customer_type text DEFAULT 'individual' CHECK (customer_type IN ('individual', 'professional')),
  company_name text,
  loyalty_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Customers can insert own profile"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  postal_code text NOT NULL,
  zone_id uuid REFERENCES delivery_zones(id),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can manage own addresses"
  ON addresses FOR ALL
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  delivery_time text,
  delivery_type text NOT NULL CHECK (delivery_type IN ('pickup', 'delivery')),
  delivery_address_id uuid REFERENCES addresses(id),
  zone_id uuid REFERENCES delivery_zones(id),
  event_type text,
  subtotal numeric(10,2) DEFAULT 0,
  delivery_fee numeric(10,2) DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  payment_method text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_transaction_id text,
  deposit_amount numeric(10,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivered', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Reservation items table
CREATE TABLE IF NOT EXISTS reservation_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  duration_days integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own reservation items"
  ON reservation_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reservations
      WHERE reservations.id = reservation_items.reservation_id
      AND reservations.customer_id = auth.uid()
    )
  );

-- Product availability table
CREATE TABLE IF NOT EXISTS product_availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  buffer_hours integer DEFAULT 24,
  status text DEFAULT 'reserved' CHECK (status IN ('reserved', 'maintenance', 'blocked')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product availability is publicly readable"
  ON product_availability FOR SELECT
  TO authenticated, anon
  USING (true);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'staff')),
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  vehicle_id uuid, -- Will reference vehicles table
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can view own profile"
  ON technicians FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all technicians"
  ON technicians FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('truck', 'van')),
  capacity numeric(10,2) NOT NULL, -- m³
  license_plate text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicles are readable by authenticated users"
  ON vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage vehicles"
  ON vehicles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Add foreign key from technicians to vehicles
ALTER TABLE technicians 
  ADD CONSTRAINT fk_technician_vehicle 
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;

-- Delivery tasks table
CREATE TABLE IF NOT EXISTS delivery_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  order_number text,
  type text NOT NULL CHECK (type IN ('delivery', 'pickup')),
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  technician_id uuid REFERENCES technicians(id) ON DELETE SET NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  customer_data jsonb, -- Store customer info snapshot
  address_data jsonb, -- Store address info snapshot
  products_data jsonb, -- Store products info snapshot
  access_constraints jsonb,
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE delivery_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can view own tasks"
  ON delivery_tasks FOR SELECT
  TO authenticated
  USING (
    technician_id IN (
      SELECT id FROM technicians WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all tasks"
  ON delivery_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage tasks"
  ON delivery_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Technicians can update own tasks"
  ON delivery_tasks FOR UPDATE
  TO authenticated
  USING (
    technician_id IN (
      SELECT id FROM technicians WHERE user_id = auth.uid()
    )
  );

-- Function to check product availability
CREATE OR REPLACE FUNCTION check_product_availability(
  p_product_id uuid,
  p_start_date date,
  p_end_date date,
  p_quantity integer
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_stock integer;
  v_reserved_quantity integer;
BEGIN
  -- Get total stock for the product
  SELECT total_stock INTO v_total_stock
  FROM products
  WHERE id = p_product_id AND is_active = true;
  
  IF v_total_stock IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calculate reserved quantity for the period
  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved_quantity
  FROM product_availability
  WHERE product_id = p_product_id
    AND status = 'reserved'
    AND (
      (start_date <= p_end_date AND end_date >= p_start_date)
    );
  
  -- Check if enough stock is available
  RETURN (v_total_stock - v_reserved_quantity) >= p_quantity;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_availability_product ON product_availability(product_id);
CREATE INDEX IF NOT EXISTS idx_availability_dates ON product_availability(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_technicians_user ON technicians(user_id);
CREATE INDEX IF NOT EXISTS idx_technicians_vehicle ON technicians(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_technician ON delivery_tasks(technician_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_vehicle ON delivery_tasks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_date ON delivery_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_reservation ON delivery_tasks(reservation_id);
