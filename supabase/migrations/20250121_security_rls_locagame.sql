-- ============================================================
-- LOCAGAME - Migration Sécurité RLS
-- Date: 2025-01-21
-- Objectif: Auth + RLS pour 3 rôles (Admin, Client, Technicien)
-- SANS checkout guest / anon insert sur tables sensibles
-- ============================================================

-- ============================================================
-- SECTION 1: SUPPRESSION DE TOUTES LES POLICIES EXISTANTES
-- ============================================================

-- customers
DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can update all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Allow anon to check customer email" ON public.customers;
DROP POLICY IF EXISTS "Allow anon to create guest customers" ON public.customers;
DROP POLICY IF EXISTS "Customers can insert own profile" ON public.customers;
DROP POLICY IF EXISTS "Customers can update own profile" ON public.customers;
DROP POLICY IF EXISTS "Customers can view own profile" ON public.customers;

-- addresses
DROP POLICY IF EXISTS "Admins can manage all addresses" ON public.addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON public.addresses;
DROP POLICY IF EXISTS "Allow anon to create addresses" ON public.addresses;
DROP POLICY IF EXISTS "Allow anon to read addresses" ON public.addresses;
DROP POLICY IF EXISTS "Customers can manage own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Customers can view own addresses" ON public.addresses;

-- reservations
DROP POLICY IF EXISTS "Admins can delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can manage all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can update all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow anon to create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow anon to read reservations" ON public.reservations;
DROP POLICY IF EXISTS "Customers can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Customers can view own reservations" ON public.reservations;

-- reservation_items
DROP POLICY IF EXISTS "Admins can manage all reservation items" ON public.reservation_items;
DROP POLICY IF EXISTS "Admins can view all reservation items" ON public.reservation_items;
DROP POLICY IF EXISTS "Allow anon to create reservation items" ON public.reservation_items;
DROP POLICY IF EXISTS "Allow anon to read reservation items" ON public.reservation_items;
DROP POLICY IF EXISTS "Customers can view own reservation items" ON public.reservation_items;

-- delivery_tasks
DROP POLICY IF EXISTS "Admins can manage tasks" ON public.delivery_tasks;
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.delivery_tasks;
DROP POLICY IF EXISTS "Technicians can update own tasks" ON public.delivery_tasks;
DROP POLICY IF EXISTS "Technicians can view own tasks" ON public.delivery_tasks;

-- technicians
DROP POLICY IF EXISTS "Admins can view all technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can view own technician status" ON public.technicians;

-- vehicles
DROP POLICY IF EXISTS "Admins can manage vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Vehicles are readable by authenticated users" ON public.vehicles;

-- product_availability
DROP POLICY IF EXISTS "Admins can manage product availability" ON public.product_availability;
DROP POLICY IF EXISTS "Allow anon to create availability blocks" ON public.product_availability;
DROP POLICY IF EXISTS "Product availability is publicly readable" ON public.product_availability;

-- admin_users
DROP POLICY IF EXISTS "Admins can update own profile" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own admin status" ON public.admin_users;

-- ============================================================
-- SECTION 2: FONCTIONS HELPER (SECURITY DEFINER)
-- ============================================================

-- is_user_admin: vérifie si l'utilisateur est un admin actif
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = check_user_id
    AND is_active = true
  );
$$;

-- is_user_technician: vérifie si l'utilisateur est un technicien actif
CREATE OR REPLACE FUNCTION public.is_user_technician(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM technicians
    WHERE user_id = check_user_id
    AND is_active = true
  );
$$;

-- get_technician_id: retourne l'ID du technicien pour l'utilisateur courant
CREATE OR REPLACE FUNCTION public.get_technician_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM technicians
  WHERE user_id = auth.uid()
  AND is_active = true
  LIMIT 1;
$$;

-- get_technician_vehicle_id: retourne l'ID du véhicule du technicien courant
CREATE OR REPLACE FUNCTION public.get_technician_vehicle_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT vehicle_id FROM technicians
  WHERE user_id = auth.uid()
  AND is_active = true
  LIMIT 1;
$$;

-- ============================================================
-- SECTION 3: RPC pour UPDATE limité des delivery_tasks
-- (RLS ne peut pas limiter par colonnes)
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_delivery_task_status(
  p_task_id uuid,
  p_status text,
  p_started_at timestamptz DEFAULT NULL,
  p_completed_at timestamptz DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_technician_id uuid;
  v_task_technician_id uuid;
BEGIN
  -- Récupérer l'ID technicien de l'appelant
  SELECT get_technician_id() INTO v_technician_id;

  IF v_technician_id IS NULL THEN
    RAISE EXCEPTION 'Not a technician';
  END IF;

  -- Vérifier que la tâche appartient au technicien
  SELECT technician_id INTO v_task_technician_id
  FROM delivery_tasks WHERE id = p_task_id;

  IF v_task_technician_id IS NULL THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  IF v_task_technician_id != v_technician_id THEN
    RAISE EXCEPTION 'Not your task';
  END IF;

  -- Valider le status
  IF p_status NOT IN ('scheduled', 'in_progress', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  -- Update limité aux colonnes autorisées
  UPDATE delivery_tasks
  SET
    status = p_status,
    started_at = COALESCE(p_started_at, started_at),
    completed_at = COALESCE(p_completed_at, completed_at),
    updated_at = NOW()
  WHERE id = p_task_id;

  RETURN json_build_object('success', true, 'task_id', p_task_id);
END;
$$;

-- ============================================================
-- SECTION 4: ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================================

-- Tables sensibles
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Tables de référence
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_difficulty_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION 5: POLICIES - ADMIN_USERS
-- ============================================================

-- Admin peut tout voir et gérer
CREATE POLICY "admin_users_admin_all"
ON public.admin_users FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- User peut voir son propre statut admin
CREATE POLICY "admin_users_own_select"
ON public.admin_users FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- SECTION 6: POLICIES - CUSTOMERS
-- ============================================================

-- Admin: SELECT/UPDATE/DELETE all
CREATE POLICY "customers_admin_select"
ON public.customers FOR SELECT TO authenticated
USING (is_user_admin(auth.uid()));

CREATE POLICY "customers_admin_update"
ON public.customers FOR UPDATE TO authenticated
USING (is_user_admin(auth.uid()));

CREATE POLICY "customers_admin_delete"
ON public.customers FOR DELETE TO authenticated
USING (is_user_admin(auth.uid()));

-- Client: SELECT own
CREATE POLICY "customers_own_select"
ON public.customers FOR SELECT TO authenticated
USING (id = auth.uid());

-- Client: INSERT own (onboarding première connexion)
CREATE POLICY "customers_own_insert"
ON public.customers FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- Client: UPDATE own
CREATE POLICY "customers_own_update"
ON public.customers FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================
-- SECTION 7: POLICIES - ADDRESSES
-- ============================================================

-- Admin: SELECT all
CREATE POLICY "addresses_admin_select"
ON public.addresses FOR SELECT TO authenticated
USING (is_user_admin(auth.uid()));

-- Client: CRUD own
CREATE POLICY "addresses_customer_select"
ON public.addresses FOR SELECT TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY "addresses_customer_insert"
ON public.addresses FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "addresses_customer_update"
ON public.addresses FOR UPDATE TO authenticated
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "addresses_customer_delete"
ON public.addresses FOR DELETE TO authenticated
USING (customer_id = auth.uid());

-- Technicien: SELECT uniquement via delivery_tasks -> reservations
CREATE POLICY "addresses_technician_select"
ON public.addresses FOR SELECT TO authenticated
USING (
  is_user_technician(auth.uid())
  AND id IN (
    SELECT r.delivery_address_id
    FROM reservations r
    INNER JOIN delivery_tasks dt ON dt.reservation_id = r.id
    WHERE dt.technician_id = get_technician_id()
    AND r.delivery_address_id IS NOT NULL
  )
);

-- ============================================================
-- SECTION 8: POLICIES - RESERVATIONS
-- ============================================================

-- Admin: ALL
CREATE POLICY "reservations_admin_all"
ON public.reservations FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- Client: SELECT own
CREATE POLICY "reservations_customer_select"
ON public.reservations FOR SELECT TO authenticated
USING (customer_id = auth.uid());

-- Client: INSERT own
CREATE POLICY "reservations_customer_insert"
ON public.reservations FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());

-- Technicien: SELECT via delivery_tasks
CREATE POLICY "reservations_technician_select"
ON public.reservations FOR SELECT TO authenticated
USING (
  is_user_technician(auth.uid())
  AND id IN (
    SELECT reservation_id FROM delivery_tasks
    WHERE technician_id = get_technician_id()
  )
);

-- ============================================================
-- SECTION 9: POLICIES - RESERVATION_ITEMS
-- ============================================================

-- Admin: ALL
CREATE POLICY "reservation_items_admin_all"
ON public.reservation_items FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- Client: SELECT own (via reservation)
CREATE POLICY "reservation_items_customer_select"
ON public.reservation_items FOR SELECT TO authenticated
USING (
  reservation_id IN (
    SELECT id FROM reservations WHERE customer_id = auth.uid()
  )
);

-- Client: INSERT own (via reservation)
CREATE POLICY "reservation_items_customer_insert"
ON public.reservation_items FOR INSERT TO authenticated
WITH CHECK (
  reservation_id IN (
    SELECT id FROM reservations WHERE customer_id = auth.uid()
  )
);

-- Technicien: SELECT via delivery_tasks
CREATE POLICY "reservation_items_technician_select"
ON public.reservation_items FOR SELECT TO authenticated
USING (
  is_user_technician(auth.uid())
  AND reservation_id IN (
    SELECT reservation_id FROM delivery_tasks
    WHERE technician_id = get_technician_id()
  )
);

-- ============================================================
-- SECTION 10: POLICIES - DELIVERY_TASKS
-- ============================================================

-- Admin: ALL
CREATE POLICY "delivery_tasks_admin_all"
ON public.delivery_tasks FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- Technicien: SELECT own
CREATE POLICY "delivery_tasks_technician_select"
ON public.delivery_tasks FOR SELECT TO authenticated
USING (technician_id = get_technician_id());

-- Note: UPDATE technicien via RPC update_delivery_task_status() uniquement
-- Pas de policy UPDATE directe pour le technicien

-- ============================================================
-- SECTION 11: POLICIES - TECHNICIANS
-- ============================================================

-- Admin: ALL
CREATE POLICY "technicians_admin_all"
ON public.technicians FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- Technicien: SELECT own
CREATE POLICY "technicians_own_select"
ON public.technicians FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Technicien: UPDATE own (profil limité)
CREATE POLICY "technicians_own_update"
ON public.technicians FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- SECTION 12: POLICIES - VEHICLES
-- ============================================================

-- Admin: ALL
CREATE POLICY "vehicles_admin_all"
ON public.vehicles FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- Technicien: SELECT son véhicule uniquement
CREATE POLICY "vehicles_technician_select"
ON public.vehicles FOR SELECT TO authenticated
USING (
  is_user_technician(auth.uid())
  AND id = get_technician_vehicle_id()
);

-- ============================================================
-- SECTION 13: POLICIES - PRODUCT_AVAILABILITY
-- ============================================================

-- Public: SELECT (pour afficher disponibilités dans le catalogue)
CREATE POLICY "product_availability_public_select"
ON public.product_availability FOR SELECT TO anon, authenticated
USING (true);

-- Admin: ALL
CREATE POLICY "product_availability_admin_all"
ON public.product_availability FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- ============================================================
-- SECTION 14: POLICIES - APP_SETTINGS
-- ============================================================

-- Admin only: ALL
CREATE POLICY "app_settings_admin_all"
ON public.app_settings FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- Pas de SELECT public sur app_settings

-- ============================================================
-- SECTION 15: POLICIES - TABLES DE RÉFÉRENCE (lecture publique)
-- ============================================================

-- delivery_zones
CREATE POLICY "delivery_zones_public_select"
ON public.delivery_zones FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "delivery_zones_admin_all"
ON public.delivery_zones FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- event_types
CREATE POLICY "event_types_public_select"
ON public.event_types FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "event_types_admin_all"
ON public.event_types FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- faqs
CREATE POLICY "faqs_public_select"
ON public.faqs FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "faqs_admin_all"
ON public.faqs FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- testimonials
CREATE POLICY "testimonials_public_select"
ON public.testimonials FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "testimonials_admin_all"
ON public.testimonials FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- time_slots
CREATE POLICY "time_slots_public_select"
ON public.time_slots FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "time_slots_admin_all"
ON public.time_slots FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- access_difficulty_types
CREATE POLICY "access_difficulty_types_public_select"
ON public.access_difficulty_types FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "access_difficulty_types_admin_all"
ON public.access_difficulty_types FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- portfolio_events
CREATE POLICY "portfolio_events_public_select"
ON public.portfolio_events FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "portfolio_events_admin_all"
ON public.portfolio_events FOR ALL TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- ============================================================
-- SECTION 16: INDEX POUR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id_active
ON public.admin_users(user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_technicians_user_id_active
ON public.technicians(user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_delivery_tasks_technician_id
ON public.delivery_tasks(technician_id);

CREATE INDEX IF NOT EXISTS idx_delivery_tasks_reservation_id
ON public.delivery_tasks(reservation_id);

CREATE INDEX IF NOT EXISTS idx_reservations_customer_id
ON public.reservations(customer_id);

CREATE INDEX IF NOT EXISTS idx_addresses_customer_id
ON public.addresses(customer_id);

CREATE INDEX IF NOT EXISTS idx_reservation_items_reservation_id
ON public.reservation_items(reservation_id);

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================

COMMENT ON FUNCTION is_user_admin IS 'Vérifie si user est admin actif - SECURITY DEFINER';
COMMENT ON FUNCTION is_user_technician IS 'Vérifie si user est technicien actif - SECURITY DEFINER';
COMMENT ON FUNCTION get_technician_id IS 'Retourne technicians.id pour auth.uid() - SECURITY DEFINER';
COMMENT ON FUNCTION get_technician_vehicle_id IS 'Retourne vehicle_id du technicien - SECURITY DEFINER';
COMMENT ON FUNCTION update_delivery_task_status IS 'RPC pour update limité des tâches par technicien';
