-- ============================================================
-- MIGRATION: Guest Checkout Sécurisé via RPC
-- Date: 2026-01-30
-- Description: Permet aux visiteurs non connectés de créer une
--              réservation via une RPC SECURITY DEFINER atomique.
--              Aucune policy INSERT anon directe sur les tables sensibles.
-- ============================================================

-- 1. S'assurer que is_guest existe sur customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false;

-- 2. Table email_outbox pour les notifications (même sans Resend)
CREATE TABLE IF NOT EXISTS email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  template TEXT NOT NULL, -- 'ORDER_CONFIRMATION', 'ORDER_REMINDER', etc.
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- Index pour le traitement des emails en attente
CREATE INDEX IF NOT EXISTS idx_email_outbox_status_pending
  ON email_outbox(status, created_at)
  WHERE status = 'pending';

-- RLS sur email_outbox (admin seulement)
ALTER TABLE email_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_outbox_admin_all" ON email_outbox
  FOR ALL TO authenticated
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

-- 3. Fonction RPC pour le guest checkout ATOMIQUE
-- SECURITY DEFINER = s'exécute avec les droits du créateur (bypass RLS)
CREATE OR REPLACE FUNCTION public.create_guest_checkout(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_address_id UUID;
  v_reservation_id UUID;
  v_zone_id UUID;
  v_total NUMERIC;
  v_subtotal NUMERIC;
  v_delivery_fee NUMERIC;
  v_deposit_amount NUMERIC;
  v_order_number TEXT;
  v_item JSONB;
  v_item_id UUID;
  v_item_subtotal NUMERIC;
  v_product RECORD;
  v_start_date DATE;
  v_end_date DATE;
  v_available_qty INTEGER;
BEGIN
  -- Validation des champs obligatoires
  IF payload->>'email' IS NULL THEN
    RAISE EXCEPTION 'Email requis';
  END IF;
  IF payload->'items' IS NULL OR jsonb_array_length(payload->'items') = 0 THEN
    RAISE EXCEPTION 'Au moins un article requis';
  END IF;
  IF payload->>'start_date' IS NULL OR payload->>'end_date' IS NULL THEN
    RAISE EXCEPTION 'Dates de réservation requises';
  END IF;
  IF payload->>'delivery_type' IS NULL THEN
    RAISE EXCEPTION 'Type de livraison requis';
  END IF;

  -- Parser les dates
  v_start_date := (payload->>'start_date')::DATE;
  v_end_date := (payload->>'end_date')::DATE;

  -- Vérifier disponibilité AVANT de commencer
  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
  LOOP
    SELECT p.id, p.name, p.total_stock
    INTO v_product
    FROM products p
    WHERE p.id = (v_item->>'product_id')::UUID
      AND p.is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produit non trouvé ou inactif: %', v_item->>'product_id';
    END IF;

    -- Calculer le stock disponible
    SELECT COALESCE(v_product.total_stock, 1) - COALESCE(SUM(pa.quantity), 0)
    INTO v_available_qty
    FROM product_availability pa
    WHERE pa.product_id = v_product.id
      AND pa.status IN ('reserved', 'blocked', 'maintenance')
      AND pa.start_date <= v_end_date
      AND pa.end_date >= v_start_date;

    v_available_qty := COALESCE(v_available_qty, v_product.total_stock);

    IF v_available_qty < COALESCE((v_item->>'quantity')::INTEGER, 1) THEN
      RAISE EXCEPTION 'Stock insuffisant pour %: % disponible(s)', v_product.name, v_available_qty;
    END IF;
  END LOOP;

  -- Générer un numéro de commande unique
  v_order_number := 'LG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                    UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6));

  -- 1. Créer le customer guest
  INSERT INTO customers (
    id,
    email,
    first_name,
    last_name,
    phone,
    customer_type,
    company_name,
    siret,
    is_guest
  ) VALUES (
    gen_random_uuid(),
    payload->>'email',
    payload->>'first_name',
    payload->>'last_name',
    payload->>'phone',
    COALESCE(payload->>'customer_type', 'individual'),
    payload->>'company_name',
    payload->>'siret',
    true
  )
  RETURNING id INTO v_customer_id;

  -- 2. Créer l'adresse si livraison
  IF (payload->>'delivery_type') = 'delivery' AND payload->'address' IS NOT NULL THEN
    -- Trouver la zone de livraison
    SELECT dz.id INTO v_zone_id
    FROM delivery_zones dz
    WHERE dz.is_active = true
      AND (payload->'address'->>'postal_code') = ANY(dz.postal_codes)
    LIMIT 1;

    INSERT INTO addresses (
      id,
      customer_id,
      address_line1,
      address_line2,
      city,
      postal_code,
      zone_id,
      is_default
    ) VALUES (
      gen_random_uuid(),
      v_customer_id,
      payload->'address'->>'address_line1',
      payload->'address'->>'address_line2',
      payload->'address'->>'city',
      payload->'address'->>'postal_code',
      v_zone_id,
      true
    )
    RETURNING id INTO v_address_id;
  END IF;

  -- 3. Calculer les totaux
  v_subtotal := COALESCE((payload->>'subtotal')::NUMERIC, 0);
  v_delivery_fee := COALESCE((payload->>'delivery_fee')::NUMERIC, 0);
  v_total := COALESCE((payload->>'total')::NUMERIC, v_subtotal + v_delivery_fee);

  -- Calculer la caution (20% minimum 50€)
  v_deposit_amount := GREATEST(CEIL(v_subtotal * 0.20), 50);

  -- 4. Créer la réservation
  INSERT INTO reservations (
    id,
    customer_id,
    start_date,
    end_date,
    start_slot,
    end_slot,
    delivery_type,
    delivery_address_id,
    zone_id,
    delivery_time,
    pickup_time,
    return_time,
    event_type,
    event_details,
    recipient_data,
    subtotal,
    delivery_fee,
    discount,
    total,
    deposit_amount,
    status,
    notes,
    cgv_accepted,
    newsletter_accepted,
    is_business,
    billing_company_name,
    billing_vat_number,
    billing_address_line1,
    billing_address_line2,
    billing_postal_code,
    billing_city,
    billing_country,
    delivery_is_mandatory,
    pickup_is_mandatory,
    pricing_breakdown
  ) VALUES (
    gen_random_uuid(),
    v_customer_id,
    v_start_date,
    v_end_date,
    COALESCE(payload->>'start_slot', 'AM'),
    COALESCE(payload->>'end_slot', 'AM'),
    payload->>'delivery_type',
    v_address_id,
    v_zone_id,
    payload->>'delivery_time',
    payload->>'pickup_time',
    payload->>'return_time',
    payload->>'event_type',
    payload->'event_details',
    payload->'recipient_data',
    v_subtotal,
    v_delivery_fee,
    COALESCE((payload->>'discount')::NUMERIC, 0),
    v_total,
    v_deposit_amount,
    'pending',
    payload->>'notes',
    COALESCE((payload->>'cgv_accepted')::BOOLEAN, false),
    COALESCE((payload->>'newsletter_accepted')::BOOLEAN, false),
    COALESCE((payload->>'is_business')::BOOLEAN, false),
    payload->>'billing_company_name',
    payload->>'billing_vat_number',
    payload->>'billing_address_line1',
    payload->>'billing_address_line2',
    payload->>'billing_postal_code',
    payload->>'billing_city',
    COALESCE(payload->>'billing_country', 'FR'),
    COALESCE((payload->>'delivery_is_mandatory')::BOOLEAN, false),
    COALESCE((payload->>'pickup_is_mandatory')::BOOLEAN, false),
    payload->'pricing_breakdown'
  )
  RETURNING id INTO v_reservation_id;

  -- 5. Créer les items de réservation et bloquer le stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
  LOOP
    v_item_subtotal := COALESCE((v_item->>'subtotal')::NUMERIC,
                        (v_item->>'unit_price')::NUMERIC * COALESCE((v_item->>'quantity')::INTEGER, 1));

    -- Créer l'item
    INSERT INTO reservation_items (
      id,
      reservation_id,
      product_id,
      quantity,
      duration_days,
      unit_price,
      subtotal
    ) VALUES (
      gen_random_uuid(),
      v_reservation_id,
      (v_item->>'product_id')::UUID,
      COALESCE((v_item->>'quantity')::INTEGER, 1),
      COALESCE((v_item->>'duration_days')::INTEGER, 1),
      COALESCE((v_item->>'unit_price')::NUMERIC, 0),
      v_item_subtotal
    )
    RETURNING id INTO v_item_id;

    -- Bloquer le stock (product_availability)
    INSERT INTO product_availability (
      id,
      product_id,
      reservation_id,
      start_date,
      end_date,
      quantity,
      status
    ) VALUES (
      gen_random_uuid(),
      (v_item->>'product_id')::UUID,
      v_reservation_id,
      v_start_date,
      v_end_date,
      COALESCE((v_item->>'quantity')::INTEGER, 1),
      'reserved'
    );
  END LOOP;

  -- 6. Créer l'email de confirmation dans l'outbox
  INSERT INTO email_outbox (
    to_email,
    template,
    payload
  ) VALUES (
    payload->>'email',
    'ORDER_CONFIRMATION',
    jsonb_build_object(
      'reservation_id', v_reservation_id,
      'order_number', v_order_number,
      'customer_name', COALESCE(payload->>'first_name', '') || ' ' || COALESCE(payload->>'last_name', ''),
      'email', payload->>'email',
      'start_date', v_start_date,
      'end_date', v_end_date,
      'total', v_total,
      'deposit_amount', v_deposit_amount,
      'items_count', jsonb_array_length(payload->'items')
    )
  );

  -- 7. Retourner les informations de la réservation
  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'order_number', v_order_number,
    'customer_id', v_customer_id,
    'customer_email', payload->>'email',
    'total', v_total,
    'deposit_amount', v_deposit_amount,
    'status', 'pending'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, tout est automatiquement rollback
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Accorder l'exécution à tous (anon pour guest checkout, authenticated pour clients connectés)
GRANT EXECUTE ON FUNCTION public.create_guest_checkout(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.create_guest_checkout(JSONB) TO authenticated;

COMMENT ON FUNCTION public.create_guest_checkout(JSONB) IS
'RPC SECURITY DEFINER pour créer une réservation guest de manière atomique.
Crée: customer guest, address, reservation, reservation_items, product_availability, email_outbox.
Vérifie la disponibilité et calcule la caution automatiquement.
Retourne: {success, reservation_id, order_number, customer_email, total, deposit_amount}';

-- 4. Fonction utilitaire pour vérifier si un email existe déjà
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers
    WHERE email = email_to_check
      AND is_guest = false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO authenticated;

COMMENT ON FUNCTION public.check_email_exists(TEXT) IS
'Vérifie si un email est déjà utilisé par un client enregistré (non-guest).';
