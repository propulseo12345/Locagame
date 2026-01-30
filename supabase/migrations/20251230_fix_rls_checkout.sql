-- ============================================================
-- MIGRATION DÉSACTIVÉE - DANGEREUSE POUR LA SÉCURITÉ
-- ============================================================
--
-- Cette migration désactivait RLS sur les tables sensibles.
-- Elle a été neutralisée le 2026-01-30 pour raisons de sécurité.
--
-- ORIGINAL: Désactivait RLS sur customers, addresses, reservations,
--           reservation_items, delivery_tasks, product_availability
--
-- RAISON: Une application en production NE DOIT JAMAIS désactiver RLS
--         sur des tables contenant des données sensibles.
--
-- SOLUTION: Le guest checkout est géré via une RPC SECURITY DEFINER
--           (voir migration 20260130_secure_guest_checkout.sql)
--
-- ============================================================

-- NO-OP: Cette migration ne fait plus rien intentionnellement
SELECT 1;
