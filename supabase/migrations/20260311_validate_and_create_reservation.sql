-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Validation serveur des prix de réservation
-- Corrige la faille critique: les prix client étaient insérés sans revalidation.
-- ══════════════════════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════
-- BLOC 1 : Table security_logs
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent lire (INSERT réservé aux fonctions SECURITY DEFINER)
CREATE POLICY "security_logs_admin_read" ON security_logs
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM get_current_user_role() WHERE role = 'admin'));


-- ══════════════════════════════════════════════════════════
-- BLOC 2 : Helper is_french_holiday(date)
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION is_french_holiday(p_date DATE)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_date = ANY(ARRAY[
    -- 2025: Jour de l'An, Lundi de Pâques, Fête du Travail, Victoire 1945,
    --       Ascension, Lundi de Pentecôte, Fête nationale, Assomption,
    --       Toussaint, Armistice, Noël
    '2025-01-01'::DATE, '2025-04-21'::DATE, '2025-05-01'::DATE, '2025-05-08'::DATE,
    '2025-05-29'::DATE, '2025-06-09'::DATE, '2025-07-14'::DATE, '2025-08-15'::DATE,
    '2025-11-01'::DATE, '2025-11-11'::DATE, '2025-12-25'::DATE,
    -- 2026
    '2026-01-01'::DATE, '2026-04-06'::DATE, '2026-05-01'::DATE, '2026-05-08'::DATE,
    '2026-05-14'::DATE, '2026-05-25'::DATE, '2026-07-14'::DATE, '2026-08-15'::DATE,
    '2026-11-01'::DATE, '2026-11-11'::DATE, '2026-12-25'::DATE,
    -- 2027
    '2027-01-01'::DATE, '2027-03-29'::DATE, '2027-05-01'::DATE, '2027-05-08'::DATE,
    '2027-05-06'::DATE, '2027-05-17'::DATE, '2027-07-14'::DATE, '2027-08-15'::DATE,
    '2027-11-01'::DATE, '2027-11-11'::DATE, '2027-12-25'::DATE
  ]);
$$;


-- ══════════════════════════════════════════════════════════
-- BLOC 3 : Helper period_contains_weekend(start, end)
-- Retourne TRUE si au moins un jour est samedi/dimanche
-- OU jour férié français dans la plage [start, end] inclus.
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION period_contains_weekend(p_start DATE, p_end DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_d DATE;
BEGIN
  v_d := p_start;
  WHILE v_d <= p_end LOOP
    IF EXTRACT(DOW FROM v_d) IN (0, 6) OR is_french_holiday(v_d) THEN
      RETURN TRUE;
    END IF;
    v_d := v_d + 1;
  END LOOP;
  RETURN FALSE;
END;
$$;


-- ══════════════════════════════════════════════════════════
-- BLOC 4 : Helper calc_product_unit_price
-- Miroir EXACT de calculateProductPrice() dans pricing.ts
-- Retourne le prix pour la durée entière (PAS un prix/jour).
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calc_product_unit_price(
  p_pricing JSONB,
  p_duration INT,
  p_coefficient NUMERIC,
  p_apply_coefficient BOOLEAN
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_base NUMERIC;
  v_one_day NUMERIC;
  v_weekend NUMERIC;
  v_week NUMERIC;
  v_custom_durations JSONB;
  v_cd JSONB;
  v_i INT;
  v_found BOOLEAN := FALSE;
BEGIN
  v_one_day := COALESCE((p_pricing->>'oneDay')::NUMERIC, 0);
  v_weekend := COALESCE((p_pricing->>'weekend')::NUMERIC, 0);
  v_week    := COALESCE((p_pricing->>'week')::NUMERIC, 0);
  v_custom_durations := p_pricing->'customDurations';

  -- 1 jour → retour immédiat SANS coefficient (miroir pricing.ts)
  IF p_duration = 1 THEN
    RETURN v_one_day;
  END IF;

  -- 2-3 jours
  IF p_duration >= 2 AND p_duration <= 3 THEN
    v_base := v_weekend;

  -- 4-7 jours
  ELSIF p_duration >= 4 AND p_duration <= 7 THEN
    v_base := v_week;

  -- 8+ jours : chercher customDurations[] ou fallback prorata semaine
  ELSIF v_custom_durations IS NOT NULL
    AND jsonb_typeof(v_custom_durations) = 'array'
    AND jsonb_array_length(v_custom_durations) > 0 THEN

    FOR v_i IN 0..jsonb_array_length(v_custom_durations) - 1 LOOP
      v_cd := v_custom_durations->v_i;
      IF p_duration >= COALESCE((v_cd->>'minDays')::INT, 0)
         AND p_duration <= COALESCE((v_cd->>'maxDays')::INT, 0) THEN
        v_base := (v_cd->>'price')::NUMERIC;
        v_found := TRUE;
        EXIT;
      END IF;
    END LOOP;

    IF NOT v_found THEN
      v_base := CEIL(v_week / 7.0 * p_duration);
    END IF;

  ELSE
    -- Fallback: prorata du tarif semaine
    v_base := CEIL(v_week / 7.0 * p_duration);
  END IF;

  -- Coefficient multi-jours (uniquement si période 100% semaine)
  IF p_apply_coefficient THEN
    RETURN ROUND(v_base * COALESCE(p_coefficient, 1.00), 2);
  END IF;

  RETURN ROUND(v_base, 2);
END;
$$;


-- ══════════════════════════════════════════════════════════
-- BLOC 5 : RPC principale validate_and_create_reservation
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
      v_apply_coeff := FALSE;
    ELSE
      -- Calcul standard — coefficient seulement si 100% semaine
      v_apply_coeff := NOT v_has_weekend;
      v_unit_price := calc_product_unit_price(
        v_product.pricing,
        v_duration,
        v_product.multi_day_coefficient,
        v_apply_coeff
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
  -- 4. FRAIS DE LIVRAISON (déterminés serveur-side)
  -- ────────────────────────────────────────────────────
  IF p_delivery_type = 'pickup' THEN
    v_delivery_fee := 0;
  ELSE
    -- Stratégie : chercher la zone depuis l'adresse de livraison (postal code)
    -- puis fallback sur p_zone_id si fourni
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
  -- Compare p_client_total (sous-total produits + majorations, SANS frais de livraison)
  -- car le frontend calcule les frais de livraison par distance (Haversine)
  -- alors que le serveur les calcule par zone (delivery_zones table).
  -- Les frais de livraison sont 100% serveur-authoritative.
  -- ────────────────────────────────────────────────────
  -- p_client_total = sous-total produits + majorations (SANS frais de livraison)
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

    -- Rejette si écart > 5% du total comparable serveur
    IF v_server_comparable > 0 AND ABS(p_client_total - v_server_comparable) / v_server_comparable > 0.05 THEN
      RETURN jsonb_build_object(
        'error', 'Incohérence de prix détectée. Veuillez rafraîchir la page et réessayer.',
        'server_total', v_total
      );
    END IF;
  END IF;

  -- ────────────────────────────────────────────────────
  -- 7. VÉRIFICATION DISPONIBILITÉ (réutilise la RPC existante)
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
    'version',          '1.0',
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
