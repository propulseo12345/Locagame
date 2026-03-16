-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Proratisation des paliers tarifaires dans calc_product_unit_price
-- Aligne le calcul serveur sur le frontend (pricing.ts).
-- Avant: retournait le prix complet du palier (ex: weekend=18€ pour 2 ou 3 jours)
-- Après: proratise selon le nombre réel de jours (ex: 18€/3*2 = 12€ pour 2 jours)
-- ══════════════════════════════════════════════════════════════════════════════

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
  v_ref_days INT;
BEGIN
  v_one_day := COALESCE((p_pricing->>'oneDay')::NUMERIC, 0);
  v_weekend := COALESCE((p_pricing->>'weekend')::NUMERIC, 0);
  v_week    := COALESCE((p_pricing->>'week')::NUMERIC, 0);
  v_custom_durations := p_pricing->'customDurations';

  -- 1 jour : retour immédiat SANS coefficient (miroir pricing.ts)
  IF p_duration = 1 THEN
    RETURN v_one_day;
  END IF;

  -- 2-3 jours : proratiser sur 3 jours de référence
  IF p_duration >= 2 AND p_duration <= 3 THEN
    v_base := ROUND(v_weekend / 3.0 * p_duration, 2);

  -- 4-7 jours : proratiser sur 7 jours de référence
  ELSIF p_duration >= 4 AND p_duration <= 7 THEN
    v_base := ROUND(v_week / 7.0 * p_duration, 2);

  -- 8+ jours : chercher customDurations[] ou fallback prorata semaine
  ELSIF v_custom_durations IS NOT NULL
    AND jsonb_typeof(v_custom_durations) = 'array'
    AND jsonb_array_length(v_custom_durations) > 0 THEN

    FOR v_i IN 0..jsonb_array_length(v_custom_durations) - 1 LOOP
      v_cd := v_custom_durations->v_i;
      IF p_duration >= COALESCE((v_cd->>'minDays')::INT, 0)
         AND p_duration <= COALESCE((v_cd->>'maxDays')::INT, 0) THEN
        v_ref_days := COALESCE((v_cd->>'maxDays')::INT, p_duration);
        v_base := ROUND((v_cd->>'price')::NUMERIC / v_ref_days * p_duration, 2);
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
