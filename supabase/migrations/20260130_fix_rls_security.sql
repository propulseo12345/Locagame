-- ============================================================
-- MIGRATION: Correction sécurité RLS
-- Date: 2026-01-30
-- Description: Réactive RLS et supprime les policies anon dangereuses
-- ============================================================

-- 1. RÉACTIVER RLS SUR TOUTES LES TABLES SENSIBLES
-- (Idempotent: si déjà activé, pas d'erreur)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER LES POLICIES ANON DANGEREUSES
-- (Ces policies permettaient des INSERT/SELECT sans restriction)
DROP POLICY IF EXISTS "Allow anon to check customer email" ON customers;
DROP POLICY IF EXISTS "Allow anon to create guest customers" ON customers;
DROP POLICY IF EXISTS "Allow anon to create addresses" ON addresses;
DROP POLICY IF EXISTS "Allow anon to read addresses" ON addresses;
DROP POLICY IF EXISTS "Allow anon to create reservations" ON reservations;
DROP POLICY IF EXISTS "Allow anon to read reservations" ON reservations;
DROP POLICY IF EXISTS "Allow anon to create reservation items" ON reservation_items;
DROP POLICY IF EXISTS "Allow anon to read reservation items" ON reservation_items;
DROP POLICY IF EXISTS "Allow anon to create availability blocks" ON product_availability;

-- 3. SUPPRIMER LES POLICIES ADMIN EN DOUBLE
-- (Déjà gérées par les policies existantes via is_user_admin())
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Admins can update all customers" ON customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON customers;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can update all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage product availability" ON product_availability;
DROP POLICY IF EXISTS "Admins can view all reservation items" ON reservation_items;
DROP POLICY IF EXISTS "Admins can manage all reservation items" ON reservation_items;

-- 4. VERIFICATION (commentaires informatifs)
-- Les policies correctes sont définies dans 20250121_security_rls_locagame.sql
-- et utilisent les fonctions helper:
--   - is_user_admin(auth.uid())
--   - is_user_technician(auth.uid())
--   - get_technician_id()

COMMENT ON TABLE customers IS 'RLS activé. Policies: customers_own_* pour clients, customers_admin_* pour admins.';
COMMENT ON TABLE reservations IS 'RLS activé. Policies: reservations_customer_* pour clients, reservations_admin_all pour admins, reservations_technician_select pour techs.';
