-- =====================================================
-- Script de création des utilisateurs de démonstration
-- pour tester les 3 interfaces LOCAGAME
-- =====================================================
-- 
-- Ce script crée 3 utilisateurs dans Supabase Auth
-- et leurs profils correspondants dans les tables :
-- - admin_users (pour l'administrateur)
-- - customers (pour le client)
-- - technicians (pour le technicien)
--
-- IMPORTANT : Exécuter ce script dans le SQL Editor de Supabase
-- =====================================================

-- 1. ADMINISTRATEUR
-- Email: admin@locagame.fr
-- Password: admin123
-- =====================================================

-- Créer l'utilisateur dans auth.users
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@locagame.fr';

  -- Si l'utilisateur n'existe pas, le créer
  IF admin_user_id IS NULL THEN
    -- Note: En production, utilisez Supabase Dashboard > Authentication > Users > Add User
    -- ou l'API Supabase pour créer les utilisateurs avec mot de passe hashé
    -- Pour ce script, on suppose que l'utilisateur sera créé via le dashboard
    
    -- Créer le profil customer pour l'admin (optionnel mais recommandé)
    -- admin_user_id sera défini après création via dashboard
    RAISE NOTICE '⚠️  Créer manuellement l''utilisateur admin@locagame.fr via Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '    Email: admin@locagame.fr';
    RAISE NOTICE '    Password: admin123';
  ELSE
    -- Créer le profil customer pour l'admin
    INSERT INTO customers (id, email, first_name, last_name, customer_type, phone)
    VALUES (admin_user_id, 'admin@locagame.fr', 'Sophie', 'Martin', 'individual', '+33 6 12 34 56 78')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone;

    -- Créer le profil admin_user
    INSERT INTO admin_users (user_id, role, is_active)
    VALUES (admin_user_id, 'admin', true)
    ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role,
        is_active = EXCLUDED.is_active;

    RAISE NOTICE '✅ Profil admin créé/mis à jour pour admin@locagame.fr';
  END IF;
END $$;

-- 2. CLIENT
-- Email: client@exemple.fr
-- Password: client123
-- =====================================================

DO $$
DECLARE
  client_user_id uuid;
BEGIN
  SELECT id INTO client_user_id
  FROM auth.users
  WHERE email = 'client@exemple.fr';

  IF client_user_id IS NULL THEN
    RAISE NOTICE '⚠️  Créer manuellement l''utilisateur client@exemple.fr via Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '    Email: client@exemple.fr';
    RAISE NOTICE '    Password: client123';
  ELSE
    -- Créer le profil customer
    INSERT INTO customers (id, email, first_name, last_name, customer_type, phone, loyalty_points)
    VALUES (client_user_id, 'client@exemple.fr', 'Marie', 'Lefebvre', 'individual', '+33 6 34 56 78 90', 150)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        loyalty_points = EXCLUDED.loyalty_points;

    RAISE NOTICE '✅ Profil client créé/mis à jour pour client@exemple.fr';
  END IF;
END $$;

-- 3. TECHNICIEN
-- Email: technicien@locagame.fr
-- Password: tech123
-- =====================================================

DO $$
DECLARE
  tech_user_id uuid;
BEGIN
  SELECT id INTO tech_user_id
  FROM auth.users
  WHERE email = 'technicien@locagame.fr';

  IF tech_user_id IS NULL THEN
    RAISE NOTICE '⚠️  Créer manuellement l''utilisateur technicien@locagame.fr via Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '    Email: technicien@locagame.fr';
    RAISE NOTICE '    Password: tech123';
  ELSE
    -- Créer le profil technician
    INSERT INTO technicians (user_id, first_name, last_name, email, phone, is_active)
    VALUES (tech_user_id, 'Lucas', 'Moreau', 'technicien@locagame.fr', '+33 6 45 67 89 01', true)
    ON CONFLICT (email) DO UPDATE
    SET first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        is_active = EXCLUDED.is_active;

    RAISE NOTICE '✅ Profil technicien créé/mis à jour pour technicien@locagame.fr';
  END IF;
END $$;

-- =====================================================
-- Vérification des profils créés
-- =====================================================

SELECT 
  'Admin' as type,
  au.user_id::text as user_id,
  c.email,
  c.first_name || ' ' || c.last_name as name,
  au.role,
  au.is_active
FROM admin_users au
LEFT JOIN customers c ON c.id = au.user_id
WHERE c.email = 'admin@locagame.fr'

UNION ALL

SELECT 
  'Client' as type,
  c.id::text as user_id,
  c.email,
  c.first_name || ' ' || c.last_name as name,
  'client' as role,
  true as is_active
FROM customers c
WHERE c.email = 'client@exemple.fr'

UNION ALL

SELECT 
  'Technicien' as type,
  t.user_id::text as user_id,
  t.email,
  t.first_name || ' ' || t.last_name as name,
  'technician' as role,
  t.is_active
FROM technicians t
WHERE t.email = 'technicien@locagame.fr';

-- =====================================================
-- Instructions pour créer les utilisateurs dans Supabase Auth
-- =====================================================
--
-- 1. Aller dans Supabase Dashboard > Authentication > Users
-- 2. Cliquer sur "Add User" > "Create new user"
-- 3. Créer les 3 utilisateurs avec ces credentials :
--
--    ADMINISTRATEUR:
--    - Email: admin@locagame.fr
--    - Password: admin123
--    - Auto Confirm User: ✅ (coché)
--
--    CLIENT:
--    - Email: client@exemple.fr
--    - Password: client123
--    - Auto Confirm User: ✅ (coché)
--
--    TECHNICIEN:
--    - Email: technicien@locagame.fr
--    - Password: tech123
--    - Auto Confirm User: ✅ (coché)
--
-- 4. Après avoir créé les utilisateurs, exécuter ce script SQL
--    pour créer les profils dans les tables correspondantes
--
-- =====================================================

