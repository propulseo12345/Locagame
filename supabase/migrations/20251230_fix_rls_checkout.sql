-- Migration: Fix RLS policies for checkout flow
-- Date: 2024-12-30
-- Description: Permet aux utilisateurs anonymes et authentifiés de créer des réservations

-- =====================================================
-- DÉSACTIVER RLS TEMPORAIREMENT POUR LE DÉVELOPPEMENT
-- (À remplacer par des politiques appropriées en production)
-- =====================================================

-- Désactiver RLS sur les tables du checkout
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_availability DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- ALTERNATIVE: POLITIQUES RLS PERMISSIVES (pour production)
-- Décommenter si vous voulez garder RLS activé
-- =====================================================

/*
-- Permettre à tous de créer des customers (pour les invités)
CREATE POLICY "Allow insert customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read own customer" ON customers
  FOR SELECT USING (true);

-- Permettre la création d'adresses
CREATE POLICY "Allow insert addresses" ON addresses
  FOR INSERT WITH CHECK (true);

-- Permettre la création de réservations
CREATE POLICY "Allow insert reservations" ON reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read reservations" ON reservations
  FOR SELECT USING (true);

-- Permettre la création d'items de réservation
CREATE POLICY "Allow insert reservation_items" ON reservation_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read reservation_items" ON reservation_items
  FOR SELECT USING (true);

-- Permettre la création de tâches de livraison
CREATE POLICY "Allow insert delivery_tasks" ON delivery_tasks
  FOR INSERT WITH CHECK (true);

-- Permettre la gestion des disponibilités
CREATE POLICY "Allow insert product_availability" ON product_availability
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read product_availability" ON product_availability
  FOR SELECT USING (true);
*/

-- =====================================================
-- AJOUTER LE STATUT 'pending_review' SI NÉCESSAIRE
-- =====================================================

-- Vérifier si la colonne status accepte 'pending_review'
-- (Si c'est un ENUM, il faudra l'ajouter)
-- ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'pending_review';

COMMENT ON TABLE reservations IS 'Table des réservations/demandes de devis. Status: pending_review (nouvelle demande), confirmed (validée), rejected (refusée), preparing, delivered, completed, cancelled';
