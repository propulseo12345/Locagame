-- Migration: Ajouter les champs d'adresse de facturation pour les clients professionnels
-- Table: reservations

-- Ajouter les colonnes de facturation
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS is_business BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS billing_company_name TEXT,
ADD COLUMN IF NOT EXISTS billing_vat_number TEXT,
ADD COLUMN IF NOT EXISTS billing_address_line1 TEXT,
ADD COLUMN IF NOT EXISTS billing_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS billing_postal_code TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'FR';

-- Commentaires pour documentation
COMMENT ON COLUMN reservations.is_business IS 'True si commande passée en tant que professionnel';
COMMENT ON COLUMN reservations.billing_company_name IS 'Nom de la société (requis si is_business=true)';
COMMENT ON COLUMN reservations.billing_vat_number IS 'Numéro de TVA intracommunautaire (optionnel)';
COMMENT ON COLUMN reservations.billing_address_line1 IS 'Adresse de facturation ligne 1 (requis si is_business=true)';
COMMENT ON COLUMN reservations.billing_address_line2 IS 'Adresse de facturation ligne 2 (optionnel)';
COMMENT ON COLUMN reservations.billing_postal_code IS 'Code postal facturation (requis si is_business=true)';
COMMENT ON COLUMN reservations.billing_city IS 'Ville facturation (requis si is_business=true)';
COMMENT ON COLUMN reservations.billing_country IS 'Pays facturation (requis si is_business=true, défaut FR)';

-- Note: La validation des champs requis pour is_business=true sera faite côté frontend
-- Une contrainte CHECK pourra être ajoutée en production si nécessaire:
-- CHECK (is_business = false OR (billing_company_name IS NOT NULL AND billing_address_line1 IS NOT NULL AND billing_postal_code IS NOT NULL AND billing_city IS NOT NULL))
