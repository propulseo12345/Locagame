# 👥 Création des Utilisateurs de Démonstration

Guide pour créer les 3 utilisateurs de test permettant de tester toutes les interfaces LOCAGAME.

---

## 🎯 Objectif

Créer 3 comptes de démonstration pour tester :
- ✅ Interface **Administrateur** (`/admin/dashboard`)
- ✅ Interface **Client** (`/client/dashboard`)
- ✅ Interface **Technicien** (`/technician/dashboard`)

---

## 📋 Étape 1 : Créer les utilisateurs dans Supabase Auth

### Via le Dashboard Supabase

1. **Aller dans Supabase Dashboard**
   - Ouvrir votre projet Supabase
   - Cliquer sur **Authentication** dans le menu de gauche
   - Cliquer sur **Users**

2. **Créer le premier utilisateur (Admin)**
   - Cliquer sur **"Add User"** > **"Create new user"**
   - Remplir :
     - **Email** : `admin@locagame.fr`
     - **Password** : `admin123`
     - **Auto Confirm User** : ✅ **Cocher cette case**
   - Cliquer sur **"Create user"**

3. **Créer le deuxième utilisateur (Client)**
   - Cliquer sur **"Add User"** > **"Create new user"**
   - Remplir :
     - **Email** : `client@exemple.fr`
     - **Password** : `client123`
     - **Auto Confirm User** : ✅ **Cocher cette case**
   - Cliquer sur **"Create user"**

4. **Créer le troisième utilisateur (Technicien)**
   - Cliquer sur **"Add User"** > **"Create new user"**
   - Remplir :
     - **Email** : `technicien@locagame.fr`
     - **Password** : `tech123`
     - **Auto Confirm User** : ✅ **Cocher cette case**
   - Cliquer sur **"Create user"**

---

## 📋 Étape 2 : Créer les profils dans les tables

### Via SQL Editor

1. **Ouvrir SQL Editor**
   - Dans Supabase Dashboard, cliquer sur **SQL Editor**
   - Cliquer sur **"New query"**

2. **Exécuter le script**
   - Ouvrir le fichier `supabase/create_demo_users.sql`
   - Copier tout le contenu
   - Coller dans le SQL Editor
   - Cliquer sur **"Run"** (ou `Ctrl+Enter`)

3. **Vérifier les résultats**
   - Le script affichera des messages de confirmation
   - Vérifier qu'il n'y a pas d'erreurs

---

## ✅ Vérification

### Vérifier que les utilisateurs sont créés

Exécuter cette requête dans SQL Editor :

```sql
-- Vérifier les utilisateurs auth
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email IN (
  'admin@locagame.fr',
  'client@exemple.fr',
  'technicien@locagame.fr'
)
ORDER BY email;
```

### Vérifier les profils

Exécuter cette requête :

```sql
-- Vérifier tous les profils
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
```

**Résultat attendu** : 3 lignes (une pour chaque type)

---

## 🧪 Tester la connexion

### Dans l'application

1. **Aller sur la page de connexion**
   - URL : `http://localhost:5173/login`

2. **Tester chaque compte**
   - Cliquer sur les boutons de démonstration
   - Ou saisir manuellement les credentials

3. **Vérifier les redirections**
   - **Admin** → `/admin/dashboard`
   - **Client** → `/client/dashboard`
   - **Technicien** → `/technician/dashboard`

---

## 📊 Credentials de démonstration

| Rôle | Email | Password | Interface |
|------|-------|----------|-----------|
| 🔧 **Administrateur** | `admin@locagame.fr` | `admin123` | `/admin/dashboard` |
| 👤 **Client** | `client@exemple.fr` | `client123` | `/client/dashboard` |
| 🚚 **Technicien** | `technicien@locagame.fr` | `tech123` | `/technician/dashboard` |

---

## 🔧 Dépannage

### "Email ou mot de passe incorrect"
- ✅ Vérifier que l'utilisateur existe dans `auth.users`
- ✅ Vérifier que l'email est correct (sensible à la casse)
- ✅ Vérifier que le mot de passe est correct

### "Profil utilisateur introuvable"
- ✅ Vérifier que le profil existe dans la table correspondante
- ✅ Vérifier que `user_id` (ou `id` pour customers) correspond à `auth.users.id`
- ✅ Exécuter à nouveau le script `create_demo_users.sql`

### Redirection vers `/login` en boucle
- ✅ Vérifier que le rôle est correctement déterminé
- ✅ Vérifier les politiques RLS dans Supabase
- ✅ Vérifier les logs de la console navigateur

---

## 📝 Notes importantes

- ⚠️ **Ne pas utiliser ces credentials en production**
- ⚠️ **Changer les mots de passe** si vous déployez en production
- ✅ Les utilisateurs sont **auto-confirmés** (pas besoin de vérifier l'email)
- ✅ Les sessions sont **persistantes** (reste connecté après refresh)

---

**✅ Une fois les utilisateurs créés, vous pouvez tester toutes les interfaces !**

