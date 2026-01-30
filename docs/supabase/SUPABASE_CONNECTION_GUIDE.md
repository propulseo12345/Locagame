# 🚀 Guide de Connexion Supabase - Étape par Étape

## 📋 Prérequis

- Compte Supabase créé
- Projet Supabase créé
- Node.js et npm installés
- Accès au terminal

---

## Phase 1 : Configuration Initiale

### ✅ Étape 1 : Créer le projet Supabase et récupérer les clés

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet (ou utiliser un existant)
3. Attendre que le projet soit prêt (2-3 minutes)
4. Aller dans **Settings** → **API**
5. Copier :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public key** (clé publique)

### ✅ Étape 2 : Créer le fichier .env

Créer un fichier `.env` à la racine du projet :

```bash
# .env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Important** : Ne pas commiter le fichier `.env` (il devrait être dans `.gitignore`)

### ✅ Étape 3 : Vérifier que .env est dans .gitignore

```bash
# Vérifier
cat .gitignore | grep .env

# Si pas présent, ajouter :
echo ".env" >> .gitignore
```

---

## Phase 2 : Migration de la Base de Données

### ✅ Étape 4 : Exécuter la migration SQL

1. Aller dans Supabase Dashboard → **SQL Editor**
2. Cliquer sur **New Query**
3. Ouvrir le fichier `supabase/migrations/20251009081724_create_initial_schema.sql`
4. Copier tout le contenu
5. Coller dans l'éditeur SQL de Supabase
6. Cliquer sur **Run** (ou `Ctrl+Enter`)

**Vérification** :
- ✅ Pas d'erreurs dans la console
- ✅ Message "Success. No rows returned"

### ✅ Étape 5 : Vérifier les tables créées

1. Aller dans **Table Editor** dans Supabase Dashboard
2. Vérifier que toutes ces tables existent :
   - ✅ `categories`
   - ✅ `products`
   - ✅ `delivery_zones`
   - ✅ `customers`
   - ✅ `addresses`
   - ✅ `reservations`
   - ✅ `reservation_items`
   - ✅ `product_availability`
   - ✅ `admin_users`
   - ✅ `technicians`
   - ✅ `vehicles`
   - ✅ `delivery_tasks`

---

## Phase 3 : Types TypeScript

### ✅ Étape 6 : Régénérer les types TypeScript

**Option 1 : Via CLI Supabase (recommandé)**

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter à Supabase
npx supabase login

# Générer les types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

**Option 2 : Via Dashboard Supabase**

1. Aller dans **Settings** → **API**
2. Scroller jusqu'à **TypeScript types**
3. Copier le code généré
4. Coller dans `src/lib/database.types.ts` (remplacer le contenu)

**⚠️ Note** : Le fichier `database.types.ts` existe déjà mais doit être mis à jour avec les types réels de votre DB.

---

## Phase 4 : Test de Connexion

### ✅ Étape 7 : Tester la connexion

Créer un fichier de test temporaire ou tester dans la console du navigateur :

```typescript
// Test simple dans la console du navigateur (F12)
import { supabase } from './lib/supabase';

// Test de connexion
const testConnection = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);
  
  console.log('Connection test:', { data, error });
};

testConnection();
```

**Résultat attendu** :
- ✅ Pas d'erreur de connexion
- ✅ `data` peut être vide (normal, pas encore de données)
- ✅ `error` est `null`

---

## Phase 5 : Authentification

### ✅ Étape 8 : Créer les premiers utilisateurs

**Méthode 1 : Via Supabase Dashboard (pour tests)**

1. Aller dans **Authentication** → **Users**
2. Cliquer sur **Add user** → **Create new user**
3. Créer un utilisateur test :
   - Email : `admin@locagame.test`
   - Password : `admin123`
   - Auto Confirm User : ✅ (pour tests)

**Méthode 2 : Via SQL (pour plusieurs utilisateurs)**

```sql
-- Dans SQL Editor de Supabase
-- Créer un utilisateur admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@locagame.test',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

### ✅ Étape 9 : Créer les profils customers/technicians

Après avoir créé les utilisateurs dans `auth.users`, créer leurs profils :

```sql
-- Créer le profil customer pour l'admin
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

---

## Phase 6 : Migration du Code

### ✅ Étape 10 : Migrer AuthContext vers Supabase Auth

**Fichier** : `src/contexts/AuthContext.tsx`

**Changements nécessaires** :

```typescript
// AVANT (fake-data)
import { findUserByCredentials, findUserById } from '../lib/fake-data/users';

const signIn = async (email: string, password: string) => {
  const foundUser = findUserByCredentials(email, password);
  // ...
};

// APRÈS (Supabase)
import { supabase } from '../lib/supabase';

const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Récupérer le profil customer/technician/admin
  const { data: profile } = await supabase
    .from('customers')
    .select('*')
    .eq('id', data.user.id)
    .single();

  setUser({
    id: data.user.id,
    email: data.user.email!,
    role: 'client', // ou déterminer depuis admin_users/technicians
    // ... autres champs
  });
};
```

**Guide complet** : Voir `AUTHENTIFICATION_GUIDE.md` (si existe)

### ✅ Étape 11 : Tester login/logout

1. Démarrer l'application : `npm run dev`
2. Aller sur `/login`
3. Tester avec les identifiants créés
4. Vérifier :
   - ✅ Login fonctionne
   - ✅ Redirection vers le bon dashboard
   - ✅ Logout fonctionne
   - ✅ Session persiste après refresh

---

## Phase 7 : Migration des Données

### ✅ Étape 12 : Créer un script de seed

Créer `scripts/seed-data.ts` ou utiliser SQL directement.

**Option SQL (recommandé pour début)** :

```sql
-- Exemple : Insérer des catégories
INSERT INTO categories (name, slug, description, display_order) VALUES
('Casino', 'casino', 'Jeux de casino et tables de jeu', 1),
('Jeux de Bar', 'jeux-de-bar', 'Jeux pour bars et événements', 2),
('Jeux Vidéo', 'jeux-video', 'Consoles et jeux vidéo', 3);

-- Exemple : Insérer des zones de livraison
INSERT INTO delivery_zones (name, postal_codes, cities, delivery_fee, free_delivery_threshold)
VALUES
('Marseille Centre', ARRAY['13001', '13002', '13003'], ARRAY['Marseille'], 0, 0),
('Marseille Périphérie', ARRAY['13004', '13005', '13006'], ARRAY['Marseille'], 15, 100);
```

**Option TypeScript** (pour données complexes) :

```typescript
// scripts/seed-data.ts
import { supabase } from '../src/lib/supabase';
import { fakeProducts } from '../src/lib/fake-data/products';

async function seedProducts() {
  for (const product of fakeProducts) {
    const { error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        slug: product.slug,
        // ... mapper tous les champs
      });
    
    if (error) console.error('Error seeding product:', error);
  }
}
```

### ✅ Étape 13 : Exécuter le script de seed

**Via SQL Editor** (plus simple) :
1. Copier les INSERT SQL
2. Exécuter dans SQL Editor
3. Vérifier dans Table Editor que les données sont présentes

**Via script TypeScript** :
```bash
npx tsx scripts/seed-data.ts
```

---

## Phase 8 : Remplacer Fake-Data

### ✅ Étape 14 : Remplacer les usages de fake-data

**Fichiers à modifier** (22 fichiers identifiés) :

1. **Pages Client** :
   - `src/pages/client/ClientDashboard.tsx`
   - `src/pages/client/ClientReservations.tsx`
   - `src/pages/client/ClientFavorites.tsx`
   - `src/pages/client/ClientProfile.tsx`
   - `src/pages/client/ClientAddresses.tsx`

2. **Pages Admin** :
   - `src/pages/admin/AdminDashboard.tsx`
   - `src/pages/admin/AdminProducts.tsx`
   - `src/pages/admin/AdminReservations.tsx`
   - `src/pages/admin/AdminPlanning.tsx`
   - `src/pages/admin/AdminCustomers.tsx`

3. **Pages Technician** :
   - `src/pages/technician/TechnicianDashboard.tsx`
   - `src/pages/technician/TechnicianTasks.tsx`

**Exemple de remplacement** :

```typescript
// AVANT
import { fakeProducts } from '../../lib/fake-data';
const products = fakeProducts;

// APRÈS
import { ProductsService } from '../../services/products.service';
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  ProductsService.getProducts().then(setProducts);
}, []);
```

---

## Phase 9 : Tests Finaux

### ✅ Étape 15 : Tester toutes les fonctionnalités

**Checklist de tests** :

- [ ] **Authentification** :
  - [ ] Login client
  - [ ] Login admin
  - [ ] Login technician
  - [ ] Logout
  - [ ] Session persistante

- [ ] **Produits** :
  - [ ] Liste des produits
  - [ ] Détail d'un produit
  - [ ] Filtres et recherche
  - [ ] Création produit (admin)
  - [ ] Modification produit (admin)

- [ ] **Réservations** :
  - [ ] Création réservation
  - [ ] Liste réservations client
  - [ ] Liste réservations admin
  - [ ] Détail réservation
  - [ ] Mise à jour statut

- [ ] **Livraisons** :
  - [ ] Liste tâches technician
  - [ ] Planning admin
  - [ ] Drag & drop assignation
  - [ ] Mise à jour statut tâche

- [ ] **Adresses** :
  - [ ] Liste adresses client
  - [ ] Création adresse
  - [ ] Modification adresse
  - [ ] Suppression adresse

---

## Phase 10 : Sécurité et Optimisation

### ✅ Étape 16 : Vérifier les RLS Policies

1. Aller dans **Authentication** → **Policies**
2. Vérifier chaque table :
   - ✅ Les clients ne voient que leurs données
   - ✅ Les admins voient tout
   - ✅ Les technicians voient leurs tâches

**Test de sécurité** :
- Se connecter en tant que client
- Essayer d'accéder aux données d'un autre client
- ✅ Doit échouer (RLS bloque)

---

## 🎯 Checklist Finale

### Configuration
- [ ] Fichier `.env` créé avec les bonnes clés
- [ ] Migration SQL exécutée sans erreur
- [ ] Toutes les tables créées
- [ ] Types TypeScript régénérés

### Authentification
- [ ] Utilisateurs créés dans `auth.users`
- [ ] Profils créés dans `customers`/`technicians`/`admin_users`
- [ ] `AuthContext` migré vers Supabase Auth
- [ ] Login/logout fonctionnels

### Données
- [ ] Données de seed insérées
- [ ] Fake-data remplacée par services
- [ ] Toutes les fonctionnalités testées

### Sécurité
- [ ] RLS policies vérifiées
- [ ] Tests de sécurité effectués
- [ ] Pas de données exposées

---

## 🆘 Dépannage

### Erreur : "Invalid API key"
- Vérifier que `.env` contient les bonnes clés
- Redémarrer le serveur de dev après modification de `.env`

### Erreur : "relation does not exist"
- Vérifier que la migration SQL a été exécutée
- Vérifier le nom de la table (snake_case)

### Erreur : "new row violates row-level security policy"
- Vérifier les RLS policies
- Vérifier que l'utilisateur est bien authentifié
- Vérifier que l'utilisateur a les bonnes permissions

### Les données ne s'affichent pas
- Vérifier la console pour les erreurs
- Vérifier que les données existent dans Supabase
- Vérifier les RLS policies

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript Types](https://supabase.com/docs/reference/javascript/typescript-support)

---

**Bon courage pour la connexion ! 🚀**

