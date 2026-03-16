-- ══════════════════════════════════════════════════════════════════════════════
-- Fix: Exclure les frais de livraison de la validation anti-manipulation
--
-- Problème: Le frontend calcule les frais de livraison par distance (Haversine)
--           tandis que le serveur les calcule par zone (delivery_zones table).
--           Ces montants diffèrent → faux positif "Incohérence de prix".
--
-- Solution: p_client_total ne contient que (sous-total produits + majorations).
--           La comparaison se fait contre (v_items_subtotal + v_total_surcharges).
--           Les frais de livraison sont 100% serveur-authoritative.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION validate_and_create_reservation(
  p_items JSONB,
  p_start_date DATE,
  p_end_date DATE,
  p_delivery_type TEXT,
  p_customer_id UUID,
  p_zone_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB,
  p_client_total NUMERIC DEFAULT NULL,
  p_delivery_is_mandatory BOOLEAN DEFAULT FALSE,
  p_pickup_is_mandatory BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- ── Constantes ──
  C_WEEKEND_SURCHARGE  CONSTANT NUMERIC := 47;
  C_DEPOSIT_RATE       CONSTANT NUMERIC := 0.20;
  C_DEPOSIT_MIN        CONSTANT NUMERIC := 50;

  -- ── Calculs globaux ──
  v_duration           INT;
  v_has_weekend        BOOLEAN;
  v_start_is_offday    BOOLEAN;
  v_end_is_offday      BOOLEAN;

  -- ── Accumulateurs ──
  v_items_subtotal     NUMERIC := 0;
  v_total_surcharges   NUMERIC := 0;
  v_delivery_fee       NUMERIC := 0;
  v_subtotal           NUMERIC;
  v_total              NUMERIC;
  v_deposit            NUMERIC;

  -- ── Itération items ──
  v_i                  INT;
  v_item               JSONB;
  v_product            RECORD;
  v_unit_price         NUMERIC;
  v_item_subtotal      NUMERIC;
  v_item_qty           INT;
  v_apply_coeff        BOOLEAN;
  v_item_del_surcharge NUMERIC;
  v_item_pck_surcharge NUMERIC;

  -- ── Résultat ──
  v_reservation_id     UUID;
  v_items_result       JSONB := '[]'::JSONB;
  v_pricing_breakdown  JSONB;

  -- ── Zone / adresse ──
  v_zone               RECORD;
  v_delivery_addr_id   UUID;
  v_postal_code        TEXT;

  -- ── Sécurité ──
  v_server_comparable  NUMERIC;
BEGIN
  -- ────────────────────────────────────────────────────
  -- 0. VALIDATION ENTRÉES
  -- ────────────────────────────────────────────────────
  IF p_items IS NULL OR jsonb_typeof(p_items) != 'array' OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('error', 'Aucun produit dans la réservation');
  END IF;

  IF p_delivery_type NOT IN ('delivery', 'pickup') THEN
    RETURN jsonb_build_object('error', 'Type de livraison invalide');
  END IF;

  -- ────────────────────────────────────────────────────
  -- 1. CALCUL DURÉE (inclusif: du 15 au 17 = 3 jours)
  -- ────────────────────────────────────────────────────
  v_duration := (p_end_date - p_start_date) + 1;
  IF v_duration <= 0 THEN
    RETURN jsonb_build_object('error', 'Dates invalides : la date de fin doit être >= date de début');
  END IF;

  -- ────────────────────────────────────────────────────
  -- 2. DÉTECTION PÉRIODE
  -- ────────────────────────────────────────────────────
  v_has_weekend     := period_contains_weekend(p_start_date, p_end_date);
  v_start_is_offday := (EXTRACT(DOW FROM p_start_date) IN (0, 6) OR is_french_holiday(p_start_date));
  v_end_is_offday   := (EXTRACT(DOW FROM p_end_date)   IN (0, 6) OR is_french_holiday(p_end_date));

  -- ────────────────────────────────────────────────────
  -- 3. BOUCLE SUR CHAQUE ITEM
  -- ────────────────────────────────────────────────────
  FOR v_i IN 0..jsonb_array_length(p_items) - 1 LOOP
    v_item := p_items->v_i;

    IF v_item->>'product_id' IS NULL THEN
      RETURN jsonb_build_object('error', format('product_id manquant dans l''item %s', v_i));
    END IF;

    v_item_qty := GREATEST(COALESCE((v_item->>'quantity')::INT, 1), 1);

    -- 3a. Fetch produit depuis la DB
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

    -- 3b. Calcul unit_price
    IF v_product.weekend_flat_price IS NOT NULL AND v_has_weekend THEN
      v_unit_price := v_product.weekend_flat_price;
      v_apply_coeff := FALSE;
    ELSE
      v_apply_coeff := NOT v_has_weekend;
      v_unit_price := calc_product_unit_price(
        v_product.pricing,
        v_duration,
        v_product.multi_day_coefficient,
        v_apply_coeff
      );
    END IF;

    -- 3c. Item subtotal
    v_item_subtotal := ROUND(v_unit_price * v_item_qty, 2);

    -- 3d. Surcharges weekend/férié
    v_item_del_surcharge := 0;
    v_item_pck_surcharge := 0;

    IF p_delivery_is_mandatory AND v_start_is_offday THEN
      v_item_del_surcharge := C_WEEKEND_SURCHARGE * GREATEST(v_product.delivery_people_count, 1);
    END IF;

    IF p_pickup_is_mandatory AND v_end_is_offday THEN
      v_item_pck_surcharge := C_WEEKEND_SURCHARGE * GREATEST(v_product.pickup_people_count, 1);
    END IF;

    -- 3e. Accumuler
    v_items_subtotal   := v_items_subtotal + v_item_subtotal;
    v_total_surcharges := v_total_surcharges + v_item_del_surcharge + v_item_pck_surcharge;

    -- 3f. Stocker le détail
    v_items_result := v_items_result || jsonb_build_object(
      'product_id',                v_product.id,
      'product_name',              v_product.name,
      'quantity',                   v_item_qty,
      'duration_days',             v_duration,
      'unit_price',                v_unit_price,
      'subtotal',                  v_item_subtotal,
      'delivery_people_count',     v_product.delivery_people_count,
      'pickup_people_count',       v_product.pickup_people_count,
      'delivery_surcharge',        v_item_del_surcharge,
      'pickup_surcharge',          v_item_pck_surcharge,
      'weekend_flat_rate_applied', (v_product.weekend_flat_price IS NOT NULL AND v_has_weekend),
      'coefficient_applied',       v_apply_coeff
    );
  END LOOP;

  -- ────────────────────────────────────────────────────
  -- 4. FRAIS DE LIVRAISON (serveur-authoritative)
  -- ────────────────────────────────────────────────────
  IF p_delivery_type = 'pickup' THEN
    v_delivery_fee := 0;
  ELSE
    v_delivery_addr_id := (p_metadata->>'delivery_address_id')::UUID;

    IF v_delivery_addr_id IS NOT NULL THEN
      SELECT a.postal_code INTO v_postal_code
      FROM addresses a WHERE a.id = v_delivery_addr_id;

      IF v_postal_code IS NOT NULL THEN
        SELECT dz.id, dz.delivery_fee, dz.free_delivery_threshold
        INTO v_zone
        FROM delivery_zones dz
        WHERE v_postal_code = ANY(dz.postal_codes) AND dz.is_active = true
        ORDER BY dz.display_order
        LIMIT 1;
      END IF;
    END IF;

    IF v_zone.id IS NULL AND p_zone_id IS NOT NULL THEN
      SELECT dz.id, dz.delivery_fee, dz.free_delivery_threshold
      INTO v_zone
      FROM delivery_zones dz
      WHERE dz.id = p_zone_id AND dz.is_active = true;
    END IF;

    IF v_zone.id IS NOT NULL THEN
      IF v_zone.free_delivery_threshold IS NOT NULL
         AND v_items_subtotal >= v_zone.free_delivery_threshold THEN
        v_delivery_fee := 0;
      ELSE
        v_delivery_fee := v_zone.delivery_fee;
      END IF;
    ELSE
      v_delivery_fee := 0;
    END IF;
  END IF;

  -- ────────────────────────────────────────────────────
  -- 5. TOTAUX SERVEUR
  -- ────────────────────────────────────────────────────
  v_subtotal := v_items_subtotal + v_total_surcharges;
  v_total    := v_subtotal + v_delivery_fee;
  v_deposit  := GREATEST(CEIL(v_subtotal * C_DEPOSIT_RATE), C_DEPOSIT_MIN);

  -- ────────────────────────────────────────────────────
  -- 6. DÉTECTION DE MANIPULATION
  -- Compare p_client_total (sous-total produits + majorations, SANS frais de livraison)
  -- car le frontend calcule les frais par distance (Haversine)
  -- et le serveur par zone (delivery_zones). Comparer les deux causerait des faux positifs.
  -- ────────────────────────────────────────────────────
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

  -- ────────────────────────────────────────────────────
  -- 7. VÉRIFICATION DISPONIBILITÉ
  -- ────────────────────────────────────────────────────
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

  -- ────────────────────────────────────────────────────
  -- 8. PRICING BREAKDOWN
  -- ────────────────────────────────────────────────────
  v_pricing_breakdown := jsonb_build_object(
    'source',           'server_rpc',
    'version',          '1.1',
    'calculated_at',    NOW(),
    'duration_days',    v_duration,
    'has_weekend',      v_has_weekend,
    'items',            v_items_result,
    'items_subtotal',   v_items_subtotal,
    'surcharges_total', v_total_surcharges,
    'delivery_fee',     v_delivery_fee,
    'deposit',          v_deposit,
    'total',            v_total
  );

  -- ────────────────────────────────────────────────────
  -- 9. CRÉATION RÉSERVATION
  -- ────────────────────────────────────────────────────
  INSERT INTO reservations (
    customer_id, start_date, end_date,
    delivery_type, delivery_address_id, zone_id,
    delivery_time, pickup_time, return_time, pickup_slot,
    start_slot, end_slot,
    event_type, notes,
    subtotal, delivery_fee, discount, deposit_amount, total,
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
    COALESCE(v_zone.id, p_zone_id),
    p_metadata->>'delivery_time',
    p_metadata->>'pickup_time',
    p_metadata->>'return_time',
    p_metadata->>'pickup_slot',
    COALESCE(p_metadata->>'start_slot', 'AM'),
    COALESCE(p_metadata->>'end_slot', 'AM'),
    p_metadata->>'event_type',
    p_metadata->>'notes',
    v_subtotal, v_delivery_fee, 0, v_deposit, v_total,
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

  -- ────────────────────────────────────────────────────
  -- 10. INSERT reservation_items + blocage stock
  -- ────────────────────────────────────────────────────
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

  -- ────────────────────────────────────────────────────
  -- 11. RETOUR
  -- ────────────────────────────────────────────────────
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
