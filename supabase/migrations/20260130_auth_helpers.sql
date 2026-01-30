-- ============================================================
-- MIGRATION: Fonction get_current_user_role
-- Date: 2026-01-30
-- Description: RPC pour déterminer le rôle de l'utilisateur connecté
-- Note: Les fonctions is_user_admin, is_user_technician, get_technician_id
--       existent déjà et sont utilisées par les policies RLS
-- ============================================================

-- Supprimer l'ancienne version si elle existe
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Fonction pour obtenir le rôle de l'utilisateur actuel
-- SECURITY INVOKER = utilise les droits de l'appelant (RLS s'applique)
CREATE FUNCTION public.get_current_user_role()
RETURNS TABLE (
  role TEXT,
  profile_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur connecté
  v_user_id := auth.uid();

  -- Si pas connecté, retourner vide
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Vérifier admin en premier (priorité)
  RETURN QUERY
  SELECT
    'admin'::TEXT as role,
    au.id as profile_id,
    au.email,
    au.first_name,
    au.last_name,
    au.phone
  FROM admin_users au
  WHERE au.user_id = v_user_id
    AND au.is_active = true
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- Vérifier technicien
  RETURN QUERY
  SELECT
    'technician'::TEXT as role,
    t.id as profile_id,
    t.email,
    t.first_name,
    t.last_name,
    t.phone
  FROM technicians t
  WHERE t.user_id = v_user_id
    AND t.is_active = true
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- Vérifier client (customers.id = auth.uid pour les clients connectés)
  RETURN QUERY
  SELECT
    'client'::TEXT as role,
    c.id as profile_id,
    c.email,
    c.first_name,
    c.last_name,
    c.phone
  FROM customers c
  WHERE c.id = v_user_id
    AND c.is_guest = false
  LIMIT 1;

  -- Si rien trouvé, ne retourne rien (l'utilisateur devra créer un profil)
END;
$$;

-- Accorder l'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

COMMENT ON FUNCTION public.get_current_user_role() IS 'Retourne le rôle et profil de l''utilisateur connecté. Priorité: admin > technician > client.';
