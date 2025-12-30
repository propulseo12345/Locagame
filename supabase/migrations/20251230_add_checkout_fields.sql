-- =====================================================
-- Migration: Ajout des colonnes manquantes pour le checkout
-- Date: 2025-12-30
-- Description: Stockage complet des donnees du checkout
-- =====================================================

-- =====================================================
-- 1. COLONNES MANQUANTES DANS RESERVATIONS
-- =====================================================

-- Heures pick-up (mode retrait entrepot)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS pickup_time TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS return_time TEXT;

-- Creneau recuperation (mode livraison)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS pickup_slot TEXT;

-- Donnees receptionnaire (JSONB pour flexibilite)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS recipient_data JSONB;

-- Details evenement complets (JSONB)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS event_details JSONB;

-- Consentements legaux
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cgv_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS newsletter_accepted BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 2. COLONNE MANQUANTE DANS CUSTOMERS
-- =====================================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS siret TEXT;

-- =====================================================
-- 3. COMMENTAIRES DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN reservations.pickup_time IS 'Heure de retrait client (mode pickup) - format HH:MM';
COMMENT ON COLUMN reservations.return_time IS 'Heure de retour client (mode pickup) - format HH:MM';
COMMENT ON COLUMN reservations.pickup_slot IS 'Creneau recuperation technicien (morning/afternoon)';
COMMENT ON COLUMN reservations.recipient_data IS 'JSON: {firstName, lastName, phone, email, sameAsCustomer}';
COMMENT ON COLUMN reservations.event_details IS 'JSON: {guestCount, venueName, accessDifficulty, accessDetails, hasElevator, floorNumber, parkingAvailable, parkingDetails, electricityAvailable, setupSpace}';
COMMENT ON COLUMN reservations.cgv_accepted IS 'Acceptation CGV lors de la commande';
COMMENT ON COLUMN reservations.newsletter_accepted IS 'Opt-in newsletter';
COMMENT ON COLUMN customers.siret IS 'Numero SIRET pour clients professionnels';
