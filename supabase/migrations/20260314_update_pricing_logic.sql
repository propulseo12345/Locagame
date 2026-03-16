-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Nouvelle tarification LOCAGAME
-- Remplace le système de paliers (oneDay/weekend/week) par la formule LOCAGAME :
--   Seuls samedi et dimanche sont offerts (ne comptent pas).
--   Tarif dégressif : P, P+50%, puis remises 10% par jour sup, plafonnées à 40%
--   Au-delà de 5 jours LOCAGAME : semaine + jours sup à tarif_semaine/6
-- ══════════════════════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════
-- BLOC 1 : count_locagame_days(p_start, p_end)
-- Compte les jours LOCAGAME (jours ouvrés lun-ven) entre deux dates.
-- Samedi et dimanche sont offerts. Minimum 1 jour.
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION count_locagame_days(
  p_start DATE,
  p_end   DATE
) RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_current DATE := p_start;
  v_days    INT  := 0;
  v_dow     INT;
BEGIN
  WHILE v_current <= p_end LOOP
    v_dow := EXTRACT(DOW FROM v_current);
    -- 0=dim, 6=sam → offerts
    IF v_dow NOT IN (0, 6) THEN
      v_days := v_days + 1;
    END IF;
    v_current := v_current + INTERVAL '1 day';
  END LOOP;
  RETURN GREATEST(v_days, 1);
END;
$$;


-- ══════════════════════════════════════════════════════════
-- BLOC 2 : calc_locagame_price(p_price_per_day, p_locagame_days)
-- Calcule le prix selon la formule LOCAGAME :
--   1j = P
--   2j = P + P×50%
--   3-5j = P + (P×0.5 × nSup) × (1 − remise)
--          où nSup = n−1, remise = min(nSup×10%, 40%)
--   >5j = semainePrice + extraDays × (semainePrice / 6)
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calc_locagame_price(
  p_price_per_day NUMERIC,
  p_locagame_days INT
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_semaine_price   NUMERIC;
  v_extra_days      INT;
  v_price_extra_day NUMERIC;
  v_n_sup           INT;
  v_remise          NUMERIC;
BEGIN
  IF p_locagame_days <= 0 THEN RETURN 0; END IF;
  IF p_locagame_days = 1 THEN RETURN ROUND(p_price_per_day, 2); END IF;
  IF p_locagame_days = 2 THEN RETURN ROUND(p_price_per_day + p_price_per_day * 0.5, 2); END IF;

  -- Tarif semaine de référence (5 jours)
  v_semaine_price := ROUND(
    p_price_per_day + (p_price_per_day * 0.5 * 4) * (1 - 0.40),
  2);

  -- Au-delà de 5 jours
  IF p_locagame_days > 5 THEN
    v_extra_days      := p_locagame_days - 5;
    v_price_extra_day := ROUND(v_semaine_price / 6, 2);
    RETURN ROUND(v_semaine_price + v_extra_days * v_price_extra_day, 2);
  END IF;

  -- 3 à 5 jours
  v_n_sup  := p_locagame_days - 1;
  v_remise := LEAST(v_n_sup * 0.10, 0.40);
  RETURN ROUND(
    p_price_per_day + (p_price_per_day * 0.5 * v_n_sup) * (1 - v_remise),
  2);
END;
$$;


-- ══════════════════════════════════════════════════════════
-- BLOC 3 : calc_product_unit_price — nouvelle signature
-- Remplace l'ancienne version basée sur les paliers.
-- Utilise maintenant count_locagame_days + calc_locagame_price.
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calc_product_unit_price(
  p_pricing     JSONB,
  p_start       DATE,
  p_end         DATE,
  p_coefficient NUMERIC DEFAULT 1.0
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_price_per_day NUMERIC;
  v_locagame_days INT;
  v_base_price    NUMERIC;
BEGIN
  v_price_per_day := (p_pricing->>'oneDay')::NUMERIC;
  v_locagame_days := count_locagame_days(p_start, p_end);
  v_base_price    := calc_locagame_price(v_price_per_day, v_locagame_days);

  IF p_coefficient IS NOT NULL AND p_coefficient <> 1.0 THEN
    RETURN ROUND(v_base_price * p_coefficient, 2);
  END IF;

  RETURN v_base_price;
END;
$$;

-- Drop l'ancienne signature pour éviter les ambiguïtés
DROP FUNCTION IF EXISTS calc_product_unit_price(JSONB, INT, NUMERIC, BOOLEAN);


-- ══════════════════════════════════════════════════════════
-- BLOC 4 : Mise à jour de validate_and_create_reservation
-- - v_duration reste en jours calendaires (pour dispo + audit)
-- - Ajout v_locagame_days pour le pricing
-- - Appel calc_product_unit_price avec nouvelle signature
-- - Suppression de v_apply_coeff (plus nécessaire)
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION validate_and_create_reservation(
  p_items JSONB,                        -- [{product_id, quantity}]
  p_start_date DATE,
  p_end_date DATE,
  p_delivery_type TEXT,                 -- 'delivery' | 'pickup'
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
  v_locagame_days      INT;
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
  -- 1. CALCUL DURÉE
  -- ────────────────────────────────────────────────────
  v_duration := (p_end_date - p_start_date) + 1;  -- jours calendaires (pour dispo + audit)
  IF v_duration <= 0 THEN
    RETURN jsonb_build_object('error', 'Dates invalides : la date de fin doit être >= date de début');
  END IF;

  v_locagame_days := count_locagame_days(p_start_date, p_end_date);  -- jours LOCAGAME (pour pricing)

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

    -- Validation item
    IF v_item->>'product_id' IS NULL THEN
      RETURN jsonb_build_object('error', format('product_id manquant dans l''item %s', v_i));
    END IF;

    v_item_qty := GREATEST(COALESCE((v_item->>'quantity')::INT, 1), 1);

    -- 3a. Fetch produit depuis la DB (JAMAIS depuis le client)
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

    -- 3b. Calcul unit_price (miroir exact de calculatePricingBreakdown)
    IF v_product.weekend_flat_price IS NOT NULL AND v_has_weekend THEN
      -- Forfait week-end : REMPLACE le calcul standard
      v_unit_price := v_product.weekend_flat_price;
    ELSE
      -- Calcul LOCAGAME avec coefficient
      v_unit_price := calc_product_unit_price(
        v_product.pricing,
        p_start_date,
        p_end_date,
        v_product.multi_day_coefficient
      );
    END IF;

    -- 3c. Item subtotal = unit_price × quantité
    v_item_subtotal := ROUND(v_unit_price * v_item_qty, 2);

    -- 3d. Surcharges weekend/férié (47€/personne, PAS × quantité — miroir frontend)
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

    -- 3f. Stocker le détail pour insert + audit
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

  -- ────────────────────────────────────────────────────
  -- 4. FRAIS DE LIVRAISON (déterminés serveur-side)
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

    -- Fallback : zone explicite
    IF v_zone.id IS NULL AND p_zone_id IS NOT NULL THEN
      SELECT dz.id, dz.delivery_fee, dz.free_delivery_threshold
      INTO v_zone
      FROM delivery_zones dz
      WHERE dz.id = p_zone_id AND dz.is_active = true;
    END IF;

    -- Appliquer les frais
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
  -- 8. PRICING BREAKDOWN (audit trail complet)
  -- ────────────────────────────────────────────────────
  v_pricing_breakdown := jsonb_build_object(
    'source',           'server_rpc',
    'version',          '2.0',
    'calculated_at',    NOW(),
    'duration_days',    v_duration,
    'locagame_days',    v_locagame_days,
    'has_weekend',      v_has_weekend,
    'items',            v_items_result,
    'items_subtotal',   v_items_subtotal,
    'surcharges_total', v_total_surcharges,
    'delivery_fee',     v_delivery_fee,
    'deposit',          v_deposit,
    'total',            v_total
  );

  -- ────────────────────────────────────────────────────
  -- 9. CRÉATION RÉSERVATION (prix SERVEUR uniquement)
  -- ────────────────────────────────────────────────────
  INSERT INTO reservations (
    customer_id, start_date, end_date,
    delivery_type, delivery_address_id, zone_id,
    delivery_time, pickup_time, return_time, pickup_slot,
    start_slot, end_slot,
    event_type, notes,
    -- PRIX SERVEUR — jamais du client
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
    -- VALEURS CALCULÉES SERVEUR
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
  -- 10. INSERT reservation_items + blocage stock (atomique)
  -- ────────────────────────────────────────────────────
  FOR v_i IN 0..jsonb_array_length(v_items_result) - 1 LOOP
    v_item := v_items_result->v_i;

    -- Item de réservation
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

    -- Blocage de stock (product_availability)
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
