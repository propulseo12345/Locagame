-- ============================================================================
-- SEED COMPLET - TOUTES LES FAKE DATA
-- ============================================================================
-- Ce script insère TOUTES les données manquantes :
-- - 12 clients supplémentaires (total 15)
-- - 13 réservations supplémentaires (total 18)
-- - 11 delivery_tasks supplémentaires (total 16)
-- - product_availability (pour toutes les réservations)
-- - customer_favorites (favoris des clients)
-- - admin_users (2 admins)
-- ============================================================================

-- 1. CRÉER LES UTILISATEURS SUPPLÉMENTAIRES (12 clients + 2 admins)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES
  -- Clients supplémentaires (cust_004 à cust_015)
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000000', 'marie.lefebvre@gmail.com', crypt('password123', gen_salt('bf')), now(), '2024-06-20', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Marie", "last_name": "Lefebvre"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000000', 'julie.rousseau@email.com', crypt('password123', gen_salt('bf')), now(), '2023-08-30', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Julie", "last_name": "Rousseau"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0000-000000000000', 'antoine.petit@startup.io', crypt('password123', gen_salt('bf')), now(), '2024-02-14', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Antoine", "last_name": "Petit"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0000-000000000000', 'camille.bernard@email.com', crypt('password123', gen_salt('bf')), now(), '2024-09-10', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Camille", "last_name": "Bernard"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0000-000000000000', 'lucas.garcia@company.com', crypt('password123', gen_salt('bf')), now(), '2020-05-20', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Lucas", "last_name": "Garcia"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0000-000000000000', 'emma.leroy@email.com', crypt('password123', gen_salt('bf')), now(), '2024-10-15', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Emma", "last_name": "Leroy"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0000-000000000000', 'nicolas.simon@startup.fr', crypt('password123', gen_salt('bf')), now(), '2023-12-01', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Nicolas", "last_name": "Simon"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0000-000000000000', 'lea.moreau@email.com', crypt('password123', gen_salt('bf')), now(), '2023-06-15', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Léa", "last_name": "Moreau"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0000-000000000000', 'marc.durand@company.fr', crypt('password123', gen_salt('bf')), now(), '2022-01-10', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Marc", "last_name": "Durand"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0000-000000000000', 'sarah.lopez@email.com', crypt('password123', gen_salt('bf')), now(), '2024-07-05', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Sarah", "last_name": "Lopez"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0000-000000000000', 'david.martinez@startup.com', crypt('password123', gen_salt('bf')), now(), '2023-04-22', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "David", "last_name": "Martinez"}', false, 'authenticated'),
  ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0000-000000000000', 'claire.andre@email.com', crypt('password123', gen_salt('bf')), now(), '2024-03-18', now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Claire", "last_name": "André"}', false, 'authenticated'),
  -- Admins
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@locagame.fr', crypt('admin123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Sophie", "last_name": "Martin"}', false, 'authenticated'),
  ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0000-000000000000', 'manager@locagame.fr', crypt('manager123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Thomas", "last_name": "Dubois"}', false, 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. CRÉER LES IDENTITIES
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT uuid_generate_v4(), id, jsonb_build_object('sub', id::text, 'email', email), 'email', id::text, now(), now(), now()
FROM auth.users
WHERE id IN (
  '00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0003-000000000005',
  '00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0003-000000000007',
  '00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0003-000000000009',
  '00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0003-000000000011',
  '00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0003-000000000013',
  '00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0003-000000000015',
  '00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0007-000000000002'
)
AND NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = auth.users.id)
ON CONFLICT DO NOTHING;

-- 3. CLIENTS SUPPLÉMENTAIRES (12 clients)
INSERT INTO customers (id, email, first_name, last_name, phone, customer_type, company_name, loyalty_points) VALUES
  ('00000000-0000-0000-0003-000000000004', 'marie.lefebvre@gmail.com', 'Marie', 'Lefebvre', '+33 7 45 67 89 01', 'individual', NULL, 62),
  ('00000000-0000-0000-0003-000000000005', 'julie.rousseau@email.com', 'Julie', 'Rousseau', '+33 7 12 34 56 78', 'individual', NULL, 185),
  ('00000000-0000-0000-0003-000000000006', 'antoine.petit@startup.io', 'Antoine', 'Petit', '+33 6 87 65 43 21', 'professional', 'InnovateLab', 210),
  ('00000000-0000-0000-0003-000000000007', 'camille.bernard@email.com', 'Camille', 'Bernard', '+33 7 98 76 54 32', 'individual', NULL, 95),
  ('00000000-0000-0000-0003-000000000008', 'lucas.garcia@company.com', 'Lucas', 'Garcia', '+33 6 45 67 89 01', 'professional', 'Event Solutions', 1250),
  ('00000000-0000-0000-0003-000000000009', 'emma.leroy@email.com', 'Emma', 'Leroy', '+33 7 23 45 67 89', 'individual', NULL, 45),
  ('00000000-0000-0000-0003-000000000010', 'nicolas.simon@startup.fr', 'Nicolas', 'Simon', '+33 6 78 90 12 34', 'professional', 'TechCorp', 420),
  ('00000000-0000-0000-0003-000000000011', 'lea.moreau@email.com', 'Léa', 'Moreau', '+33 7 34 56 78 90', 'individual', NULL, 120),
  ('00000000-0000-0000-0003-000000000012', 'marc.durand@company.fr', 'Marc', 'Durand', '+33 6 56 78 90 12', 'professional', 'Corporate Events', 680),
  ('00000000-0000-0000-0003-000000000013', 'sarah.lopez@email.com', 'Sarah', 'Lopez', '+33 7 67 89 01 23', 'individual', NULL, 68),
  ('00000000-0000-0000-0003-000000000014', 'david.martinez@startup.com', 'David', 'Martinez', '+33 6 89 01 23 45', 'professional', 'Digital Solutions', 320),
  ('00000000-0000-0000-0003-000000000015', 'claire.andre@email.com', 'Claire', 'André', '+33 7 78 90 12 34', 'individual', NULL, 89)
ON CONFLICT (email) DO NOTHING;

-- 4. ADRESSES SUPPLÉMENTAIRES (12 adresses)
INSERT INTO addresses (id, customer_id, address_line1, city, postal_code, is_default) VALUES
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0003-000000000004', '8 Chemin de la Madrague', 'Marseille', '13015', true),
  ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0003-000000000005', '12 Rue de la République', 'Marseille', '13002', true),
  ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0003-000000000006', '88 Avenue de la Plage', 'Marseille', '13008', true),
  ('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0003-000000000007', '5 Impasse des Lilas', 'Marseille', '13012', true),
  ('00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0003-000000000008', '30 Cours Mirabeau', 'Aix-en-Provence', '13100', true),
  ('00000000-0000-0000-0004-000000000009', '00000000-0000-0000-0003-000000000009', '18 Rue de la Paix', 'Marseille', '13003', true),
  ('00000000-0000-0000-0004-000000000010', '00000000-0000-0000-0003-000000000010', '55 Avenue du Général de Gaulle', 'Marseille', '13004', true),
  ('00000000-0000-0000-0004-000000000011', '00000000-0000-0000-0003-000000000011', '7 Rue des Roses', 'Marseille', '13007', true),
  ('00000000-0000-0000-0004-000000000012', '00000000-0000-0000-0003-000000000012', '100 Avenue de la Canebière', 'Marseille', '13001', true),
  ('00000000-0000-0000-0004-000000000013', '00000000-0000-0000-0003-000000000013', '23 Boulevard de la Libération', 'Marseille', '13004', true),
  ('00000000-0000-0000-0004-000000000014', '00000000-0000-0000-0003-000000000014', '15 Place Castellane', 'Marseille', '13006', true),
  ('00000000-0000-0000-0004-000000000015', '00000000-0000-0000-0003-000000000015', '9 Rue de la Paix', 'Marseille', '13005', true)
ON CONFLICT DO NOTHING;

-- 5. ADMIN USERS (2 admins)
INSERT INTO admin_users (user_id, role, is_active) VALUES
  ('00000000-0000-0000-0007-000000000001', 'admin', true),
  ('00000000-0000-0000-0007-000000000002', 'manager', true)
ON CONFLICT DO NOTHING;

-- 6. RÉSERVATIONS SUPPLÉMENTAIRES (13 réservations)
INSERT INTO reservations (id, customer_id, start_date, end_date, delivery_time, delivery_type, delivery_address_id, subtotal, delivery_fee, discount, total, payment_method, payment_status, payment_transaction_id, status, notes) VALUES
  ('00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0003-000000000006', '2024-11-22', '2024-11-22', '13:00', 'delivery', '00000000-0000-0000-0004-000000000006', 290, 0, 29, 261, 'PayPal', 'completed', 'PAYID-DEF456', 'completed', 'Team building startup - 25 personnes'),
  ('00000000-0000-0000-0005-000000000007', '00000000-0000-0000-0003-000000000007', '2024-11-25', '2024-11-27', '10:00', 'delivery', '00000000-0000-0000-0004-000000000007', 330, 15, 0, 345, 'Stripe', 'completed', 'ch_3Ghi789jkl012', 'confirmed', 'Weekend famille - 15 personnes'),
  ('00000000-0000-0000-0005-000000000008', '00000000-0000-0000-0003-000000000008', '2024-11-30', '2024-11-30', '18:30', 'delivery', '00000000-0000-0000-0004-000000000008', 600, 25, 62.5, 562.5, 'Virement', 'completed', 'VIR-2024-002', 'preparing', 'Soirée casino corporate - 150 personnes'),
  ('00000000-0000-0000-0005-000000000009', '00000000-0000-0000-0003-000000000009', '2024-12-01', '2024-12-01', '15:00', 'delivery', '00000000-0000-0000-0004-000000000009', 450, 0, 0, 450, 'Stripe', 'pending', NULL, 'pending', 'Anniversaire mariage - 60 personnes'),
  ('00000000-0000-0000-0005-000000000010', '00000000-0000-0000-0003-000000000010', '2024-12-05', '2024-12-06', '17:00', 'delivery', '00000000-0000-0000-0004-000000000010', 920, 0, 92, 828, 'PayPal', 'completed', 'PAYID-GHI789', 'confirmed', 'Weekend team building - 40 personnes'),
  ('00000000-0000-0000-0005-000000000011', '00000000-0000-0000-0003-000000000011', CURRENT_DATE, CURRENT_DATE, '09:00', 'delivery', '00000000-0000-0000-0004-000000000011', 250, 0, 0, 250, 'Stripe', 'completed', 'ch_3New001', 'confirmed', 'Événement anniversaire'),
  ('00000000-0000-0000-0005-000000000012', '00000000-0000-0000-0003-000000000012', CURRENT_DATE, CURRENT_DATE, '11:30', 'delivery', '00000000-0000-0000-0004-000000000012', 290, 0, 0, 290, 'PayPal', 'completed', 'PAYID-New002', 'confirmed', NULL),
  ('00000000-0000-0000-0005-000000000013', '00000000-0000-0000-0003-000000000013', CURRENT_DATE, CURRENT_DATE, '14:00', 'delivery', '00000000-0000-0000-0004-000000000013', 600, 0, 60, 540, 'Virement', 'completed', 'VIR-2024-003', 'preparing', 'Événement corporate'),
  ('00000000-0000-0000-0005-000000000014', '00000000-0000-0000-0003-000000000014', CURRENT_DATE, CURRENT_DATE, '16:30', 'delivery', '00000000-0000-0000-0004-000000000014', 200, 0, 0, 200, 'Stripe', 'completed', 'ch_3New003', 'confirmed', NULL),
  ('00000000-0000-0000-0005-000000000015', '00000000-0000-0000-0003-000000000015', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', '10:00', 'delivery', '00000000-0000-0000-0004-000000000015', 590, 0, 0, 590, 'Stripe', 'completed', 'ch_3New004', 'confirmed', NULL),
  ('00000000-0000-0000-0005-000000000016', '00000000-0000-0000-0003-000000000012', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', '13:00', 'delivery', '00000000-0000-0000-0004-000000000012', 150, 0, 0, 150, 'PayPal', 'completed', 'PAYID-New005', 'confirmed', NULL),
  ('00000000-0000-0000-0005-000000000017', '00000000-0000-0000-0003-000000000013', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', '15:30', 'delivery', '00000000-0000-0000-0004-000000000013', 500, 0, 50, 450, 'Virement', 'completed', 'VIR-2024-004', 'preparing', 'Événement entreprise'),
  ('00000000-0000-0000-0005-000000000018', '00000000-0000-0000-0003-000000000001', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days', '09:00', 'delivery', '00000000-0000-0000-0004-000000000001', 800, 0, 0, 800, 'Stripe', 'completed', 'ch_3New006', 'confirmed', NULL)
ON CONFLICT DO NOTHING;

-- 7. RESERVATION ITEMS SUPPLÉMENTAIRES
DO $$
DECLARE
  prod_001_id uuid;
  prod_002_id uuid;
  prod_003_id uuid;
  prod_004_id uuid;
  prod_005_id uuid;
  prod_006_id uuid;
  prod_007_id uuid;
  prod_008_id uuid;
  prod_009_id uuid;
  prod_010_id uuid;
  prod_011_id uuid;
  prod_012_id uuid;
  prod_014_id uuid;
  prod_015_id uuid;
BEGIN
  SELECT id INTO prod_001_id FROM products WHERE slug = 'babyfoot-geant-11vs11' OR slug = 'babyfoot-bonzini' LIMIT 1;
  SELECT id INTO prod_002_id FROM products WHERE slug = 'table-roulette-pro' LIMIT 1;
  SELECT id INTO prod_003_id FROM products WHERE slug = 'pack-console-retrogaming' LIMIT 1;
  SELECT id INTO prod_004_id FROM products WHERE slug = 'simulateur-ski-vr' LIMIT 1;
  SELECT id INTO prod_005_id FROM products WHERE slug = 'jenga-xxl-1-5m' LIMIT 1;
  SELECT id INTO prod_006_id FROM products WHERE slug = 'ping-pong-geant' LIMIT 1;
  SELECT id INTO prod_007_id FROM products WHERE slug = 'machine-bulles-geante' LIMIT 1;
  SELECT id INTO prod_008_id FROM products WHERE slug = 'table-blackjack' LIMIT 1;
  SELECT id INTO prod_009_id FROM products WHERE slug = 'karaoke-professionnel' LIMIT 1;
  SELECT id INTO prod_010_id FROM products WHERE slug = 'poker-table-geante' LIMIT 1;
  SELECT id INTO prod_011_id FROM products WHERE slug = 'flechettes-geant' LIMIT 1;
  SELECT id INTO prod_012_id FROM products WHERE slug = 'molkky-geant' LIMIT 1;
  SELECT id INTO prod_014_id FROM products WHERE slug = 'cornhole-geant' LIMIT 1;
  SELECT id INTO prod_015_id FROM products WHERE slug = 'petanque-geante' LIMIT 1;

  -- res_006
  IF prod_011_id IS NOT NULL AND prod_012_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000006', prod_011_id, 2, 1, 100, 200),
      ('00000000-0000-0000-0005-000000000006', prod_012_id, 1, 1, 90, 90)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_007
  IF prod_014_id IS NOT NULL AND prod_015_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000007', prod_014_id, 1, 3, 200, 200),
      ('00000000-0000-0000-0005-000000000007', prod_015_id, 1, 3, 130, 130)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_008
  IF prod_008_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000008', prod_008_id, 3, 1, 200, 600)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_009
  IF prod_001_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000009', prod_001_id, 1, 1, 450, 450)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_010
  IF prod_003_id IS NOT NULL AND prod_009_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000010', prod_003_id, 2, 2, 320, 640),
      ('00000000-0000-0000-0005-000000000010', prod_009_id, 1, 2, 280, 280)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_011
  IF prod_002_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000011', prod_002_id, 1, 1, 250, 250)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_012
  IF prod_011_id IS NOT NULL AND prod_012_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000012', prod_011_id, 2, 1, 100, 200),
      ('00000000-0000-0000-0005-000000000012', prod_012_id, 1, 1, 90, 90)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_013
  IF prod_004_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000013', prod_004_id, 1, 1, 600, 600)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_014
  IF prod_006_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000014', prod_006_id, 1, 1, 200, 200)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_015
  IF prod_001_id IS NOT NULL AND prod_005_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000015', prod_001_id, 1, 1, 450, 450),
      ('00000000-0000-0000-0005-000000000015', prod_005_id, 1, 1, 140, 140)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_016
  IF prod_009_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000016', prod_009_id, 1, 1, 150, 150)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_017
  IF prod_002_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000017', prod_002_id, 2, 1, 250, 500)
    ON CONFLICT DO NOTHING;
  END IF;

  -- res_018
  IF prod_001_id IS NOT NULL THEN
    INSERT INTO reservation_items (reservation_id, product_id, quantity, duration_days, unit_price, subtotal) VALUES
      ('00000000-0000-0000-0005-000000000018', prod_001_id, 1, 3, 800, 800)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 8. DELIVERY TASKS SUPPLÉMENTAIRES (11 tâches)
INSERT INTO delivery_tasks (id, reservation_id, order_number, type, scheduled_date, scheduled_time, vehicle_id, technician_id, status, customer_data, address_data, products_data, access_constraints, notes, started_at, completed_at) VALUES
  (
    '00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0005-000000000007', 'LOC-2024-007', 'delivery', '2024-11-25', '10:00',
    (SELECT id FROM vehicles WHERE license_plate = 'MN-012-OP' LIMIT 1),
    '00000000-0000-0000-0002-000000000004', 'scheduled',
    '{"firstName": "Camille", "lastName": "Bernard", "phone": "+33 7 98 76 54 32", "email": "camille.bernard@email.com"}'::jsonb,
    '{"street": "5 Impasse des Lilas", "city": "Marseille", "postalCode": "13012", "country": "France"}'::jsonb,
    '[{"productId": "prod_014", "productName": "Cornhole Géant", "quantity": 1}, {"productId": "prod_015", "productName": "Pétanque Géante", "quantity": 1}]'::jsonb,
    '{"floor": 0, "hasElevator": false, "parkingInfo": "Parking devant la maison", "specialInstructions": "Livraison dans le jardin"}'::jsonb,
    'Weekend famille - 15 personnes',
    NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000007', '00000000-0000-0000-0005-000000000008', 'LOC-2024-008', 'delivery', '2024-11-30', '18:30',
    (SELECT id FROM vehicles WHERE license_plate = 'AB-123-CD' LIMIT 1),
    '00000000-0000-0000-0002-000000000001', 'scheduled',
    '{"firstName": "Lucas", "lastName": "Garcia", "phone": "+33 6 45 67 89 01", "email": "lucas.garcia@company.com"}'::jsonb,
    '{"street": "30 Cours Mirabeau", "city": "Aix-en-Provence", "postalCode": "13100", "country": "France"}'::jsonb,
    '[{"productId": "prod_008", "productName": "Table de Blackjack", "quantity": 3}]'::jsonb,
    '{"floor": 1, "hasElevator": true, "accessCode": "B5678", "parkingInfo": "Parking public à proximité", "specialInstructions": "Salle de réception au 1er étage"}'::jsonb,
    'Soirée casino corporate - 150 personnes',
    NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000008', '00000000-0000-0000-0005-000000000010', 'LOC-2024-010', 'delivery', '2024-12-05', '17:00',
    (SELECT id FROM vehicles WHERE license_plate = 'EF-456-GH' LIMIT 1),
    '00000000-0000-0000-0002-000000000002', 'scheduled',
    '{"firstName": "Nicolas", "lastName": "Simon", "phone": "+33 6 78 90 12 34", "email": "nicolas.simon@startup.fr"}'::jsonb,
    '{"street": "55 Avenue du Général de Gaulle", "city": "Marseille", "postalCode": "13004", "country": "France"}'::jsonb,
    '[{"productId": "prod_003", "productName": "Pack Console Rétrogaming", "quantity": 2}, {"productId": "prod_009", "productName": "Karaoké Professionnel", "quantity": 1}]'::jsonb,
    '{"floor": 0, "hasElevator": false, "parkingInfo": "Parking privé", "specialInstructions": "Livraison dans la salle de réunion"}'::jsonb,
    'Weekend team building - 40 personnes',
    NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000009', '00000000-0000-0000-0005-000000000011', 'LOC-2024-011', 'delivery', CURRENT_DATE, '09:00',
    (SELECT id FROM vehicles WHERE license_plate = 'AB-123-CD' LIMIT 1),
    '00000000-0000-0000-0002-000000000001', 'scheduled',
    '{"firstName": "Alexandre", "lastName": "Durand", "phone": "+33 6 11 22 33 44", "email": "alexandre.durand@email.com"}'::jsonb,
    '{"street": "78 Rue Paradis", "city": "Marseille", "postalCode": "13006", "country": "France"}'::jsonb,
    '[{"productId": "prod_002", "productName": "Table de Roulette Professionnelle", "quantity": 1}]'::jsonb,
    '{"floor": 1, "hasElevator": true, "parkingInfo": "Parking public"}'::jsonb,
    'Événement anniversaire',
    NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000010', '00000000-0000-0000-0005-000000000012', 'LOC-2024-012', 'delivery', CURRENT_DATE, '11:30',
    (SELECT id FROM vehicles WHERE license_plate = 'EF-456-GH' LIMIT 1),
    '00000000-0000-0000-0002-000000000002', 'scheduled',
    '{"firstName": "Laura", "lastName": "Petit", "phone": "+33 6 22 33 44 55", "email": "laura.petit@email.com"}'::jsonb,
    '{"street": "15 Boulevard de la Plage", "city": "Marseille", "postalCode": "13008", "country": "France"}'::jsonb,
    '[{"productId": "prod_011", "productName": "Jeu de Fléchettes Géant", "quantity": 2}, {"productId": "prod_012", "productName": "Mölkky Géant", "quantity": 1}]'::jsonb,
    '{"floor": 0, "hasElevator": false, "parkingInfo": "Parking privé"}'::jsonb,
    NULL,
    NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000011', '00000000-0000-0000-0005-000000000013', 'LOC-2024-013', 'delivery', CURRENT_DATE, '14:00',
    (SELECT id FROM vehicles WHERE license_plate = 'IJ-789-KL' LIMIT 1),
    '00000000-0000-0000-0002-000000000003', 'scheduled',
    '{"firstName": "Maxime", "lastName": "Roux", "phone": "+33 6 33 44 55 66", "email": "maxime.roux@company.fr"}'::jsonb,
    '{"street": "32 Avenue de la Canebière", "city": "Marseille", "postalCode": "13001", "country": "France"}'::jsonb,
    '[{"productId": "prod_004", "productName": "Simulateur de Ski VR", "quantity": 1}]'::jsonb,
    '{"floor": 2, "hasElevator": true, "accessCode": "C9876", "parkingInfo": "Parking souterrain"}'::jsonb,
    'Événement corporate',
    NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000012', '00000000-0000-0000-0005-000000000014', 'LOC-2024-014', 'delivery', CURRENT_DATE, '16:30',
    (SELECT id FROM vehicles WHERE license_plate = 'MN-012-OP' LIMIT 1),
    '00000000-0000-0000-0002-000000000004', 'scheduled',
    '{"firstName": "Clara", "lastName": "Vincent", "phone": "+33 6 44 55 66 77", "email": "clara.vincent@email.com"}'::jsonb,
    '{"street": "9 Rue de la République", "city": "Marseille", "postalCode": "13002", "country": "France"}'::jsonb,
    '[{"productId": "prod_006", "productName": "Ping Pong Géant", "quantity": 1}]'::jsonb,
    '{"floor": 0, "hasElevator": false}'::jsonb,
    NULL,
    NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000013', '00000000-0000-0000-0005-000000000015', 'LOC-2024-015', 'delivery', CURRENT_DATE + INTERVAL '1 day', '10:00',
    (SELECT id FROM vehicles WHERE license_plate = 'AB-123-CD' LIMIT 1),
    '00000000-0000-0000-0002-000000000001', 'scheduled',
    '{"firstName": "Julien", "lastName": "Lefebvre", "phone": "+33 6 55 66 77 88", "email": "julien.lefebvre@email.com"}'::jsonb,
    '{"street": "45 Rue Saint-Ferréol", "city": "Marseille", "postalCode": "13001", "country": "France"}'::jsonb,
    '[{"productId": "prod_001", "productName": "Baby-foot géant 11vs11", "quantity": 1}, {"productId": "prod_005", "productName": "Jenga XXL 1.5m", "quantity": 1}]'::jsonb,
    '{"floor": 1, "hasElevator": true}'::jsonb,
    NULL,
    NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000014', '00000000-0000-0000-0005-000000000016', 'LOC-2024-016', 'delivery', CURRENT_DATE + INTERVAL '1 day', '13:00',
    (SELECT id FROM vehicles WHERE license_plate = 'EF-456-GH' LIMIT 1),
    '00000000-0000-0000-0002-000000000002', 'scheduled',
    '{"firstName": "Sarah", "lastName": "Girard", "phone": "+33 6 66 77 88 99", "email": "sarah.girard@email.com"}'::jsonb,
    '{"street": "22 Cours Julien", "city": "Marseille", "postalCode": "13006", "country": "France"}'::jsonb,
    '[{"productId": "prod_009", "productName": "Karaoké Professionnel", "quantity": 1}]'::jsonb,
    '{"floor": 0, "hasElevator": false, "parkingInfo": "Parking public"}'::jsonb,
    NULL,
    NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000015', '00000000-0000-0000-0005-000000000017', 'LOC-2024-017', 'delivery', CURRENT_DATE + INTERVAL '1 day', '15:30',
    (SELECT id FROM vehicles WHERE license_plate = 'IJ-789-KL' LIMIT 1),
    '00000000-0000-0000-0002-000000000003', 'scheduled',
    '{"firstName": "Antoine", "lastName": "Moreau", "phone": "+33 6 77 88 99 00", "email": "antoine.moreau@company.com"}'::jsonb,
    '{"street": "67 Rue de Rome", "city": "Marseille", "postalCode": "13006", "country": "France"}'::jsonb,
    '[{"productId": "prod_002", "productName": "Table de Roulette Professionnelle", "quantity": 2}]'::jsonb,
    '{"floor": 0, "hasElevator": false}'::jsonb,
    'Événement entreprise',
    NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000016', '00000000-0000-0000-0005-000000000018', 'LOC-2024-018', 'pickup', CURRENT_DATE + INTERVAL '1 day', '18:00',
    (SELECT id FROM vehicles WHERE license_plate = 'AB-123-CD' LIMIT 1),
    '00000000-0000-0000-0002-000000000001', 'scheduled',
    '{"firstName": "Sophie", "lastName": "Martin", "phone": "+33 6 12 34 56 78", "email": "sophie.martin@email.com"}'::jsonb,
    '{"street": "25 Avenue du Prado", "city": "Marseille", "postalCode": "13006", "country": "France"}'::jsonb,
    '[{"productId": "prod_001", "productName": "Baby-foot géant 11vs11", "quantity": 1}]'::jsonb,
    '{"floor": 2, "hasElevator": true, "accessCode": "A1234"}'::jsonb,
    NULL,
    NULL, NULL
  )
ON CONFLICT DO NOTHING;

-- 9. PRODUCT AVAILABILITY (pour toutes les réservations)
DO $$
DECLARE
  res_record RECORD;
  item_record RECORD;
BEGIN
  FOR res_record IN SELECT id, start_date, end_date FROM reservations LOOP
    FOR item_record IN 
      SELECT product_id, quantity, duration_days 
      FROM reservation_items 
      WHERE reservation_id = res_record.id
    LOOP
      INSERT INTO product_availability (
        product_id,
        reservation_id,
        start_date,
        end_date,
        quantity,
        status
      ) VALUES (
        item_record.product_id,
        res_record.id,
        res_record.start_date,
        res_record.end_date,
        item_record.quantity,
        'reserved'
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 10. CUSTOMER FAVORITES (favoris basés sur les stats des clients)
DO $$
DECLARE
  cust_record RECORD;
  prod_id uuid;
BEGIN
  -- Sophie Martin : Jeux de Bar, Casino
  SELECT id INTO prod_id FROM products WHERE slug LIKE '%babyfoot%' OR slug LIKE '%flechettes%' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    INSERT INTO customer_favorites (customer_id, product_id) VALUES
      ('00000000-0000-0000-0003-000000000001', prod_id)
    ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO prod_id FROM products WHERE slug LIKE '%roulette%' OR slug LIKE '%blackjack%' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    INSERT INTO customer_favorites (customer_id, product_id) VALUES
      ('00000000-0000-0000-0003-000000000001', prod_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Thomas Dubois : Casino, Jeux Vidéo
  SELECT id INTO prod_id FROM products WHERE slug LIKE '%roulette%' OR slug LIKE '%blackjack%' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    INSERT INTO customer_favorites (customer_id, product_id) VALUES
      ('00000000-0000-0000-0003-000000000002', prod_id)
    ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO prod_id FROM products WHERE slug LIKE '%retrogaming%' OR slug LIKE '%console%' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    INSERT INTO customer_favorites (customer_id, product_id) VALUES
      ('00000000-0000-0000-0003-000000000002', prod_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Pierre Moreau : Événementiel, Jeux de Bar
  SELECT id INTO prod_id FROM products WHERE slug LIKE '%karaoke%' OR slug LIKE '%bulles%' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    INSERT INTO customer_favorites (customer_id, product_id) VALUES
      ('00000000-0000-0000-0003-000000000003', prod_id)
    ON CONFLICT DO NOTHING;
  END IF;
  SELECT id INTO prod_id FROM products WHERE slug LIKE '%ping-pong%' OR slug LIKE '%babyfoot%' LIMIT 1;
  IF prod_id IS NOT NULL THEN
    INSERT INTO customer_favorites (customer_id, product_id) VALUES
      ('00000000-0000-0000-0003-000000000003', prod_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Ajouter quelques favoris aléatoires pour les autres clients
  FOR cust_record IN SELECT id FROM customers WHERE id NOT IN ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0003-000000000003') LIMIT 5 LOOP
    SELECT id INTO prod_id FROM products WHERE is_active = true ORDER BY RANDOM() LIMIT 1;
    IF prod_id IS NOT NULL THEN
      INSERT INTO customer_favorites (customer_id, product_id) VALUES
        (cust_record.id, prod_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Résumé final
DO $$
DECLARE
  users_count int;
  customers_count int;
  addresses_count int;
  reservations_count int;
  reservation_items_count int;
  delivery_tasks_count int;
  product_availability_count int;
  customer_favorites_count int;
  admin_users_count int;
BEGIN
  SELECT COUNT(*) INTO users_count FROM auth.users WHERE email LIKE '%@email.com' OR email LIKE '%@startup.com' OR email LIKE '%@company.fr' OR email LIKE '%@locagame.net' OR email LIKE '%@gmail.com';
  SELECT COUNT(*) INTO customers_count FROM customers;
  SELECT COUNT(*) INTO addresses_count FROM addresses;
  SELECT COUNT(*) INTO reservations_count FROM reservations;
  SELECT COUNT(*) INTO reservation_items_count FROM reservation_items;
  SELECT COUNT(*) INTO delivery_tasks_count FROM delivery_tasks;
  SELECT COUNT(*) INTO product_availability_count FROM product_availability;
  SELECT COUNT(*) INTO customer_favorites_count FROM customer_favorites;
  SELECT COUNT(*) INTO admin_users_count FROM admin_users;

  RAISE NOTICE '✅ Seed COMPLET terminé!';
  RAISE NOTICE '👤 Utilisateurs auth: %', users_count;
  RAISE NOTICE '👤 Clients: %', customers_count;
  RAISE NOTICE '📍 Adresses: %', addresses_count;
  RAISE NOTICE '📋 Réservations: %', reservations_count;
  RAISE NOTICE '📦 Items réservations: %', reservation_items_count;
  RAISE NOTICE '🚚 Tâches livraison: %', delivery_tasks_count;
  RAISE NOTICE '📊 Disponibilités produits: %', product_availability_count;
  RAISE NOTICE '❤️  Favoris clients: %', customer_favorites_count;
  RAISE NOTICE '👑 Admins: %', admin_users_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Mots de passe: password123 (clients) / admin123 (admin) / manager123 (manager)';
END $$;
