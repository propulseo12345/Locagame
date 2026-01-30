-- ============================================================
-- MIGRATION: Création automatique du profil client à l'inscription
-- Date: 2026-01-30
-- Description: Trigger pour créer un customer quand un user s'inscrit
-- ============================================================

-- 1. Fonction trigger pour créer le profil client automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Créer le profil client seulement si c'est un nouvel utilisateur
  -- et qu'il n'existe pas déjà dans customers, admin_users ou technicians
  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = NEW.id)
     AND NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = NEW.id)
     AND NOT EXISTS (SELECT 1 FROM technicians WHERE user_id = NEW.id) THEN

    INSERT INTO customers (
      id,
      email,
      first_name,
      last_name,
      phone,
      customer_type,
      is_guest
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.raw_user_meta_data->>'phone',
      'individual',
      false
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Policies RLS pour addresses (accès propre données)
DROP POLICY IF EXISTS "addresses_own_select" ON addresses;
CREATE POLICY "addresses_own_select" ON addresses
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "addresses_own_insert" ON addresses;
CREATE POLICY "addresses_own_insert" ON addresses
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "addresses_own_update" ON addresses;
CREATE POLICY "addresses_own_update" ON addresses
  FOR UPDATE TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "addresses_own_delete" ON addresses;
CREATE POLICY "addresses_own_delete" ON addresses
  FOR DELETE TO authenticated
  USING (customer_id = auth.uid());

-- 5. Policies RLS pour reservations (accès propre données)
DROP POLICY IF EXISTS "reservations_customer_select" ON reservations;
CREATE POLICY "reservations_customer_select" ON reservations
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR is_user_admin(auth.uid()) OR is_user_technician(auth.uid()));

DROP POLICY IF EXISTS "reservations_customer_insert" ON reservations;
CREATE POLICY "reservations_customer_insert" ON reservations
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "reservations_customer_update" ON reservations;
CREATE POLICY "reservations_customer_update" ON reservations
  FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() OR is_user_admin(auth.uid()));

-- 6. Policies pour reservation_items
DROP POLICY IF EXISTS "reservation_items_customer_select" ON reservation_items;
CREATE POLICY "reservation_items_customer_select" ON reservation_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE r.id = reservation_items.reservation_id
      AND (r.customer_id = auth.uid() OR is_user_admin(auth.uid()) OR is_user_technician(auth.uid()))
    )
  );

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger: crée automatiquement un profil customer quand un utilisateur s''inscrit via Supabase Auth';
