# 🎮 LocaGame - Configuration Supabase

## 🚀 Démarrage Rapide

### Option 1 : Exécution Manuelle du SQL (RECOMMANDÉ)

1. **Aller dans Supabase Dashboard**
   - Ouvrir [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionner le projet **"locagame"**
   - Cliquer sur **"SQL Editor"** dans le menu de gauche

2. **Exécuter le Script SQL**
   - Ouvrir le fichier `supabase/EXECUTE_THIS_SQL.sql`
   - **Tout copier** (Ctrl+A / Cmd+A puis Ctrl+C / Cmd+C)
   - **Coller** dans Supabase SQL Editor
   - Cliquer sur **"Run"** (ou F5)
   - Attendre 5-10 secondes

3. **Vérifier**
   ```
   ✅ Setup terminé avec succès!
   📊 Catégories: 8
   🚚 Zones de livraison: 7
   🎮 Produits: 6
   ```

### Option 2 : Via Script Node.js

```bash
# Installer les dépendances si ce n'est pas déjà fait
npm install

# Tester la connexion
npm run supabase:test

# Insérer les données (seed)
npm run supabase:seed
```

---

## 📊 Ce qui Sera Créé

### Tables (13 au total)
✅ **categories** - 8 catégories de produits
✅ **products** - 6 produits de démonstration
✅ **delivery_zones** - 7 zones de livraison PACA
✅ **customers** - Profils clients
✅ **addresses** - Adresses de livraison
✅ **reservations** - Réservations
✅ **reservation_items** - Détails des réservations
✅ **product_availability** - Disponibilité des produits
✅ **admin_users** - Utilisateurs admin
✅ **technicians** - Profils techniciens
✅ **vehicles** - Véhicules de livraison
✅ **delivery_tasks** - Tâches de livraison
✅ **customer_favorites** - Favoris clients

### Données Insérées (Seed Data)

#### Catégories (8)
- 🎰 Casino
- 🎯 Jeux de Bar
- 🎮 Jeux Vidéo
- 🎪 Animations
- 🎉 Événements
- 🌳 Extérieur
- 🥽 Réalité Virtuelle
- ✨ Décoration

#### Zones de Livraison (7)
- Marseille et périphérie (0€)
- Bouches-du-Rhône Ouest (45€)
- Bouches-du-Rhône Est (45€)
- Aix-en-Provence et environs (55€)
- Var (85€)
- Alpes-Maritimes (120€)
- Vaucluse (95€)

#### Produits (6)
- Table de Roulette Professionnelle (180€/jour)
- Table de Blackjack Premium (150€/jour)
- Baby-foot Professionnel Bonzini (80€/jour)
- Borne d'Arcade Rétro Multijeux (120€/jour)
- Jeu de Pétanque Géant (45€/jour)
- Pack VR Meta Quest 3 (90€/jour)

---

## 🧪 Tester la Connexion

### Depuis le Terminal
```bash
npm run supabase:test
```

Vous devriez voir :
```
✅ Connexion Supabase OK

1️⃣  Test: Récupération des catégories
   ✅ 8 catégories trouvées
      🎰 Casino
      🎯 Jeux de Bar
      ...

2️⃣  Test: Récupération des zones de livraison
   ✅ 7 zones trouvées
      🚚 Marseille et périphérie - 0€
      ...

3️⃣  Test: Récupération des produits
   ✅ 6 produits trouvés
      🎮 Table de Roulette Professionnelle - 180€/jour
      ...

🎉 SUCCÈS! Toutes les connexions fonctionnent!
```

### Depuis l'Application
```bash
npm run dev
```

Ouvrir http://localhost:5173 et vérifier dans la console du navigateur (F12) :
```javascript
// Pas d'erreur de connexion Supabase
```

---

## 👥 Créer des Utilisateurs de Test

### Méthode 1 : Via Supabase Dashboard (FACILE)

1. **Aller dans Authentication**
   - Supabase Dashboard > Authentication > Users
   - Cliquer sur **"Add User"**

2. **Créer un Client**
   - Email: `client@test.com`
   - Password: `password123`
   - Cocher "Auto Confirm User"
   - Cliquer sur "Create User"

3. **Créer le Profil Client**
   - Aller dans SQL Editor
   - Exécuter :
   ```sql
   INSERT INTO customers (id, email, first_name, last_name, phone, loyalty_points)
   SELECT id, 'client@test.com', 'Sophie', 'Martin', '06 12 34 56 78', 100
   FROM auth.users WHERE email = 'client@test.com'
   ON CONFLICT (id) DO NOTHING;
   ```

4. **Répéter pour Technicien et Admin**

   **Technicien** (`tech@test.com` / `password123`) :
   ```sql
   INSERT INTO technicians (user_id, first_name, last_name, email, phone)
   SELECT id, 'Marc', 'Dupont', 'tech@test.com', '06 98 76 54 32'
   FROM auth.users WHERE email = 'tech@test.com'
   ON CONFLICT (email) DO NOTHING;
   ```

   **Admin** (`admin@test.com` / `password123`) :
   ```sql
   INSERT INTO admin_users (user_id, role, is_active)
   SELECT id, 'super_admin', true
   FROM auth.users WHERE email = 'admin@test.com';
   ```

---

## 🔍 Vérification Complète

### Dans Supabase Dashboard

#### Vérifier les Tables
Aller dans **Table Editor** et vérifier que vous avez bien 13 tables.

#### Compter les Données
Exécuter dans SQL Editor :
```sql
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL SELECT 'delivery_zones', COUNT(*) FROM delivery_zones
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'technicians', COUNT(*) FROM technicians
UNION ALL SELECT 'admin_users', COUNT(*) FROM admin_users;
```

Résultat attendu :
```
categories       | 8
delivery_zones   | 7
products         | 6
customers        | 1 (si vous avez créé un utilisateur test)
technicians      | 1 (si vous avez créé un utilisateur test)
admin_users      | 1 (si vous avez créé un utilisateur test)
```

---

## 🎯 Fonctionnalités Connectées

### Interface Client ✅
- **Favoris** : Ajouter/retirer des produits en favoris
- **Réservations** : Voir ses réservations
- **Profil** : Modifier son profil

### Interface Technicien ✅
- **Tâches** : Voir les tâches assignées
- **Planning** : Vue calendrier des livraisons
- **Statuts** : Mettre à jour le statut des tâches

### Interface Admin ✅
- **Dashboard** : Statistiques temps réel
- **Réservations** : Gérer toutes les réservations
- **Planning** : Assigner des tâches aux techniciens
- **Produits** : Gérer le catalogue

---

## 🤖 Automatisations Actives

1. **Favoris Synchronisés**
   - Client ajoute un favori → Sync automatique entre appareils

2. **Assignation Tâches**
   - Admin assigne une tâche → Technicien la voit immédiatement

3. **Mise à Jour Statuts**
   - Technicien change le statut → Timestamps automatiques

4. **Statistiques Temps Réel**
   - Dashboard admin → Stats calculées en temps réel

---

## 📝 Structure des Fichiers

```
/Users/guimbard/Downloads/LocaGame-1/
├── supabase/
│   ├── migrations/
│   │   ├── 20251009081724_create_initial_schema.sql
│   │   └── 20251111_add_favorites_and_seed.sql
│   └── EXECUTE_THIS_SQL.sql ⭐ FICHIER À EXÉCUTER
├── scripts/
│   ├── setup-supabase.js
│   └── test-supabase-connection.js
├── src/
│   ├── services/ (9 services Supabase)
│   ├── pages/
│   │   ├── client/ (interfaces client)
│   │   ├── admin/ (interfaces admin)
│   │   └── technician/ (interfaces technicien)
│   └── lib/
│       ├── supabase.ts ⭐ Client Supabase
│       └── database.types.ts
├── .env ⭐ Variables d'environnement
├── COMMENT_EXECUTER_SQL.md ⭐ Guide détaillé
├── SUPABASE_DEPLOYMENT_GUIDE.md
├── AUTOMATISATIONS_SUPABASE.md
└── README_SUPABASE.md ⭐ Ce fichier
```

---

## ❌ Problèmes Courants

### "Table does not exist"
**Solution** : Exécutez le script SQL `supabase/EXECUTE_THIS_SQL.sql`

### "RLS policy violation"
**Solution** : Vérifiez que l'utilisateur est authentifié. Les données publiques (categories, products, zones) sont accessibles sans auth.

### "No rows found"
**Solution** : Vérifiez que le script SQL s'est bien exécuté et que les données sont insérées.

### "Cannot connect to Supabase"
**Solution** : Vérifiez vos variables d'environnement dans `.env`

---

## 📚 Documentation Complète

- **`COMMENT_EXECUTER_SQL.md`** - Guide détaillé d'exécution
- **`SUPABASE_DEPLOYMENT_GUIDE.md`** - Guide de déploiement complet
- **`AUTOMATISATIONS_SUPABASE.md`** - Documentation des automatisations
- **`AUDIT_FINAL_SUPABASE.md`** - Audit complet du projet

---

## ✅ Checklist de Démarrage

- [ ] Variables `.env` configurées
- [ ] Script SQL exécuté dans Supabase
- [ ] 13 tables créées
- [ ] 8 catégories insérées
- [ ] 7 zones insérées
- [ ] 6 produits insérés
- [ ] Test connexion réussi (`npm run supabase:test`)
- [ ] Au moins 1 utilisateur de test créé
- [ ] Application démarre sans erreur (`npm run dev`)
- [ ] Connexion Supabase fonctionne dans l'app

---

## 🎉 Prêt à Démarrer !

Une fois la checklist complétée, votre application est **100% fonctionnelle** avec Supabase !

**Commandes utiles** :
```bash
npm run dev              # Lancer l'application
npm run supabase:test    # Tester la connexion
npm run supabase:seed    # Réinsérer les données
npm run build            # Build de production
```

**Bon développement ! 🚀**
