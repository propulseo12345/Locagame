-- ============================================================
-- Fix: guest checkout — duplicate email crash
-- Remplace INSERT brut par UPSERT (ON CONFLICT email DO UPDATE)
-- Si l'email existe déjà, on met à jour les infos et on récupère l'ID
-- ============================================================

CREATE OR REPLACE FUNCTION create_guest_checkout(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- UPSERT: créer ou récupérer le customer existant
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
  ON CONFLICT (email) DO UPDATE SET
    first_name    = COALESCE(EXCLUDED.first_name, customers.first_name),
    last_name     = COALESCE(EXCLUDED.last_name, customers.last_name),
    phone         = COALESCE(EXCLUDED.phone, customers.phone),
    customer_type = COALESCE(EXCLUDED.customer_type, customers.customer_type),
    company_name  = EXCLUDED.company_name,
    siret         = EXCLUDED.siret,
    updated_at    = NOW()
  RETURNING id INTO v_customer_id;

  IF (payload->>'delivery_type') = 'delivery' AND payload->'address' IS NOT NULL THEN
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

  SELECT jsonb_agg(
    jsonb_build_object(
      'product_id', item->>'product_id',
      'quantity',   COALESCE((item->>'quantity')::INT, 1)
    )
  )
  INTO v_rpc_items
  FROM jsonb_array_elements(payload->'items') AS item;

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

  -- Appel RPC avec delivery_fee et distance ORS
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
    p_delivery_fee          := COALESCE((payload->>'delivery_fee')::NUMERIC, NULL),
    p_delivery_distance_km  := COALESCE((payload->>'delivery_distance_km')::NUMERIC, NULL)
  );

  IF v_rpc_result->>'error' IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   v_rpc_result->>'error'
    );
  END IF;

  v_reservation_id := (v_rpc_result->>'reservation_id')::UUID;
  v_total          := (v_rpc_result->>'total')::NUMERIC;
  v_deposit        := (v_rpc_result->>'deposit')::NUMERIC;

  v_order_number := 'LG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                    UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6));

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
