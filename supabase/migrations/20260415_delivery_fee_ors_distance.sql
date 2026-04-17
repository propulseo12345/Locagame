-- Migration: Frais de livraison basés sur la distance routière ORS
--
-- CHANGEMENT: Remplace le calcul par zone (delivery_zones.delivery_fee)
-- par un tarif au km calculé côté frontend via OpenRouteService.
-- Le frontend envoie p_delivery_fee (distance_km × 0.80€/km).
-- Le serveur valide la cohérence (max 200€) et stocke la distance pour audit.
--
-- SÉCURITÉ: Le plafond de 200€ empêche les abus.
-- La validation anti-manipulation sur les produits (p_client_total) reste active.

-- 1. Ajouter la colonne delivery_distance_km à reservations
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS delivery_distance_km NUMERIC;

-- 2. Supprimer l'ancienne surcharge (10 params) puis recréer avec 12 params
DROP FUNCTION IF EXISTS validate_and_create_reservation(
  JSONB, DATE, DATE, TEXT, UUID, UUID, JSONB, NUMERIC, BOOLEAN, BOOLEAN
);
CREATE OR REPLACE FUNCTION validate_and_create_reservation(
  p_items              JSONB,
  p_start_date         DATE,
  p_end_date           DATE,
  p_delivery_type      TEXT,
  p_customer_id        UUID,
  p_zone_id            UUID DEFAULT NULL,
  p_metadata           JSONB DEFAULT '{}'::JSONB,
  p_client_total       NUMERIC DEFAULT NULL,
  p_delivery_is_mandatory BOOLEAN DEFAULT FALSE,
  p_pickup_is_mandatory   BOOLEAN DEFAULT FALSE,
  p_delivery_fee          NUMERIC DEFAULT NULL,
  p_delivery_distance_km  NUMERIC DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  C_WEEKEND_SURCHARGE  CONSTANT NUMERIC := 47;
  C_DEPOSIT_RATE       CONSTANT NUMERIC := 0.20;
  C_DEPOSIT_MIN        CONSTANT NUMERIC := 50;

  v_duration           INT;
  v_locagame_days      INT;
  v_has_weekend        BOOLEAN;
  v_start_is_offday    BOOLEAN;
  v_end_is_offday      BOOLEAN;

  v_items_subtotal     NUMERIC := 0;
  v_total_surcharges   NUMERIC := 0;
  v_delivery_fee       NUMERIC := 0;
  v_subtotal           NUMERIC;
  v_total              NUMERIC;
  v_deposit            NUMERIC;

  v_i                  INT;
  v_item               JSONB;
  v_product            RECORD;
  v_unit_price         NUMERIC;
  v_item_subtotal      NUMERIC;
  v_item_qty           INT;
  v_item_del_surcharge NUMERIC;
  v_item_pck_surcharge NUMERIC;

  v_reservation_id     UUID;
  v_items_result       JSONB := '[]'::JSONB;
  v_pricing_breakdown  JSONB;

  v_server_comparable  NUMERIC;
BEGIN
  -- Validation des entrées
  IF p_items IS NULL OR jsonb_typeof(p_items) != 'array' OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('error', 'Aucun produit dans la réservation');
  END IF;

  IF p_delivery_type NOT IN ('delivery', 'pickup') THEN
    RETURN jsonb_build_object('error', 'Type de livraison invalide');
  END IF;

  v_duration := (p_end_date - p_start_date) + 1;
  IF v_duration <= 0 THEN
    RETURN jsonb_build_object('error', 'Dates invalides : la date de fin doit être >= date de début');
  END IF;

  v_locagame_days := count_locagame_days(p_start_date, p_end_date);

  v_has_weekend     := period_contains_weekend(p_start_date, p_end_date);
  v_start_is_offday := (EXTRACT(DOW FROM p_start_date) IN (0, 6) OR is_french_holiday(p_start_date));
  v_end_is_offday   := (EXTRACT(DOW FROM p_end_date)   IN (0, 6) OR is_french_holiday(p_end_date));

  -- Calcul des prix produits
  FOR v_i IN 0..jsonb_array_length(p_items) - 1 LOOP
    v_item := p_items->v_i;

    IF v_item->>'product_id' IS NULL THEN
      RETURN jsonb_build_object('error', format('product_id manquant dans l''item %s', v_i));
    END IF;

    v_item_qty := GREATEST(COALESCE((v_item->>'quantity')::INT, 1), 1);

    SELECT id, name, pricing, multi_day_coefficient, weekend_flat_price,
           delivery_people_count, pickup_people_count
    INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
      AND is_active = true;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('error',
        format('Produit introuvable ou inactif: %s', v_item->>'product_id'));
    END IF;

    IF v_product.weekend_flat_price IS NOT NULL AND v_has_weekend THEN
      v_unit_price := v_product.weekend_flat_price;
    ELSE
      v_unit_price := calc_product_unit_price(
        v_product.pricing,
        p_start_date,
        p_end_date,
        v_product.multi_day_coefficient
      );
    END IF;

    IF v_unit_price IS NULL OR v_unit_price <= 0 THEN
      RETURN jsonb_build_object('error',
        format('Le produit "%s" n''est pas disponible à la location directe. Veuillez demander un devis.', v_product.name));
    END IF;

    v_item_subtotal := ROUND(v_unit_price * v_item_qty, 2);

    v_item_del_surcharge := 0;
    v_item_pck_surcharge := 0;

    IF p_delivery_is_mandatory AND v_start_is_offday THEN
      v_item_del_surcharge := C_WEEKEND_SURCHARGE * GREATEST(v_product.delivery_people_count, 1);
    END IF;

    IF p_pickup_is_mandatory AND v_end_is_offday THEN
      v_item_pck_surcharge := C_WEEKEND_SURCHARGE * GREATEST(v_product.pickup_people_count, 1);
    END IF;

    v_items_subtotal   := v_items_subtotal + v_item_subtotal;
    v_total_surcharges := v_total_surcharges + v_item_del_surcharge + v_item_pck_surcharge;

    v_items_result := v_items_result || jsonb_build_object(
      'product_id',                v_product.id,
      'product_name',              v_product.name,
      'quantity',                   v_item_qty,
      'duration_days',             v_duration,
      'locagame_days',             v_locagame_days,
      'unit_price',                v_unit_price,
      'subtotal',                  v_item_subtotal,
      'delivery_people_count',     v_product.delivery_people_count,
      'pickup_people_count',       v_product.pickup_people_count,
      'delivery_surcharge',        v_item_del_surcharge,
      'pickup_surcharge',          v_item_pck_surcharge,
      'weekend_flat_rate_applied', (v_product.weekend_flat_price IS NOT NULL AND v_has_weekend)
    );
  END LOOP;

  -- 4. FRAIS DE LIVRAISON — source: ORS distance routière (frontend)
  IF p_delivery_type = 'pickup' THEN
    v_delivery_fee := 0;
  ELSIF p_delivery_fee IS NOT NULL AND p_delivery_fee >= 0 THEN
    -- Validation : plafond de sécurité à 200€
    IF p_delivery_fee > 200 THEN
      INSERT INTO security_logs (user_id, event, details)
      VALUES (p_customer_id, 'delivery_fee_too_high',
        jsonb_build_object(
          'delivery_fee',     p_delivery_fee,
          'distance_km',      p_delivery_distance_km,
          'note',             'Frais de livraison > 200€ — rejeté'
        ));
      RETURN jsonb_build_object('error', 'Frais de livraison anormalement élevés. Veuillez vérifier votre adresse.');
    END IF;
    v_delivery_fee := ROUND(p_delivery_fee, 2);
  ELSE
    -- Fallback si pas de tarif fourni (ORS indisponible)
    v_delivery_fee := 0;
    INSERT INTO security_logs (user_id, event, details)
    VALUES (p_customer_id, 'delivery_without_fee',
      jsonb_build_object(
        'delivery_type',       p_delivery_type,
        'delivery_fee_param',  p_delivery_fee,
        'distance_km',         p_delivery_distance_km,
        'note',                'Livraison sans tarif ORS — frais fixés à 0'
      ));
  END IF;

  v_subtotal := v_items_subtotal + v_total_surcharges;
  v_total    := v_subtotal + v_delivery_fee;
  v_deposit  := GREATEST(CEIL(v_subtotal * C_DEPOSIT_RATE), C_DEPOSIT_MIN);

  -- Validation anti-manipulation (produits + majorations uniquement)
  v_server_comparable := v_items_subtotal + v_total_surcharges;

  IF p_client_total IS NOT NULL AND ABS(p_client_total - v_server_comparable) > 1.00 THEN
    INSERT INTO security_logs (user_id, event, details)
    VALUES (p_customer_id, 'price_manipulation_attempt',
      jsonb_build_object(
        'client_total',          p_client_total,
        'server_comparable',     v_server_comparable,
        'server_items_subtotal', v_items_subtotal,
        'server_surcharges',     v_total_surcharges,
        'server_delivery_fee',   v_delivery_fee,
        'server_full_total',     v_total,
        'diff',                  ABS(p_client_total - v_server_comparable),
        'diff_percent',          ROUND(ABS(p_client_total - v_server_comparable) / NULLIF(v_server_comparable, 0) * 100, 2),
        'items',                 p_items,
        'start_date',            p_start_date,
        'end_date',              p_end_date
      ));

    IF v_server_comparable > 0 AND ABS(p_client_total - v_server_comparable) / v_server_comparable > 0.05 THEN
      RETURN jsonb_build_object(
        'error', 'Incohérence de prix détectée. Veuillez rafraîchir la page et réessayer.',
        'server_total', v_total
      );
    END IF;
  END IF;

  -- Vérification disponibilité
  FOR v_i IN 0..jsonb_array_length(v_items_result) - 1 LOOP
    v_item := v_items_result->v_i;

    IF NOT check_product_availability(
      (v_item->>'product_id')::UUID,
      p_start_date,
      p_end_date,
      COALESCE((v_item->>'quantity')::INT, 1)
    ) THEN
      RETURN jsonb_build_object(
        'error',      format('Produit indisponible pour ces dates: %s', v_item->>'product_name'),
        'product_id', v_item->>'product_id'
      );
    END IF;
  END LOOP;

  -- Pricing breakdown pour audit
  v_pricing_breakdown := jsonb_build_object(
    'source',                'server_rpc',
    'version',               '5.0',
    'calculated_at',         NOW(),
    'duration_days',         v_duration,
    'locagame_days',         v_locagame_days,
    'has_weekend',           v_has_weekend,
    'items',                 v_items_result,
    'items_subtotal',        v_items_subtotal,
    'surcharges_total',      v_total_surcharges,
    'delivery_fee',          v_delivery_fee,
    'delivery_fee_source',   'ors_distance_based',
    'delivery_distance_km',  p_delivery_distance_km,
    'zone_id',               p_zone_id,
    'deposit',               v_deposit,
    'total',                 v_total
  );

  -- INSERT reservation
  INSERT INTO reservations (
    customer_id, start_date, end_date,
    delivery_type, delivery_address_id, zone_id,
    delivery_time, pickup_time, return_time, pickup_slot,
    start_slot, end_slot,
    event_type, notes,
    subtotal, delivery_fee, delivery_distance_km, discount, deposit_amount, total,
    status, payment_status,
    delivery_is_mandatory, pickup_is_mandatory,
    pricing_breakdown,
    recipient_data, event_details,
    cgv_accepted, newsletter_accepted,
    is_business,
    billing_company_name, billing_vat_number,
    billing_address_line1, billing_address_line2,
    billing_postal_code, billing_city, billing_country
  ) VALUES (
    p_customer_id, p_start_date, p_end_date,
    p_delivery_type,
    (p_metadata->>'delivery_address_id')::UUID,
    p_zone_id,
    p_metadata->>'delivery_time',
    p_metadata->>'pickup_time',
    p_metadata->>'return_time',
    p_metadata->>'pickup_slot',
    COALESCE(p_metadata->>'start_slot', 'AM'),
    COALESCE(p_metadata->>'end_slot', 'AM'),
    p_metadata->>'event_type',
    p_metadata->>'notes',
    v_subtotal, v_delivery_fee, p_delivery_distance_km, 0, v_deposit, v_total,
    'pending_payment', 'unpaid',
    p_delivery_is_mandatory, p_pickup_is_mandatory,
    v_pricing_breakdown,
    CASE WHEN p_metadata->'recipient_data' IS NOT NULL
         THEN (p_metadata->'recipient_data')
         ELSE NULL END,
    CASE WHEN p_metadata->'event_details' IS NOT NULL
         THEN (p_metadata->'event_details')
         ELSE NULL END,
    COALESCE((p_metadata->>'cgv_accepted')::BOOLEAN, FALSE),
    COALESCE((p_metadata->>'newsletter_accepted')::BOOLEAN, FALSE),
    COALESCE((p_metadata->>'is_business')::BOOLEAN, FALSE),
    p_metadata->>'billing_company_name',
    p_metadata->>'billing_vat_number',
    p_metadata->>'billing_address_line1',
    p_metadata->>'billing_address_line2',
    p_metadata->>'billing_postal_code',
    p_metadata->>'billing_city',
    COALESCE(p_metadata->>'billing_country', 'FR')
  )
  RETURNING id INTO v_reservation_id;

  -- INSERT reservation_items + product_availability
  FOR v_i IN 0..jsonb_array_length(v_items_result) - 1 LOOP
    v_item := v_items_result->v_i;

    INSERT INTO reservation_items (
      reservation_id, product_id, quantity,
      duration_days, unit_price, subtotal,
      delivery_people_count, pickup_people_count
    ) VALUES (
      v_reservation_id,
      (v_item->>'product_id')::UUID,
      COALESCE((v_item->>'quantity')::INT, 1),
      v_duration,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'subtotal')::NUMERIC,
      COALESCE((v_item->>'delivery_people_count')::INT, 1),
      COALESCE((v_item->>'pickup_people_count')::INT, 1)
    );

    INSERT INTO product_availability (
      product_id, reservation_id, start_date, end_date, quantity, status
    ) VALUES (
      (v_item->>'product_id')::UUID,
      v_reservation_id,
      p_start_date, p_end_date,
      COALESCE((v_item->>'quantity')::INT, 1),
      'reserved'
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success',           TRUE,
    'reservation_id',    v_reservation_id,
    'items',             v_items_result,
    'subtotal',          v_subtotal,
    'delivery_fee',      v_delivery_fee,
    'surcharges',        v_total_surcharges,
    'deposit',           v_deposit,
    'total',             v_total,
    'pricing_breakdown', v_pricing_breakdown
  );
END;
$$;

-- 3. Mettre à jour create_guest_checkout pour passer delivery_fee et distance
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
