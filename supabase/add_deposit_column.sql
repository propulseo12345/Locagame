-- ============================================================================
-- LOCAGAME - Ajout du dépôt de garantie (caution)
-- ============================================================================
-- Ce fichier ajoute le support des dépôts de garantie dans les réservations
-- À exécuter dans: Supabase Dashboard > SQL Editor
-- ============================================================================

-- Ajouter la colonne deposit à la table reservations
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS deposit numeric(10,2) DEFAULT 0;

-- Ajouter la colonne deposit_refunded pour tracker les remboursements
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS deposit_refunded boolean DEFAULT false;

-- Ajouter la colonne deposit_refunded_at pour la date de remboursement
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS deposit_refunded_at timestamptz;

-- Commentaires
COMMENT ON COLUMN reservations.deposit IS 'Dépôt de garantie (caution) demandé au client';
COMMENT ON COLUMN reservations.deposit_refunded IS 'Si true, le dépôt a été remboursé au client';
COMMENT ON COLUMN reservations.deposit_refunded_at IS 'Date et heure du remboursement du dépôt';

-- ============================================================================
-- Fonction : Rembourser le dépôt après retour du matériel
-- ============================================================================

CREATE OR REPLACE FUNCTION refund_deposit(
  p_reservation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que la réservation existe et est complétée
  IF NOT EXISTS (
    SELECT 1 FROM reservations
    WHERE id = p_reservation_id
    AND status IN ('completed', 'returned')
  ) THEN
    RAISE EXCEPTION 'Reservation % cannot have deposit refunded (not completed/returned)',
      p_reservation_id;
  END IF;

  -- Vérifier que le dépôt n'est pas déjà remboursé
  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE id = p_reservation_id
    AND deposit_refunded = true
  ) THEN
    RAISE EXCEPTION 'Deposit for reservation % already refunded', p_reservation_id;
  END IF;

  -- Marquer le dépôt comme remboursé
  UPDATE reservations
  SET
    deposit_refunded = true,
    deposit_refunded_at = now()
  WHERE id = p_reservation_id;

  RAISE NOTICE 'Deposit refunded for reservation %', p_reservation_id;
END;
$$;

COMMENT ON FUNCTION refund_deposit IS 'Marque le dépôt de garantie comme remboursé après vérification du matériel';

-- ============================================================================
-- Vue : Réservations avec détails dépôt
-- ============================================================================

CREATE OR REPLACE VIEW reservations_with_deposit_status AS
SELECT
  r.*,
  CASE
    WHEN r.deposit > 0 AND r.deposit_refunded = false THEN 'pending'
    WHEN r.deposit > 0 AND r.deposit_refunded = true THEN 'refunded'
    WHEN r.deposit = 0 THEN 'none'
  END as deposit_status
FROM reservations r;

COMMENT ON VIEW reservations_with_deposit_status IS 'Vue des réservations avec le statut du dépôt de garantie';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
