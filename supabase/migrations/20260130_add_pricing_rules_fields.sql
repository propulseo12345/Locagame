-- Migration: Ajout des champs pour les règles tarifaires (forfait week-end + majorations)
-- Date: 2026-01-30

-- ============================================
-- 1. PRODUCTS: Ajouter weekend_flat_price
-- ============================================

-- Champ pour le prix forfaitaire week-end (ex: 125€ pour un babyfoot)
-- Si NULL, le forfait week-end ne s'applique pas à ce produit
ALTER TABLE products
ADD COLUMN IF NOT EXISTS weekend_flat_price NUMERIC(10,2) DEFAULT NULL;

-- Commentaire explicatif
COMMENT ON COLUMN products.weekend_flat_price IS
  'Prix forfaitaire pour les locations week-end. Si défini, ce prix remplace le calcul standard quand la période couvre un week-end.';

-- ============================================
-- 2. RESERVATIONS: Ajouter les champs slots et pricing
-- ============================================

-- Créneaux de début et fin (AM = matin, PM = après-midi)
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS start_slot TEXT DEFAULT 'AM' CHECK (start_slot IN ('AM', 'PM'));

ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS end_slot TEXT DEFAULT 'AM' CHECK (end_slot IN ('AM', 'PM'));

-- Flags pour livraison/reprise impérative (déclenche les majorations)
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS delivery_is_mandatory BOOLEAN DEFAULT FALSE;

ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS pickup_is_mandatory BOOLEAN DEFAULT FALSE;

-- Breakdown du pricing pour audit/affichage admin
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS pricing_breakdown JSONB DEFAULT NULL;

-- Commentaires explicatifs
COMMENT ON COLUMN reservations.start_slot IS
  'Créneau de début de location: AM (matin) ou PM (après-midi)';

COMMENT ON COLUMN reservations.end_slot IS
  'Créneau de fin de location: AM (matin) ou PM (après-midi)';

COMMENT ON COLUMN reservations.delivery_is_mandatory IS
  'Si true, le client exige une livraison à la date exacte (peut déclencher une majoration week-end/férié)';

COMMENT ON COLUMN reservations.pickup_is_mandatory IS
  'Si true, le client exige une reprise à la date exacte (peut déclencher une majoration week-end/férié)';

COMMENT ON COLUMN reservations.pricing_breakdown IS
  'Détail du calcul de prix: base, règles appliquées, majorations, total. Format JSON pour audit.';

-- ============================================
-- 3. MISE À JOUR DES PRODUITS EXISTANTS
-- ============================================

-- Exemple: Définir le forfait week-end pour les babyfoots (catégorie typique)
-- Cette requête ne s'exécute que si la catégorie "Babyfoot" existe
-- Ajustez selon vos données réelles

-- Tentative de mise à jour basée sur le nom du produit contenant "baby" (insensible à la casse)
UPDATE products
SET weekend_flat_price = 125.00
WHERE LOWER(name) LIKE '%baby%'
  AND weekend_flat_price IS NULL;

-- ============================================
-- 4. INDEX POUR PERFORMANCE
-- ============================================

-- Index sur les nouveaux champs fréquemment filtrés
CREATE INDEX IF NOT EXISTS idx_reservations_delivery_mandatory
  ON reservations(delivery_is_mandatory)
  WHERE delivery_is_mandatory = TRUE;

CREATE INDEX IF NOT EXISTS idx_reservations_pickup_mandatory
  ON reservations(pickup_is_mandatory)
  WHERE pickup_is_mandatory = TRUE;

-- Index sur weekend_flat_price pour filtrer les produits avec forfait
CREATE INDEX IF NOT EXISTS idx_products_weekend_flat_price
  ON products(weekend_flat_price)
  WHERE weekend_flat_price IS NOT NULL;
