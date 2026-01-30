# 🚀 Comment Exécuter le Script SQL dans Supabase

## 📋 Instructions Rapides

### Étape 1 : Ouvrir Supabase Dashboard
1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Se connecter à votre compte
3. Sélectionner le projet **"locagame"**

### Étape 2 : Ouvrir le SQL Editor
1. Dans le menu de gauche, cliquer sur **"SQL Editor"**
2. Cliquer sur **"New query"** (nouvelle requête)

### Étape 3 : Copier le Script SQL
1. Ouvrir le fichier **`supabase/EXECUTE_THIS_SQL.sql`**
2. **TOUT SÉLECTIONNER** (Ctrl+A ou Cmd+A)
3. **COPIER** tout le contenu (Ctrl+C ou Cmd+C)

### Étape 4 : Coller et Exécuter
1. Retourner dans Supabase SQL Editor
2. **COLLER** le script complet (Ctrl+V ou Cmd+V)
3. Cliquer sur **"Run"** (ou F5)
4. Attendre que le script s'exécute (environ 5-10 secondes)

### Étape 5 : Vérifier les Résultats
Vous devriez voir à la fin :
```
✅ Setup terminé avec succès!
📊 Catégories: 8
🚚 Zones de livraison: 7
🎮 Produits: 6
```

---

## 🔍 Vérification que Tout a Fonctionné

### Vérifier les Tables Créées
1. Dans Supabase, cliquer sur **"Table Editor"** (menu de gauche)
2. Vous devriez voir **13 tables** :
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
   - ✅ customer_favorites

### Vérifier les Données Insérées

#### 1. Catégories (8 catégories)
```sql
SELECT * FROM categories ORDER BY display_order;
```
Vous devriez voir : Casino, Jeux de Bar, Jeux Vidéo, Animations, Événements, Extérieur, Réalité Virtuelle, Décoration

#### 2. Zones de Livraison (7 zones)
```sql
SELECT name, delivery_fee FROM delivery_zones ORDER BY delivery_fee;
```
Vous devriez voir : Marseille (0€), Bouches-du-Rhône (45€), Aix-en-Provence (55€), Var (85€), etc.

#### 3. Produits (6 produits)
```sql
SELECT name, pricing->>'oneDay' as prix_jour FROM products;
```
Vous devriez voir : Table de Roulette, Blackjack, Baby-foot, Borne Arcade, Pétanque Géant, Pack VR

---

## ❌ Problèmes Courants

### Erreur : "relation already exists"
**Solution** : Les tables existent déjà. Pas de problème ! Le script utilise `CREATE TABLE IF NOT EXISTS` et `ON CONFLICT DO NOTHING`.

### Erreur : "permission denied"
**Solution** : Vérifiez que vous êtes bien connecté avec un compte admin du projet.

### Les données ne s'affichent pas
**Solution** :
1. Vérifier que RLS (Row Level Security) est activé
2. Les données sont publiques pour categories, products, et delivery_zones
3. Pour customers, reservations, etc., vous devez être authentifié

---

## 🧪 Tester la Connexion depuis l'Application

### 1. Vérifier les Variables d'Environnement
Ouvrir `.env` et vérifier :
```bash
VITE_SUPABASE_URL=https://koqdpkkuarbjiimkopei.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Lancer l'Application
```bash
cd /Users/guimbard/Downloads/LocaGame-1
npm install
npm run dev
```

### 3. Ouvrir dans le Navigateur
```
http://localhost:5173
```

### 4. Tester la Connexion
Ouvrir la console du navigateur (F12) et taper :
```javascript
// Importer le client Supabase
import { supabase } from './src/lib/supabase';

// Tester la connexion
const { data, error } = await supabase.from('categories').select('*');
console.log('Catégories:', data);

// Devrait afficher les 8 catégories
```

---

## 📊 Créer des Utilisateurs de Test (Optionnel)

### Créer un Client Test
```sql
-- Note: Cela nécessite que vous créiez d'abord l'utilisateur dans Supabase Auth UI
-- Aller dans Authentication > Users > Add User

-- Email: client@test.com
-- Password: password123

-- Puis exécuter ce SQL pour créer le profil :
INSERT INTO customers (id, email, first_name, last_name, phone, loyalty_points)
SELECT
  id,
  'client@test.com',
  'Sophie',
  'Martin',
  '06 12 34 56 78',
  100
FROM auth.users
WHERE email = 'client@test.com'
ON CONFLICT (id) DO NOTHING;
```

### Créer un Technicien Test
```sql
-- Email: tech@test.com
-- Password: password123

INSERT INTO technicians (user_id, first_name, last_name, email, phone)
SELECT
  id,
  'Marc',
  'Dupont',
  'tech@test.com',
  '06 98 76 54 32'
FROM auth.users
WHERE email = 'tech@test.com'
ON CONFLICT (email) DO NOTHING;
```

### Créer un Admin Test
```sql
-- Email: admin@test.com
-- Password: password123

INSERT INTO admin_users (user_id, role, is_active)
SELECT
  id,
  'super_admin',
  true
FROM auth.users
WHERE email = 'admin@test.com'
ON CONFLICT DO NOTHING;
```

---

## ✅ Checklist Finale

- [ ] Script SQL exécuté sans erreur
- [ ] 13 tables créées dans Supabase
- [ ] 8 catégories insérées
- [ ] 7 zones de livraison insérées
- [ ] 6 produits insérés
- [ ] Variables .env configurées
- [ ] Application lance sans erreur
- [ ] Connexion Supabase fonctionne depuis l'app

---

## 🆘 Besoin d'Aide ?

### Logs Supabase
Pour voir les logs détaillés :
1. Supabase Dashboard > Logs
2. Filtrer par "Postgres Logs"

### Tester dans SQL Editor
```sql
-- Compter les données
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'delivery_zones', COUNT(*) FROM delivery_zones
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations;
```

---

**Bon courage ! 🚀**

Le script est complet et prêt à être exécuté. Suivez ces étapes et tout devrait fonctionner parfaitement.
