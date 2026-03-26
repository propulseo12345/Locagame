-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Sécurisation guest checkout + correction réservations aberrantes
-- Date: 2026-03-25
--
-- Problèmes corrigés:
-- 1. create_guest_checkout faisait confiance aveugle aux prix frontend
--    → Réécrite pour déléguer le pricing à validate_and_create_reservation
-- 2. Doublon validate_and_create_reservation (10 args / 11 args)
--    → Drop de l'ancienne signature 10 args
-- 3. 5 réservations legacy (9 mars 2026) avec calcul linéaire au lieu de LOCAGAME
--    → Recalcul serveur-side avec les fonctions correctes
-- ══════════════════════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════
-- STEP 1 : Drop ancien overload validate_and_create_reservation (10 args)
-- L'ancienne signature sans p_delivery_fee n'est plus utilisée.
-- Le frontend (checkout.authenticated.ts) passe toujours p_delivery_fee.
-- ══════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS validate_and_create_reservation(
  JSONB, DATE, DATE, TEXT, UUID, UUID, JSONB, NUMERIC, BOOLEAN, BOOLEAN
);


-- ══════════════════════════════════════════════════════════
-- STEP 2 : Réécriture create_guest_checkout
-- Conserve la logique customer/address (UPSERT guest).
-- Délègue le pricing + réservation à validate_and_create_reservation.
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.create_guest_checkout(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id    UUID;
  v_address_id     UUID;
  v_zone_id        UUID;
  v_order_number   TEXT;
  v_rpc_items      JSONB;
  v_rpc_metadata   JSONB;
  v_rpc_result     JSONB;
  v_reservation_id UUID;
  v_total          NUMERIC;
  v_deposit        NUMERIC;
BEGIN
  -- ────────────────────────────────────────────────────
  -- 0. VALIDATION DES CHAMPS OBLIGATOIRES
  -- ────────────────────────────────────────────────────
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

  -- ────────────────────────────────────────────────────
  -- 1. CRÉER LE CUSTOMER GUEST
  -- ────────────────────────────────────────────────────
  INSERT INTO customers (
    id, email, first_name, last_name, phone,
    customer_type, company_name, siret, is_guest
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

  -- ────────────────────────────────────────────────────
  -- 2. CRÉER L'ADRESSE SI LIVRAISON
  -- ────────────────────────────────────────────────────
  IF (payload->>'delivery_type') = 'delivery' AND payload->'address' IS NOT NULL THEN
    -- Trouver la zone de livraison
    SELECT dz.id INTO v_zone_id
    FROM delivery_zones dz
    WHERE dz.is_active = true
      AND (payload->'address'->>'postal_code') = ANY(dz.postal_codes)
    LIMIT 1;

    INSERT INTO addresses (
      id, customer_id,
      address_line1, address_line2, city, postal_code,
      zone_id, is_default
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

  -- ────────────────────────────────────────────────────
  -- 3. PRÉPARER LES ITEMS POUR validate_and_create_reservation
  --    Seuls product_id et quantity sont nécessaires.
  --    Le serveur recalcule tout le reste.
  -- ────────────────────────────────────────────────────
  SELECT jsonb_agg(
    jsonb_build_object(
      'product_id', item->>'product_id',
      'quantity',   COALESCE((item->>'quantity')::INT, 1)
    )
  )
  INTO v_rpc_items
  FROM jsonb_array_elements(payload->'items') AS item;

  -- ────────────────────────────────────────────────────
  -- 4. PRÉPARER LE METADATA
  --    Regroupe tous les champs annexes (delivery, billing, etc.)
  -- ────────────────────────────────────────────────────
  v_rpc_metadata := jsonb_build_object(
    'delivery_address_id',   v_address_id,
    'delivery_time',         payload->>'delivery_time',
    'pickup_time',           payload->>'pickup_time',
    'return_time',           payload->>'return_time',
    'start_slot',            COALESCE(payload->>'start_slot', 'AM'),
    'end_slot',              COALESCE(payload->>'end_slot', 'AM'),
    'event_type',            payload->>'event_type',
    'notes',                 payload->>'notes',
    'recipient_data',        payload->'recipient_data',
    'event_details',         payload->'event_details',
    'cgv_accepted',          COALESCE((payload->>'cgv_accepted')::BOOLEAN, false),
    'newsletter_accepted',   COALESCE((payload->>'newsletter_accepted')::BOOLEAN, false),
    'is_business',           COALESCE((payload->>'is_business')::BOOLEAN, false),
    'billing_company_name',  payload->>'billing_company_name',
    'billing_vat_number',    payload->>'billing_vat_number',
    'billing_address_line1', payload->>'billing_address_line1',
    'billing_address_line2', payload->>'billing_address_line2',
    'billing_postal_code',   payload->>'billing_postal_code',
    'billing_city',          payload->>'billing_city',
    'billing_country',       COALESCE(payload->>'billing_country', 'FR')
  );

  -- ────────────────────────────────────────────────────
  -- 5. APPELER validate_and_create_reservation
  --    Le pricing est 100% serveur-side.
  --    p_client_total sert de contrôle anti-manipulation (produits + surcharges, SANS livraison).
  --    p_delivery_fee = frais de livraison calculés par le frontend (distance × 0.80€/km).
  -- ────────────────────────────────────────────────────
  v_rpc_result := validate_and_create_reservation(
    p_items              := v_rpc_items,
    p_start_date         := (payload->>'start_date')::DATE,
    p_end_date           := (payload->>'end_date')::DATE,
    p_delivery_type      := payload->>'delivery_type',
    p_customer_id        := v_customer_id,
    p_zone_id            := v_zone_id,
    p_metadata           := v_rpc_metadata,
    p_client_total       := COALESCE((payload->>'subtotal')::NUMERIC, 0)
                          + COALESCE((payload->>'surcharges_total')::NUMERIC, 0),
    p_delivery_is_mandatory := COALESCE((payload->>'delivery_is_mandatory')::BOOLEAN, false),
    p_pickup_is_mandatory   := COALESCE((payload->>'pickup_is_mandatory')::BOOLEAN, false),
    p_delivery_fee       := COALESCE((payload->>'delivery_fee')::NUMERIC, 0)
  );

  -- ────────────────────────────────────────────────────
  -- 6. VÉRIFIER LE RÉSULTAT
  -- ────────────────────────────────────────────────────
  IF v_rpc_result->>'error' IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   v_rpc_result->>'error'
    );
  END IF;

  v_reservation_id := (v_rpc_result->>'reservation_id')::UUID;
  v_total          := (v_rpc_result->>'total')::NUMERIC;
  v_deposit        := (v_rpc_result->>'deposit')::NUMERIC;

  -- ────────────────────────────────────────────────────
  -- 7. GÉNÉRER LE NUMÉRO DE COMMANDE
  -- ────────────────────────────────────────────────────
  v_order_number := 'LG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                    UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6));

  -- ────────────────────────────────────────────────────
  -- 8. EMAIL DE CONFIRMATION (outbox)
  -- ────────────────────────────────────────────────────
  INSERT INTO email_outbox (to_email, template, payload)
  VALUES (
    payload->>'email',
    'ORDER_CONFIRMATION',
    jsonb_build_object(
      'reservation_id', v_reservation_id,
      'order_number',   v_order_number,
      'customer_name',  COALESCE(payload->>'first_name', '') || ' ' || COALESCE(payload->>'last_name', ''),
      'email',          payload->>'email',
      'start_date',     payload->>'start_date',
      'end_date',       payload->>'end_date',
      'total',          v_total,
      'deposit_amount', v_deposit,
      'items_count',    jsonb_array_length(payload->'items')
    )
  );

  -- ────────────────────────────────────────────────────
  -- 9. RETOUR (même shape que l'ancienne version)
  -- ────────────────────────────────────────────────────
  RETURN jsonb_build_object(
    'success',        true,
    'reservation_id', v_reservation_id,
    'order_number',   v_order_number,
    'customer_id',    v_customer_id,
    'customer_email', payload->>'email',
    'total',          v_total,
    'deposit_amount', v_deposit,
    'status',         'pending_payment'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   SQLERRM
    );
END;
$$;

-- Permissions (anon pour guest, authenticated pour clients connectés)
GRANT EXECUTE ON FUNCTION public.create_guest_checkout(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.create_guest_checkout(JSONB) TO authenticated;


-- ══════════════════════════════════════════════════════════
-- STEP 3 : Corriger les 5 réservations aberrantes du 9 mars 2026
-- Ces réservations utilisaient un calcul linéaire (oneDay × jours × qty)
-- au lieu de la formule LOCAGAME progressive.
--
-- Valeurs vérifiées par calc_product_unit_price() :
--   ebee47f4 (03/09→03/31) : 17 LOCAGAME days, unit=6534, sub=71874, total=71886
--   7fe30bb4 (03/09→03/31) : 17 LOCAGAME days, unit=6534, sub=71874, total=71886
--   c9f957d1 (03/09→03/31) : 17 LOCAGAME days, unit=6534, sub=71874, total=71886
--   99666b6d (03/09→04/16) : 29 LOCAGAME days, unit=10890, sub=119790, total=119802
--   85a641bf (03/15→03/31) : 12 LOCAGAME days, unit=4719, sub=51909, total=51921
-- ══════════════════════════════════════════════════════════

-- 3a. Corriger les reservation_items (unit_price et subtotal)
UPDATE reservation_items ri SET
  unit_price = calc_product_unit_price(p.pricing, r.start_date, r.end_date, p.multi_day_coefficient),
  subtotal   = calc_product_unit_price(p.pricing, r.start_date, r.end_date, p.multi_day_coefficient) * ri.quantity
FROM reservations r, products p
WHERE ri.reservation_id = r.id
  AND ri.product_id = p.id
  AND r.id IN (
    'ebee47f4-9a0d-40a4-a21a-06a505e05452',
    '7fe30bb4-f313-4dc9-bb23-ff99e8fa6082',
    'c9f957d1-b5ee-4c44-b7c9-a09c8c4c354e',
    '99666b6d-aeca-451c-9880-43ff0fe432c2',
    '85a641bf-2ce5-40a4-ab10-7296200c7c15'
  );

-- 3b. Corriger les reservations (subtotal, total, deposit_amount, pricing_breakdown)
UPDATE reservations r SET
  subtotal = items_calc.correct_subtotal,
  total    = items_calc.correct_subtotal + r.delivery_fee,
  deposit_amount = GREATEST(CEIL(items_calc.correct_subtotal * 0.20), 50),
  pricing_breakdown = jsonb_build_object(
    'source',          'migration_correction',
    'version',         '3.1',
    'corrected_at',    NOW()::TEXT,
    'original_total',  r.total,
    'original_subtotal', r.subtotal,
    'locagame_days',   count_locagame_days(r.start_date, r.end_date),
    'correction_reason', 'Legacy reservation created before LOCAGAME pricing RPC (linear calc instead of progressive formula)'
  )
FROM (
  SELECT
    ri.reservation_id,
    SUM(calc_product_unit_price(p.pricing, res.start_date, res.end_date, p.multi_day_coefficient) * ri.quantity) AS correct_subtotal
  FROM reservation_items ri
  JOIN reservations res ON res.id = ri.reservation_id
  JOIN products p ON p.id = ri.product_id
  WHERE ri.reservation_id IN (
    'ebee47f4-9a0d-40a4-a21a-06a505e05452',
    '7fe30bb4-f313-4dc9-bb23-ff99e8fa6082',
    'c9f957d1-b5ee-4c44-b7c9-a09c8c4c354e',
    '99666b6d-aeca-451c-9880-43ff0fe432c2',
    '85a641bf-2ce5-40a4-ab10-7296200c7c15'
  )
  GROUP BY ri.reservation_id
) AS items_calc
WHERE r.id = items_calc.reservation_id;
