-- Rollback: Suppression du système de clés d'accès
-- Annule la migration 20251229_add_access_keys.sql

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS create_access_key(uuid, text, timestamptz);
DROP FUNCTION IF EXISTS verify_access_key(text, text);
DROP FUNCTION IF EXISTS generate_access_key();

-- Supprimer les politiques RLS
DROP POLICY IF EXISTS "Admins can manage access keys" ON access_keys;
DROP POLICY IF EXISTS "Admins can view all access keys" ON access_keys;
DROP POLICY IF EXISTS "Customers can view own access keys" ON access_keys;

-- Supprimer les index
DROP INDEX IF EXISTS idx_access_keys_customer;
DROP INDEX IF EXISTS idx_access_keys_key;

-- Supprimer la table
DROP TABLE IF EXISTS access_keys;
