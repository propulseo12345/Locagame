# 🚀 Création rapide des utilisateurs de démonstration

## Méthode rapide (2 minutes)

### Étape 1 : Créer les utilisateurs dans Supabase Dashboard

1. Allez sur https://supabase.com/dashboard/project/koqdpkkuarbjiimkopei
2. Cliquez sur **Authentication** → **Users** → **Add User**
3. Créez les 3 utilisateurs (cochez "Auto Confirm User" pour chacun) :

| Email | Password | Auto Confirm |
|-------|----------|--------------|
| `admin@locagame.net` | `admin123` | ✅ |
| `client@exemple.fr` | `client123` | ✅ |
| `technicien@locagame.net` | `tech123` | ✅ |

### Étape 2 : Créer les profils (automatique)

Une fois les utilisateurs créés, exécutez ce script SQL dans Supabase SQL Editor :

```sql
-- Créer les profils pour les utilisateurs de démonstration

-- 1. ADMIN
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@locagame.net';
  
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO customers (id, email, first_name, last_name, customer_type, phone)
    VALUES (admin_user_id, 'admin@locagame.net', 'Sophie', 'Martin', 'individual', '+33 6 12 34 56 78')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone;

    INSERT INTO admin_users (user_id, role, is_active)
    SELECT admin_user_id, 'admin', true
    WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = admin_user_id);
    
    RAISE NOTICE '✅ Profil admin créé';
  END IF;
END $$;

-- 2. CLIENT
DO $$
DECLARE
  client_user_id uuid;
BEGIN
  SELECT id INTO client_user_id FROM auth.users WHERE email = 'client@exemple.fr';
  
  IF client_user_id IS NOT NULL THEN
    INSERT INTO customers (id, email, first_name, last_name, customer_type, phone, loyalty_points)
    VALUES (client_user_id, 'client@exemple.fr', 'Marie', 'Lefebvre', 'individual', '+33 6 34 56 78 90', 150)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        loyalty_points = EXCLUDED.loyalty_points;
    
    RAISE NOTICE '✅ Profil client créé';
  END IF;
END $$;

-- 3. TECHNICIEN
DO $$
DECLARE
  tech_user_id uuid;
BEGIN
  SELECT id INTO tech_user_id FROM auth.users WHERE email = 'technicien@locagame.net';
  
  IF tech_user_id IS NOT NULL THEN
    INSERT INTO technicians (user_id, first_name, last_name, email, phone, is_active)
    VALUES (tech_user_id, 'Lucas', 'Moreau', 'technicien@locagame.net', '+33 6 45 67 89 01', true)
    ON CONFLICT (email) DO UPDATE
    SET first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        is_active = EXCLUDED.is_active;
    
    RAISE NOTICE '✅ Profil technicien créé';
  END IF;
END $$;
```

**C'est tout !** Les utilisateurs sont maintenant prêts à être utilisés.

