-- ============================================================
-- MIGRATION: Ajout policy RLS admin pour categories
-- Date: 2026-02-16
-- Description:
--   La table categories n'avait qu'une policy SELECT publique.
--   L'admin ne pouvait pas INSERT/UPDATE/DELETE les catégories.
--   La table products avait déjà les policies admin (rien à changer).
--   Cette migration ajoute la policy admin manquante pour categories.
-- ============================================================

-- CATEGORIES: Admin ALL (pour gestion admin + lookup import Excel)
-- Idempotent: DROP IF EXISTS avant CREATE
DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;

CREATE POLICY "categories_admin_all"
ON public.categories FOR ALL
TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

COMMENT ON TABLE categories IS 'RLS activé. Policies: categories_public_select (tous), categories_admin_all (admin CRUD).';
