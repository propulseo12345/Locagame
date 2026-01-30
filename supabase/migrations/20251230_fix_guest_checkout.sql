-- ============================================================
-- MIGRATION DÉSACTIVÉE - POLICIES TROP PERMISSIVES
-- ============================================================
--
-- Cette migration créait des policies anon avec WITH CHECK (true)
-- permettant à n'importe qui d'insérer des données dans les tables
-- sensibles sans restriction.
--
-- Neutralisée le 2026-01-30 pour raisons de sécurité.
--
-- ORIGINAL: Créait des policies INSERT/SELECT anon sur customers,
--           addresses, reservations, reservation_items, product_availability
--           avec WITH CHECK (true) - DANGEREUX
--
-- SOLUTION: Le guest checkout est géré via une RPC SECURITY DEFINER
--           (voir migration 20260130_secure_guest_checkout.sql)
--
-- ============================================================

-- Garder uniquement les modifications de schéma non-sensibles

-- 1. Support is_guest column (déjà appliqué, idempotent)
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS is_guest boolean DEFAULT false;

-- 2. Colonnes pickup/return (déjà appliqué, idempotent)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS pickup_time TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS return_time TEXT;

-- 3. Contrainte types de tâches (idempotent)
ALTER TABLE delivery_tasks DROP CONSTRAINT IF EXISTS delivery_tasks_type_check;
ALTER TABLE delivery_tasks ADD CONSTRAINT delivery_tasks_type_check
  CHECK (type IN ('delivery', 'pickup', 'client_pickup', 'client_return'));

-- NOTE: Les policies anon dangereuses ont été supprimées.
-- Le guest checkout utilise maintenant la RPC create_guest_checkout()
