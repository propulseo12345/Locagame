/*
  # Ajout de la table des favoris et données initiales

  ## Tables créées

  ### customer_favorites
  - Table pour stocker les produits favoris des clients
  - Permet de synchroniser les favoris entre appareils
  - Contrainte unique pour éviter les doublons

  ## Données initiales (seed)
  - Catégories (8 catégories principales)
  - Produits de démonstration
  - Zones de livraison PACA
*/

-- Table des favoris clients
CREATE TABLE IF NOT EXISTS customer_favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  -- Contrainte unique pour éviter les doublons
  UNIQUE(customer_id, product_id)
);

ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own favorites"
  ON customer_favorites FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can manage own favorites"
  ON customer_favorites FOR ALL
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_favorites_customer ON customer_favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON customer_favorites(product_id);

-- ============================================================================
-- SEED DATA - Catégories
-- ============================================================================

INSERT INTO categories (name, slug, description, display_order, icon) VALUES
  ('Casino', 'casino', 'Tables de jeu professionnelles pour une soirée casino réussie', 1, '🎰'),
  ('Jeux de Bar', 'jeux-de-bar', 'Baby-foot, billard, fléchettes et autres jeux conviviaux', 2, '🎯'),
  ('Jeux Vidéo', 'jeux-video', 'Consoles, bornes d''arcade et jeux vidéo rétro', 3, '🎮'),
  ('Animations', 'animations', 'Structures gonflables et animations pour événements', 4, '🎪'),
  ('Événements', 'evenements', 'Équipements pour vos événements professionnels', 5, '🎉'),
  ('Extérieur', 'exterieur', 'Jeux géants et activités outdoor', 6, '🌳'),
  ('Réalité Virtuelle', 'realite-virtuelle', 'Casques VR et expériences immersives', 7, '🥽'),
  ('Décoration', 'decoration', 'Éléments de décoration thématiques', 8, '✨')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - Zones de livraison PACA
-- ============================================================================

INSERT INTO delivery_zones (name, postal_codes, cities, delivery_fee, free_delivery_threshold, estimated_delivery_time, is_active) VALUES
  (
    'Marseille et périphérie',
    ARRAY['13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008', '13009', '13010', '13011', '13012', '13013', '13014', '13015', '13016'],
    ARRAY['Marseille'],
    0,
    0,
    '2-4 heures',
    true
  ),
  (
    'Bouches-du-Rhône Ouest',
    ARRAY['13220', '13127', '13320', '13500', '13800', '13170', '13140'],
    ARRAY['Châteauneuf-les-Martigues', 'Vitrolles', 'Bouc-Bel-Air', 'Martigues', 'Istres', 'Les Pennes-Mirabeau', 'Miramas'],
    45,
    300,
    '4-6 heures',
    true
  ),
  (
    'Bouches-du-Rhône Est',
    ARRAY['13400', '13600', '13390', '13120', '13011', '13009'],
    ARRAY['Aubagne', 'La Ciotat', 'Auriol', 'Gardanne', 'Plan-de-Cuques', 'Allauch'],
    45,
    300,
    '4-6 heures',
    true
  ),
  (
    'Aix-en-Provence et environs',
    ARRAY['13080', '13090', '13100', '13290', '13540'],
    ARRAY['Aix-en-Provence', 'Aix-en-Provence', 'Aix-en-Provence', 'Aix-en-Provence', 'Puyricard'],
    55,
    350,
    '6-8 heures',
    true
  ),
  (
    'Var',
    ARRAY['83000', '83100', '83200', '83300', '83400', '83500', '83600'],
    ARRAY['Toulon', 'Toulon', 'Toulon', 'Draguignan', 'Hyères', 'La Seyne-sur-Mer', 'Fréjus'],
    85,
    500,
    'Jour suivant',
    true
  ),
  (
    'Alpes-Maritimes',
    ARRAY['06000', '06100', '06200', '06300', '06400', '06500'],
    ARRAY['Nice', 'Nice', 'Nice', 'Nice', 'Cannes', 'Menton'],
    120,
    600,
    'Jour suivant',
    true
  ),
  (
    'Vaucluse',
    ARRAY['84000', '84100', '84200', '84300', '84400'],
    ARRAY['Avignon', 'Orange', 'Carpentras', 'Cavaillon', 'Apt'],
    95,
    500,
    'Jour suivant',
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DATA - Produits de démonstration
-- ============================================================================

-- Obtenir l'ID de la catégorie Casino
DO $$
DECLARE
  casino_id uuid;
  bar_games_id uuid;
  video_games_id uuid;
  outdoor_id uuid;
BEGIN
  -- Récupérer les IDs des catégories
  SELECT id INTO casino_id FROM categories WHERE slug = 'casino' LIMIT 1;
  SELECT id INTO bar_games_id FROM categories WHERE slug = 'jeux-de-bar' LIMIT 1;
  SELECT id INTO video_games_id FROM categories WHERE slug = 'jeux-video' LIMIT 1;
  SELECT id INTO outdoor_id FROM categories WHERE slug = 'exterieur' LIMIT 1;

  -- Insérer les produits uniquement si les catégories existent
  IF casino_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, slug, description, specifications, pricing, total_stock, images, is_active, featured) VALUES
      (
        casino_id,
        'Table de Roulette Professionnelle',
        'table-roulette-pro',
        'Table de roulette professionnelle avec roue en bois massif et tapis de jeu en feutrine verte. Installation et explication des règles incluses.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('length', 200, 'width', 120, 'height', 90),
          'weight', 85,
          'players', jsonb_build_object('min', 1, 'max', 8),
          'power_requirements', 'Aucune',
          'setup_time', 30
        ),
        jsonb_build_object(
          'oneDay', 180,
          'weekend', 320,
          'week', 550,
          'customDurations', jsonb_build_array()
        ),
        3,
        ARRAY['https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800'],
        true,
        true
      ),
      (
        casino_id,
        'Table de Blackjack Premium',
        'table-blackjack-premium',
        'Table de blackjack semi-circulaire pour 7 joueurs avec sabot professionnel et jetons inclus.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('length', 210, 'width', 130, 'height', 90),
          'weight', 75,
          'players', jsonb_build_object('min', 1, 'max', 7),
          'power_requirements', 'Aucune',
          'setup_time', 25
        ),
        jsonb_build_object(
          'oneDay', 150,
          'weekend', 270,
          'week', 480,
          'customDurations', jsonb_build_array()
        ),
        5,
        ARRAY['https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800'],
        true,
        true
      );
  END IF;

  IF bar_games_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, slug, description, specifications, pricing, total_stock, images, is_active, featured) VALUES
      (
        bar_games_id,
        'Baby-foot Professionnel Bonzini',
        'babyfoot-bonzini',
        'Baby-foot professionnel de compétition Bonzini B90 avec barres télescopiques et balles officielles.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('length', 150, 'width', 75, 'height', 90),
          'weight', 90,
          'players', jsonb_build_object('min', 2, 'max', 4),
          'power_requirements', 'Aucune',
          'setup_time', 15
        ),
        jsonb_build_object(
          'oneDay', 80,
          'weekend', 140,
          'week', 250,
          'customDurations', jsonb_build_array()
        ),
        8,
        ARRAY['https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800'],
        true,
        true
      );
  END IF;

  IF video_games_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, slug, description, specifications, pricing, total_stock, images, is_active, featured) VALUES
      (
        video_games_id,
        'Borne d''Arcade Rétro Multijeux',
        'borne-arcade-retro',
        'Borne d''arcade avec plus de 3000 jeux rétro (Pac-Man, Street Fighter, etc.) et design vintage authentique.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('length', 70, 'width', 80, 'height', 180),
          'weight', 120,
          'players', jsonb_build_object('min', 1, 'max', 2),
          'power_requirements', '220V - 300W',
          'setup_time', 20
        ),
        jsonb_build_object(
          'oneDay', 120,
          'weekend', 210,
          'week', 380,
          'customDurations', jsonb_build_array()
        ),
        6,
        ARRAY['https://images.unsplash.com/photo-1577003833154-a6e6c2a00c4f?w=800'],
        true,
        true
      );
  END IF;

  IF outdoor_id IS NOT NULL THEN
    INSERT INTO products (category_id, name, slug, description, specifications, pricing, total_stock, images, is_active, featured) VALUES
      (
        outdoor_id,
        'Jeu de Pétanque Géant',
        'petanque-geante',
        'Boules de pétanque géantes gonflables pour des parties amusantes en extérieur. Inclut 6 boules et 1 cochonnet.',
        jsonb_build_object(
          'dimensions', jsonb_build_object('diameter', 50),
          'weight', 5,
          'players', jsonb_build_object('min', 2, 'max', 12),
          'power_requirements', 'Aucune',
          'setup_time', 10
        ),
        jsonb_build_object(
          'oneDay', 45,
          'weekend', 75,
          'week', 130,
          'customDurations', jsonb_build_array()
        ),
        10,
        ARRAY['https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800'],
        true,
        false
      );
  END IF;
END $$;
