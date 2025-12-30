-- Migration: Nettoyage des données
-- Date: 2024-12-30
-- Description: Supprime toutes les réservations et clients sauf Marieeeee Lefebvre

-- =====================================================
-- 1. IDENTIFIER LE CLIENT À GARDER
-- =====================================================
-- D'abord, trouvons l'ID du client Marieeeee Lefebvre

-- =====================================================
-- 2. SUPPRIMER LES DONNÉES LIÉES AUX RÉSERVATIONS
-- =====================================================

-- Supprimer les tâches de livraison des réservations à supprimer
DELETE FROM delivery_tasks
WHERE reservation_id IN (
  SELECT r.id FROM reservations r
  JOIN customers c ON r.customer_id = c.id
  WHERE c.first_name != 'Marieeeee' OR c.last_name != 'Lefebvre'
);

-- Supprimer les disponibilités/blocages liés aux réservations à supprimer
DELETE FROM product_availability
WHERE reservation_id IN (
  SELECT r.id FROM reservations r
  JOIN customers c ON r.customer_id = c.id
  WHERE c.first_name != 'Marieeeee' OR c.last_name != 'Lefebvre'
);

-- Supprimer les items de réservation
DELETE FROM reservation_items
WHERE reservation_id IN (
  SELECT r.id FROM reservations r
  JOIN customers c ON r.customer_id = c.id
  WHERE c.first_name != 'Marieeeee' OR c.last_name != 'Lefebvre'
);

-- Supprimer les réservations
DELETE FROM reservations
WHERE customer_id IN (
  SELECT id FROM customers
  WHERE first_name != 'Marieeeee' OR last_name != 'Lefebvre'
);

-- =====================================================
-- 3. SUPPRIMER LES ADRESSES DES CLIENTS À SUPPRIMER
-- =====================================================

DELETE FROM addresses
WHERE customer_id IN (
  SELECT id FROM customers
  WHERE first_name != 'Marieeeee' OR last_name != 'Lefebvre'
);

-- =====================================================
-- 4. SUPPRIMER LES CLIENTS
-- =====================================================

DELETE FROM customers
WHERE first_name != 'Marieeeee' OR last_name != 'Lefebvre';

-- =====================================================
-- 5. SUPPRIMER LA TABLE DELIVERY_ZONES (optionnel)
-- =====================================================
-- Décommenter si vous voulez supprimer complètement la table zones

-- DROP TABLE IF EXISTS delivery_zones CASCADE;

-- =====================================================
-- VÉRIFICATION
-- =====================================================
-- Après exécution, vérifier avec:
-- SELECT * FROM customers;
-- SELECT * FROM reservations;
