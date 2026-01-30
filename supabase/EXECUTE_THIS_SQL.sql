-- ============================================================================
-- LOCAGAME - SCRIPT SQL COMPLET À EXÉCUTER DANS SUPABASE
-- ============================================================================
-- Ce fichier crée TOUTES les tables et insère TOUTES les données
-- À exécuter dans: Supabase Dashboard > SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. SUPPRESSION DES TABLES EXISTANTES (si besoin de reset)
-- ============================================================================
-- Décommenter les lignes suivantes si vous voulez tout supprimer et recommencer
/*
DROP TABLE IF EXISTS customer_favorites CASCADE;
DROP TABLE IF EXISTS delivery_tasks CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS technicians CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS product_availability CASCADE;
DROP TABLE IF EXISTS reservation_items CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
*/

-- ============================================================================
-- 2. CRÉATION DES TABLES
-- ============================================================================

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

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'staff')),
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  vehicle_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('truck', 'van')),
  capacity numeric(10,2) NOT NULL,
  license_plate text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key from technicians to vehicles
ALTER TABLE technicians DROP CONSTRAINT IF EXISTS fk_technician_vehicle;
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
  customer_data jsonb,
  address_data jsonb,
  products_data jsonb,
  access_constraints jsonb,
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer favorites table
CREATE TABLE IF NOT EXISTS customer_favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- ============================================================================
-- 3. INDEXES POUR PERFORMANCE
-- ============================================================================

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
CREATE INDEX IF NOT EXISTS idx_favorites_customer ON customer_favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON customer_favorites(product_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;

-- Categories policies
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Products policies
DROP POLICY IF EXISTS "Products are publicly readable when active" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Products are publicly readable when active"
  ON products FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Delivery zones policies
DROP POLICY IF EXISTS "Delivery zones are publicly readable when active" ON delivery_zones;
DROP POLICY IF EXISTS "Admins can manage delivery zones" ON delivery_zones;

CREATE POLICY "Delivery zones are publicly readable when active"
  ON delivery_zones FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admins can manage delivery zones"
  ON delivery_zones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Customers policies
DROP POLICY IF EXISTS "Customers can view own profile" ON customers;
DROP POLICY IF EXISTS "Customers can update own profile" ON customers;
DROP POLICY IF EXISTS "Customers can insert own profile" ON customers;
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Admins can manage all customers" ON customers;

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

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage all customers"
  ON customers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Addresses policies
DROP POLICY IF EXISTS "Customers can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Customers can manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;

CREATE POLICY "Customers can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can manage own addresses"
  ON addresses FOR ALL
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can view all addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage all addresses"
  ON addresses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Reservations policies
DROP POLICY IF EXISTS "Customers can view own reservations" ON reservations;
DROP POLICY IF EXISTS "Customers can create reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can manage all reservations" ON reservations;

CREATE POLICY "Customers can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage all reservations"
  ON reservations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Reservation items policies
DROP POLICY IF EXISTS "Customers can view own reservation items" ON reservation_items;
DROP POLICY IF EXISTS "Admins can view all reservation items" ON reservation_items;
DROP POLICY IF EXISTS "Admins can manage all reservation items" ON reservation_items;

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

CREATE POLICY "Admins can view all reservation items"
  ON reservation_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage all reservation items"
  ON reservation_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Product availability policies
DROP POLICY IF EXISTS "Product availability is publicly readable" ON product_availability;
DROP POLICY IF EXISTS "Admins can manage product availability" ON product_availability;

CREATE POLICY "Product availability is publicly readable"
  ON product_availability FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage product availability"
  ON product_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Technicians policies
DROP POLICY IF EXISTS "Technicians can view own profile" ON technicians;
DROP POLICY IF EXISTS "Admins can view all technicians" ON technicians;
DROP POLICY IF EXISTS "Admins can manage technicians" ON technicians;

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

CREATE POLICY "Admins can manage technicians"
  ON technicians FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Vehicles policies
DROP POLICY IF EXISTS "Vehicles are readable by authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Admins can manage vehicles" ON vehicles;

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

-- Delivery tasks policies
DROP POLICY IF EXISTS "Technicians can view own tasks" ON delivery_tasks;
DROP POLICY IF EXISTS "Admins can view all tasks" ON delivery_tasks;
DROP POLICY IF EXISTS "Admins can manage tasks" ON delivery_tasks;
DROP POLICY IF EXISTS "Technicians can update own tasks" ON delivery_tasks;

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

-- Customer favorites policies
DROP POLICY IF EXISTS "Customers can view own favorites" ON customer_favorites;
DROP POLICY IF EXISTS "Customers can manage own favorites" ON customer_favorites;
DROP POLICY IF EXISTS "Admins can view all favorites" ON customer_favorites;

CREATE POLICY "Customers can view own favorites"
  ON customer_favorites FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can manage own favorites"
  ON customer_favorites FOR ALL
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can view all favorites"
  ON customer_favorites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Admin users policies
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

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

-- ============================================================================
-- 5. FONCTIONS SQL
-- ============================================================================

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
  SELECT total_stock INTO v_total_stock
  FROM products
  WHERE id = p_product_id AND is_active = true;

  IF v_total_stock IS NULL THEN
    RETURN false;
  END IF;

  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved_quantity
  FROM product_availability
  WHERE product_id = p_product_id
    AND status = 'reserved'
    AND (
      (start_date <= p_end_date AND end_date >= p_start_date)
    );

  RETURN (v_total_stock - v_reserved_quantity) >= p_quantity;
END;
$$;

-- ============================================================================
-- 6. SEED DATA - CATÉGORIES
-- ============================================================================

INSERT INTO categories (name, slug, description, display_order, icon) VALUES
  ('Casino', 'casino', 'Tables de jeu professionnelles pour une soirée casino réussie', 1, '🎰'),
  ('Jeux de Bar', 'jeux-de-bar', 'Baby-foot, billard, fléchettes et autres jeux conviviaux', 2, '🎯'),
  ('Jeux Vidéo', 'jeux-video', 'Consoles, bornes d''arcade et jeux vidéo rétro', 3, '🎮'),
  ('Animations', 'animations', 'Structures gonflables et animations pour événements', 4, '🎪'),
  ('Événements', 'evenements', 'Équipements pour vos événements professionnels', 5, '🎉'),
  ('Extérieur', 'exterieur', 'Jeux géants et activités outdoor', 6, '🌳'),
  ('Réalité Virtuelle', 'realite-virtuelle', 'Casques VR et expériences immersives', 7, '🥽'),
  ('Décoration', 'decoration', 'Éléments de décoration thématiques', 8, '✨')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 7. SEED DATA - ZONES DE LIVRAISON
-- ============================================================================

INSERT INTO delivery_zones (name, postal_codes, cities, delivery_fee, free_delivery_threshold, estimated_delivery_time, is_active) VALUES
  (
    'Marseille et périphérie',
    ARRAY['13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008', '13009', '13010', '13011', '13012', '13013', '13014', '13015', '13016'],
    ARRAY['Marseille'],
    0,
    0,
    '2-4 heures',
    true
  ),
  (
    'Bouches-du-Rhône Ouest',
    ARRAY['13220', '13127', '13320', '13500', '13800', '13170', '13140'],
    ARRAY['Châteauneuf-les-Martigues', 'Vitrolles', 'Bouc-Bel-Air', 'Martigues', 'Istres', 'Les Pennes-Mirabeau', 'Miramas'],
    45,
    300,
    '4-6 heures',
    true
  ),
  (
    'Bouches-du-Rhône Est',
    ARRAY['13400', '13600', '13390', '13120'],
    ARRAY['Aubagne', 'La Ciotat', 'Auriol', 'Gardanne'],
    45,
    300,
    '4-6 heures',
    true
  ),
  (
    'Aix-en-Provence et environs',
    ARRAY['13080', '13090', '13100', '13290', '13540'],
    ARRAY['Aix-en-Provence', 'Puyricard'],
    55,
    350,
    '6-8 heures',
    true
  ),
  (
    'Var',
    ARRAY['83000', '83100', '83200', '83300', '83400', '83500', '83600'],
    ARRAY['Toulon', 'Draguignan', 'Hyères', 'La Seyne-sur-Mer', 'Fréjus'],
    85,
    500,
    'Jour suivant',
    true
  ),
  (
    'Alpes-Maritimes',
    ARRAY['06000', '06100', '06200', '06300', '06400', '06500'],
    ARRAY['Nice', 'Cannes', 'Menton'],
    120,
    600,
    'Jour suivant',
    true
  ),
  (
    'Vaucluse',
    ARRAY['84000', '84100', '84200', '84300', '84400'],
    ARRAY['Avignon', 'Orange', 'Carpentras', 'Cavaillon', 'Apt'],
    95,
    500,
    'Jour suivant',
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. SEED DATA - PRODUITS
-- ============================================================================

DO $$
DECLARE
  casino_id uuid;
  bar_games_id uuid;
  video_games_id uuid;
  outdoor_id uuid;
  vr_id uuid;
BEGIN
  SELECT id INTO casino_id FROM categories WHERE slug = 'casino' LIMIT 1;
  SELECT id INTO bar_games_id FROM categories WHERE slug = 'jeux-de-bar' LIMIT 1;
  SELECT id INTO video_games_id FROM categories WHERE slug = 'jeux-video' LIMIT 1;
  SELECT id INTO outdoor_id FROM categories WHERE slug = 'exterieur' LIMIT 1;
  SELECT id INTO vr_id FROM categories WHERE slug = 'realite-virtuelle' LIMIT 1;

  IF casino_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, slug, description, specifications, pricing, total_stock, images, is_active, featured) VALUES
      (
        casino_id,
        'Table de Roulette Professionnelle',
        'table-roulette-pro',
        'Table de roulette professionnelle avec roue en bois massif et tapis de jeu en feutrine verte. Installation et explication des règles incluses.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('length', 200, 'width', 120, 'height', 90),
          'weight', 85,
          'players', jsonb_build_object('min', 1, 'max', 8),
          'power_requirements', 'Aucune',
          'setup_time', 30
        ),
        jsonb_build_object(
          'oneDay', 180,
          'weekend', 320,
          'week', 550,
          'customDurations', jsonb_build_array()
        ),
        3,
        ARRAY['https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800'],
        true,
        true
      ),
      (
        casino_id,
        'Table de Blackjack Premium',
        'table-blackjack-premium',
        'Table de blackjack semi-circulaire pour 7 joueurs avec sabot professionnel et jetons inclus.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('length', 210, 'width', 130, 'height', 90),
          'weight', 75,
          'players', jsonb_build_object('min', 1, 'max', 7),
          'power_requirements', 'Aucune',
          'setup_time', 25
        ),
        jsonb_build_object(
          'oneDay', 150,
          'weekend', 270,
          'week', 480,
          'customDurations', jsonb_build_array()
        ),
        5,
        ARRAY['https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800'],
        true,
        true
      )
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  IF bar_games_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, slug, description, specifications, pricing, total_stock, images, is_active, featured) VALUES
      (
        bar_games_id,
        'Baby-foot Professionnel Bonzini',
        'babyfoot-bonzini',
        'Baby-foot professionnel de compétition Bonzini B90 avec barres télescopiques et balles officielles.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('length', 150, 'width', 75, 'height', 90),
          'weight', 90,
          'players', jsonb_build_object('min', 2, 'max', 4),
          'power_requirements', 'Aucune',
          'setup_time', 15
        ),
        jsonb_build_object(
          'oneDay', 80,
          'weekend', 140,
          'week', 250,
          'customDurations', jsonb_build_array()
        ),
        8,
        ARRAY['https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800'],
        true,
        true
      )
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  IF video_games_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, slug, description, specifications, pricing, total_stock, images, is_active, featured) VALUES
      (
        video_games_id,
        'Borne d''Arcade Rétro Multijeux',
        'borne-arcade-retro',
        'Borne d''arcade avec plus de 3000 jeux rétro (Pac-Man, Street Fighter, etc.) et design vintage authentique.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('length', 70, 'width', 80, 'height', 180),
          'weight', 120,
          'players', jsonb_build_object('min', 1, 'max', 2),
          'power_requirements', '220V - 300W',
          'setup_time', 20
        ),
        jsonb_build_object(
          'oneDay', 120,
          'weekend', 210,
          'week', 380,
          'customDurations', jsonb_build_array()
        ),
        6,
        ARRAY['https://images.unsplash.com/photo-1577003833154-a6e6c2a00c4f?w=800'],
        true,
        true
      )
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  IF outdoor_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, slug, description, specifications, pricing, total_stock, images, is_active, featured) VALUES
      (
        outdoor_id,
        'Jeu de Pétanque Géant',
        'petanque-geante',
        'Boules de pétanque géantes gonflables pour des parties amusantes en extérieur. Inclut 6 boules et 1 cochonnet.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('diameter', 50),
          'weight', 5,
          'players', jsonb_build_object('min', 2, 'max', 12),
          'power_requirements', 'Aucune',
          'setup_time', 10
        ),
        jsonb_build_object(
          'oneDay', 45,
          'weekend', 75,
          'week', 130,
          'customDurations', jsonb_build_array()
        ),
        10,
        ARRAY['https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800'],
        true,
        false
      )
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  IF vr_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, slug, description, specifications, pricing, total_stock, images, is_active, featured) VALUES
      (
        vr_id,
        'Pack VR Meta Quest 3',
        'vr-meta-quest-3',
        'Pack complet de réalité virtuelle avec casque Meta Quest 3, manettes et sélection de jeux premium.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('length', 20, 'width', 15, 'height', 10),
          'weight', 1,
          'players', jsonb_build_object('min', 1, 'max', 1),
          'power_requirements', 'Batterie rechargeable',
          'setup_time', 5
        ),
        jsonb_build_object(
          'oneDay', 90,
          'weekend', 160,
          'week', 290,
          'customDurations', jsonb_build_array()
        ),
        4,
        ARRAY['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800'],
        true,
        true
      )
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- ✅ FIN DU SCRIPT
-- ============================================================================

-- Afficher un résumé
DO $$
DECLARE
  cat_count int;
  zone_count int;
  prod_count int;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;
  SELECT COUNT(*) INTO zone_count FROM delivery_zones;
  SELECT COUNT(*) INTO prod_count FROM products;

  RAISE NOTICE '✅ Setup terminé avec succès!';
  RAISE NOTICE '📊 Catégories: %', cat_count;
  RAISE NOTICE '🚚 Zones de livraison: %', zone_count;
  RAISE NOTICE '🎮 Produits: %', prod_count;
END $$;
