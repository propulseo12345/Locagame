-- ============================================================================
-- LOCAGAME - FONCTIONS DE GESTION AUTOMATIQUE DES STOCKS
-- ============================================================================
-- À exécuter dans: Supabase Dashboard > SQL Editor
-- Ces fonctions permettent la gestion automatique des stocks lors des réservations
-- ============================================================================

-- ============================================================================
-- 1. FONCTION : Réduire le stock lors d'une réservation
-- ============================================================================
-- Cette fonction réduit automatiquement le stock disponible d'un produit
-- Elle vérifie d'abord qu'il y a assez de stock avant de réduire

CREATE OR REPLACE FUNCTION reduce_stock(
  p_product_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock integer;
  v_total_stock integer;
BEGIN
  -- Récupérer le stock total du produit
  SELECT total_stock INTO v_total_stock
  FROM products
  WHERE id = p_product_id;

  -- Vérifier que le produit existe
  IF v_total_stock IS NULL THEN
    RAISE EXCEPTION 'Product with id % does not exist', p_product_id;
  END IF;

  -- Vérifier qu'il y a assez de stock disponible
  -- On calcule le stock disponible en soustrayant les quantités réservées
  SELECT COALESCE(
    v_total_stock - COALESCE(SUM(ri.quantity), 0),
    v_total_stock
  ) INTO v_current_stock
  FROM reservation_items ri
  INNER JOIN reservations r ON r.id = ri.reservation_id
  WHERE ri.product_id = p_product_id
    AND r.status NOT IN ('cancelled', 'completed', 'returned');

  -- Si pas assez de stock, lever une exception
  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %',
      p_product_id, v_current_stock, p_quantity;
  END IF;

  -- Le stock est géré dynamiquement via les reservation_items
  -- Pas besoin de modifier la table products
  -- Cette fonction sert surtout à valider la disponibilité

  -- Log pour debug (optionnel)
  RAISE NOTICE 'Stock reduced for product %: % units (% remaining)',
    p_product_id, p_quantity, v_current_stock - p_quantity;

END;
$$;

-- ============================================================================
-- 2. FONCTION : Restaurer le stock lors d'une annulation
-- ============================================================================
-- Cette fonction est appelée automatiquement quand une réservation est annulée
-- Elle ne fait rien directement car le stock est calculé dynamiquement

CREATE OR REPLACE FUNCTION restore_stock(
  p_reservation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Le stock est calculé dynamiquement en excluant les réservations annulées/complétées
  -- Donc il suffit de s'assurer que le statut est bien mis à jour

  -- Vérifier que la réservation existe et est annulable
  IF NOT EXISTS (
    SELECT 1 FROM reservations
    WHERE id = p_reservation_id
    AND status NOT IN ('cancelled', 'completed', 'returned')
  ) THEN
    RAISE EXCEPTION 'Reservation % cannot be cancelled (already cancelled or completed)',
      p_reservation_id;
  END IF;

  -- Log pour debug
  RAISE NOTICE 'Stock restored for reservation %', p_reservation_id;
END;
$$;

-- ============================================================================
-- 3. FONCTION : Calculer le stock disponible pour un produit
-- ============================================================================
-- Cette fonction calcule en temps réel le stock disponible d'un produit
-- en tenant compte des réservations actives (non annulées/complétées)

CREATE OR REPLACE FUNCTION get_available_stock(
  p_product_id uuid
)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_total_stock integer;
  v_reserved_stock integer;
  v_available_stock integer;
BEGIN
  -- Récupérer le stock total
  SELECT total_stock INTO v_total_stock
  FROM products
  WHERE id = p_product_id;

  -- Si produit n'existe pas
  IF v_total_stock IS NULL THEN
    RETURN 0;
  END IF;

  -- Calculer le stock réservé (réservations actives uniquement)
  SELECT COALESCE(SUM(ri.quantity), 0) INTO v_reserved_stock
  FROM reservation_items ri
  INNER JOIN reservations r ON r.id = ri.reservation_id
  WHERE ri.product_id = p_product_id
    AND r.status NOT IN ('cancelled', 'completed', 'returned');

  -- Calculer le stock disponible
  v_available_stock := v_total_stock - v_reserved_stock;

  -- S'assurer qu'on ne retourne pas un nombre négatif
  IF v_available_stock < 0 THEN
    v_available_stock := 0;
  END IF;

  RETURN v_available_stock;
END;
$$;

-- ============================================================================
-- 4. FONCTION : Vérifier la disponibilité d'un produit pour des dates
-- ============================================================================
-- Cette fonction vérifie si un produit est disponible en quantité suffisante
-- pour une période donnée (utile pour éviter les double-réservations)

CREATE OR REPLACE FUNCTION check_product_availability_for_dates(
  p_product_id uuid,
  p_quantity integer,
  p_start_date date,
  p_end_date date
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_total_stock integer;
  v_reserved_stock integer;
  v_available_stock integer;
BEGIN
  -- Récupérer le stock total
  SELECT total_stock INTO v_total_stock
  FROM products
  WHERE id = p_product_id;

  -- Si produit n'existe pas
  IF v_total_stock IS NULL THEN
    RETURN false;
  END IF;

  -- Calculer le stock réservé pour la période demandée
  -- On cherche les réservations qui se chevauchent avec la période
  SELECT COALESCE(SUM(ri.quantity), 0) INTO v_reserved_stock
  FROM reservation_items ri
  INNER JOIN reservations r ON r.id = ri.reservation_id
  WHERE ri.product_id = p_product_id
    AND r.status NOT IN ('cancelled', 'completed', 'returned')
    AND (
      -- Cas 1: La réservation commence pendant notre période
      (r.start_date >= p_start_date AND r.start_date <= p_end_date)
      OR
      -- Cas 2: La réservation se termine pendant notre période
      (r.end_date >= p_start_date AND r.end_date <= p_end_date)
      OR
      -- Cas 3: La réservation englobe toute notre période
      (r.start_date <= p_start_date AND r.end_date >= p_end_date)
    );

  -- Calculer le stock disponible
  v_available_stock := v_total_stock - v_reserved_stock;

  -- Retourner true si suffisamment de stock
  RETURN v_available_stock >= p_quantity;
END;
$$;

-- ============================================================================
-- 5. TRIGGER : Valider le stock avant de créer une réservation item
-- ============================================================================
-- Ce trigger s'exécute automatiquement avant l'insertion d'un reservation_item
-- Il vérifie qu'il y a assez de stock disponible

CREATE OR REPLACE FUNCTION validate_stock_before_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_reservation_start_date date;
  v_reservation_end_date date;
  v_is_available boolean;
BEGIN
  -- Récupérer les dates de la réservation
  SELECT start_date, end_date INTO v_reservation_start_date, v_reservation_end_date
  FROM reservations
  WHERE id = NEW.reservation_id;

  -- Vérifier la disponibilité
  v_is_available := check_product_availability_for_dates(
    NEW.product_id,
    NEW.quantity,
    v_reservation_start_date,
    v_reservation_end_date
  );

  -- Si pas disponible, empêcher l'insertion
  IF NOT v_is_available THEN
    RAISE EXCEPTION 'Insufficient stock for product % during the requested period', NEW.product_id;
  END IF;

  -- Si disponible, autoriser l'insertion
  RETURN NEW;
END;
$$;

-- Créer le trigger sur la table reservation_items
DROP TRIGGER IF EXISTS trigger_validate_stock ON reservation_items;
CREATE TRIGGER trigger_validate_stock
  BEFORE INSERT ON reservation_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_stock_before_reservation();

-- ============================================================================
-- 6. VUE : Stocks disponibles en temps réel
-- ============================================================================
-- Cette vue permet de voir rapidement le stock disponible de tous les produits

CREATE OR REPLACE VIEW products_with_available_stock AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.category_id,
  p.total_stock,
  p.total_stock - COALESCE(SUM(CASE
    WHEN r.status NOT IN ('cancelled', 'completed', 'returned')
    THEN ri.quantity
    ELSE 0
  END), 0) as available_stock,
  COALESCE(SUM(CASE
    WHEN r.status NOT IN ('cancelled', 'completed', 'returned')
    THEN ri.quantity
    ELSE 0
  END), 0) as reserved_stock,
  p.is_active,
  p.featured,
  p.pricing,
  p.images,
  p.created_at
FROM products p
LEFT JOIN reservation_items ri ON ri.product_id = p.id
LEFT JOIN reservations r ON r.id = ri.reservation_id
GROUP BY p.id, p.name, p.slug, p.category_id, p.total_stock, p.is_active, p.featured, p.pricing, p.images, p.created_at;

-- ============================================================================
-- COMMENTAIRES ET DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION reduce_stock IS 'Valide et enregistre la réduction de stock lors d''une réservation';
COMMENT ON FUNCTION restore_stock IS 'Valide la restauration du stock lors d''une annulation de réservation';
COMMENT ON FUNCTION get_available_stock IS 'Calcule le stock disponible en temps réel pour un produit';
COMMENT ON FUNCTION check_product_availability_for_dates IS 'Vérifie la disponibilité d''un produit pour une période donnée';
COMMENT ON VIEW products_with_available_stock IS 'Vue affichant les stocks disponibles en temps réel pour tous les produits';

-- ============================================================================
-- TESTS RAPIDES (À EXÉCUTER APRÈS AVOIR DES DONNÉES)
-- ============================================================================

/*
-- Test 1: Vérifier le stock disponible d'un produit
SELECT get_available_stock('product-uuid-here');

-- Test 2: Vérifier la disponibilité pour des dates
SELECT check_product_availability_for_dates(
  'product-uuid-here',
  2,  -- quantité
  '2025-12-01',
  '2025-12-03'
);

-- Test 3: Voir tous les stocks disponibles
SELECT * FROM products_with_available_stock ORDER BY name;
*/

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
