-- ============================================================
-- Migration: Expiration automatique des réservations pending_payment
-- Libère le stock bloqué par les réservations abandonnées (> 24h)
-- ============================================================

-- 1. Ajouter 'expired' au CHECK constraint sur reservations.status
ALTER TABLE reservations DROP CONSTRAINT reservations_status_check;

ALTER TABLE reservations ADD CONSTRAINT reservations_status_check
  CHECK (status = ANY (ARRAY[
    'pending_payment'::text,
    'pending'::text,
    'confirmed'::text,
    'preparing'::text,
    'delivered'::text,
    'completed'::text,
    'cancelled'::text,
    'expired'::text
  ]));

-- 2. Activer pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 3. Fonction d'expiration
CREATE OR REPLACE FUNCTION public.expire_pending_reservations()
RETURNS TABLE(expired_count INT, released_availability_count INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_ids UUID[];
  v_expired_count INT;
  v_released_count INT;
BEGIN
  -- Identifier les réservations à expirer (pending_payment > 24h)
  SELECT ARRAY_AGG(id)
  INTO v_expired_ids
  FROM reservations
  WHERE status = 'pending_payment'
    AND created_at < NOW() - INTERVAL '24 hours';

  -- Si rien à expirer, sortir
  IF v_expired_ids IS NULL OR array_length(v_expired_ids, 1) IS NULL THEN
    expired_count := 0;
    released_availability_count := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Libérer le stock : supprimer les entrées product_availability
  DELETE FROM product_availability
  WHERE reservation_id = ANY(v_expired_ids);
  GET DIAGNOSTICS v_released_count = ROW_COUNT;

  -- Mettre à jour le statut des réservations
  UPDATE reservations
  SET status = 'expired',
      updated_at = NOW()
  WHERE id = ANY(v_expired_ids);
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  -- Log dans security_logs pour traçabilité
  INSERT INTO security_logs (user_id, event, details)
  VALUES (
    NULL,
    'reservations_auto_expired',
    jsonb_build_object(
      'expired_count', v_expired_count,
      'released_availability_count', v_released_count,
      'reservation_ids', to_jsonb(v_expired_ids),
      'executed_at', NOW()
    )
  );

  expired_count := v_expired_count;
  released_availability_count := v_released_count;
  RETURN NEXT;
  RETURN;
END;
$$;

-- 4. Planifier l'exécution toutes les heures via pg_cron
SELECT cron.schedule(
  'expire-pending-reservations',
  '0 * * * *',
  'SELECT * FROM public.expire_pending_reservations()'
);

-- 5. Permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT EXECUTE ON FUNCTION public.expire_pending_reservations() TO service_role;
