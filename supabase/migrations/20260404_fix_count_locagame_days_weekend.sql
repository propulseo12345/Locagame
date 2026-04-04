-- Met à jour count_locagame_days pour le bloc week-end :
-- Ven+Sam+Dim+Lun = 1 seul jour LOCAGAME
-- Ven(DOW=5) → +1j, saute au Mar (+4j)
-- Sam(DOW=6) → +1j, saute au Mar (+3j)
-- Dim(DOW=0) → +1j, saute au Mar (+2j)
-- Lun/Mar/Mer/Jeu → +1j, avance de 1

CREATE OR REPLACE FUNCTION count_locagame_days(
  p_start DATE,
  p_end   DATE
) RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
  v_current DATE := p_start;
  v_days    INT  := 0;
  v_dow     INT;
  v_iter    INT  := 0;
BEGIN
  -- Guards
  IF p_end < p_start THEN RETURN 0; END IF;
  IF p_end - p_start > 365 THEN RETURN 260; END IF;

  WHILE v_current <= p_end AND v_iter < 500 LOOP
    v_iter := v_iter + 1;
    v_dow  := EXTRACT(DOW FROM v_current)::INT;

    v_days := v_days + 1; -- toujours compter 1 jour

    IF v_dow = 5 THEN
      -- Vendredi → mardi suivant (+4 jours)
      v_current := v_current + INTERVAL '4 days';

    ELSIF v_dow = 6 THEN
      -- Samedi → mardi suivant (+3 jours)
      v_current := v_current + INTERVAL '3 days';

    ELSIF v_dow = 0 THEN
      -- Dimanche → mardi suivant (+2 jours)
      v_current := v_current + INTERVAL '2 days';

    ELSE
      -- Lundi, Mardi, Mercredi, Jeudi → +1 jour
      v_current := v_current + INTERVAL '1 day';
    END IF;

  END LOOP;

  RETURN v_days;
END;
$$;
