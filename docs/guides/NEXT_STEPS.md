# 🚀 Prochaines Étapes - Connexion Supabase

## ✅ Ce qui est fait

- ✅ Fichier `.env` créé avec vos clés Supabase
- ✅ Configuration prête

## 📋 Actions Immédiates

### 1. Exécuter la Migration SQL

**Dans Supabase Dashboard** :
1. Aller sur : https://supabase.com/dashboard/project/koqdpkkuarbjiimkopei/sql/new
2. Ouvrir le fichier : `supabase/migrations/20251009081724_create_initial_schema.sql`
3. Copier tout le contenu
4. Coller dans l'éditeur SQL de Supabase
5. Cliquer sur **Run** (ou `Ctrl+Enter`)

**Vérification** :
- ✅ Pas d'erreurs dans la console
- ✅ Message "Success. No rows returned"

### 2. Générer les Types TypeScript

**Option A - Via Dashboard (Plus Simple)** :
1. Aller sur : https://supabase.com/dashboard/project/koqdpkkuarbjiimkopei/settings/api
2. Scroller jusqu'à **"TypeScript types"**
3. Copier le code généré
4. Coller dans `src/lib/database.types.ts` (remplacer le contenu)

**Option B - Via CLI** :
```bash
# Se connecter à Supabase
npx supabase login

# Générer les types
npx supabase gen types typescript --project-id koqdpkkuarbjiimkopei > src/lib/database.types.ts
```

### 3. Tester la Connexion

Redémarrer le serveur de dev :
```bash
npm run dev
```

Ouvrir la console du navigateur (F12) et tester :
```javascript
import { supabase } from './lib/supabase';

// Test simple
const { data, error } = await supabase
  .from('products')
  .select('*')
  .limit(1);

console.log('Test connexion:', { data, error });
```

## 📊 Vérification des Tables

Après la migration, vérifier dans **Table Editor** que ces tables existent :
- ✅ categories
- ✅ products
- ✅ delivery_zones
- ✅ customers
- ✅ addresses
- ✅ reservations
- ✅ reservation_items
- ✅ product_availability
- ✅ admin_users
- ✅ technicians
- ✅ vehicles
- ✅ delivery_tasks

## 🔐 Créer les Premiers Utilisateurs

### Via Dashboard (Recommandé pour tests)

1. Aller dans **Authentication** → **Users**
2. Cliquer sur **Add user** → **Create new user**
3. Créer :
   - Email : `admin@locagame.test`
   - Password : `admin123`
   - ✅ Auto Confirm User

### Créer le Profil Admin

Dans **SQL Editor**, exécuter :

```sql
-- Créer le profil customer
INSERT INTO customers (id, email, first_name, last_name, customer_type)
SELECT 
  id,
  email,
  'Admin',
  'User',
  'individual'
FROM auth.users
WHERE email = 'admin@locagame.test';

-- Créer le profil admin_user
INSERT INTO admin_users (user_id, role, is_active)
SELECT 
  id,
  'admin',
  true
FROM auth.users
WHERE email = 'admin@locagame.test';
```

## 📝 Checklist

- [ ] Migration SQL exécutée
- [ ] Types TypeScript générés
- [ ] Test de connexion réussi
- [ ] Toutes les tables créées
- [ ] Premier utilisateur créé
- [ ] Profil admin créé

## 🎯 Après ces étapes

Une fois ces étapes complétées, on pourra :
1. Migrer l'AuthContext vers Supabase Auth
2. Créer un script de seed pour les données
3. Remplacer les fake-data par les services

---

**Besoin d'aide ?** Consultez `SUPABASE_CONNECTION_GUIDE.md` pour plus de détails.

