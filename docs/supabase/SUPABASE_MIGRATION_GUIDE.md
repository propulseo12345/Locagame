# 🚀 Guide de Migration Supabase - LOCAGAME

Ce guide vous accompagne pas à pas dans la connexion de votre projet à Supabase.

---

## 📋 Prérequis

- [ ] Compte Supabase créé (https://supabase.com)
- [ ] Projet créé dans Supabase
- [ ] Node.js 18+ installé
- [ ] Git installé

---

## 🔧 Étape 1: Configuration du Projet Supabase

### 1.1 Créer un Nouveau Projet

1. Connectez-vous à https://app.supabase.com
2. Cliquez sur "New Project"
3. Renseignez:
   - **Name**: LOCAGAME
   - **Database Password**: Choisir un mot de passe fort (NOTEZ-LE!)
   - **Region**: Choisir la plus proche (eu-west-3 pour Paris)
   - **Pricing Plan**: Free ou Pro selon vos besoins

### 1.2 Récupérer les Credentials

Une fois le projet créé:

1. Allez dans **Settings** > **API**
2. Copiez:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public key** → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.3 Configurer les Variables d'Environnement

1. Copiez le fichier `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Éditez `.env` avec vos credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

⚠️ **Important**: Ne commitez JAMAIS le fichier `.env` sur Git!

---

## 🗄️ Étape 2: Créer les Tables

### 2.1 Accéder à l'Éditeur SQL

1. Dans Supabase, allez dans **SQL Editor**
2. Créez un nouveau query

### 2.2 Créer les Tables Principales

Copiez et exécutez ce script SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  pricing JSONB NOT NULL,
  total_stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: delivery_zones
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  postal_codes TEXT[] DEFAULT '{}',
  cities TEXT[] DEFAULT '{}',
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  free_delivery_threshold DECIMAL(10,2),
  estimated_delivery_time TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: customers
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  customer_type TEXT DEFAULT 'individual',
  company_name TEXT,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  zone_id UUID REFERENCES delivery_zones(id),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: reservations
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  delivery_time TIME,
  delivery_type TEXT NOT NULL,
  delivery_address_id UUID REFERENCES addresses(id),
  zone_id UUID REFERENCES delivery_zones(id),
  event_type TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_transaction_id TEXT,
  deposit_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: reservation_items
CREATE TABLE reservation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  duration_days INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: product_availability
CREATE TABLE product_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  quantity INTEGER DEFAULT 1,
  buffer_hours INTEGER DEFAULT 4,
  status TEXT DEFAULT 'reserved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Créer les Index pour Performance

```sql
-- Index sur les tables principales
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(featured);

CREATE INDEX idx_reservations_customer ON reservations(customer_id);
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX idx_reservations_status ON reservations(status);

CREATE INDEX idx_addresses_customer ON addresses(customer_id);
CREATE INDEX idx_reservation_items_reservation ON reservation_items(reservation_id);
CREATE INDEX idx_reservation_items_product ON reservation_items(product_id);
```

### 2.4 Activer Row Level Security (RLS)

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;

-- Policies pour les produits (lecture publique)
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Policies pour les zones de livraison (lecture publique)
CREATE POLICY "Public can view active zones" ON delivery_zones
  FOR SELECT USING (is_active = true);

-- Policies pour les customers (accès propre profil)
CREATE POLICY "Users can view own profile" ON customers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON customers
  FOR UPDATE USING (auth.uid() = id);

-- Policies pour les adresses
CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own addresses" ON addresses
  FOR UPDATE USING (auth.uid() = customer_id);

-- Policies pour les réservations
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can create reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
```

---

## 🔐 Étape 3: Configurer l'Authentification

### 3.1 Activer les Providers

Dans Supabase > **Authentication** > **Providers**:

1. **Email** - Activé par défaut ✅
2. **Google OAuth** (optionnel)
3. **Facebook OAuth** (optionnel)

### 3.2 Configurer les Templates Email

Dans **Authentication** > **Email Templates**:

- Personnalisez les emails de confirmation
- Ajoutez votre logo
- Modifiez les textes

---

## 📊 Étape 4: Importer des Données de Test

### 4.1 Catégories

```sql
INSERT INTO categories (name, slug, description, display_order, icon) VALUES
('Jeux Gonflables', 'jeux-gonflables', 'Châteaux, toboggans et structures gonflables', 1, 'Castle'),
('Jeux en Bois', 'jeux-bois', 'Jeux traditionnels en bois', 2, 'Trees'),
('Animations', 'animations', 'Animations et spectacles', 3, 'Sparkles'),
('Sports', 'sports', 'Équipements sportifs', 4, 'Trophy');
```

### 4.2 Produit Exemple

```sql
INSERT INTO products (
  name,
  slug,
  description,
  category_id,
  specifications,
  pricing,
  total_stock,
  images,
  is_active,
  featured
)
SELECT
  'Château Gonflable Arc-en-ciel',
  'chateau-gonflable-arc-en-ciel',
  'Magnifique château gonflable coloré, idéal pour les anniversaires',
  id,
  '{"dimensions": "4x4m", "weight": 45, "players": {"min": 6, "max": 12}, "electricity": true, "setup_time": 20}'::jsonb,
  '{"oneDay": 150, "weekend": 250, "week": 500}'::jsonb,
  5,
  ARRAY['https://example.com/chateau.jpg'],
  true,
  true
FROM categories WHERE slug = 'jeux-gonflables';
```

### 4.3 Zone de Livraison Exemple

```sql
INSERT INTO delivery_zones (name, postal_codes, cities, delivery_fee, free_delivery_threshold)
VALUES
('Paris Centre', ARRAY['75001','75002','75003','75004'], ARRAY['Paris'], 50.00, 300.00),
('Hauts-de-Seine', ARRAY['92000','92100','92200'], ARRAY['Nanterre','Boulogne','Neuilly'], 75.00, 400.00);
```

---

## 🧪 Étape 5: Tester la Connexion

### 5.1 Lancer l'Application

```bash
npm run dev
```

### 5.2 Vérifier dans la Console

Ouvrez les DevTools (F12) et vérifiez qu'il n'y a pas d'erreur de connexion Supabase.

### 5.3 Test d'Inscription

1. Créez un compte sur `/compte`
2. Vérifiez que l'utilisateur apparaît dans Supabase > **Authentication** > **Users**
3. Vérifiez qu'une entrée est créée dans la table `customers`

---

## 🔄 Étape 6: Migrer le Code

### 6.1 Remplacer les Mock Data

**Avant:**
```tsx
import { mockProducts } from '../lib/fake-data';

function CatalogPage() {
  const [products] = useState(mockProducts);
  // ...
}
```

**Après:**
```tsx
import { ProductsService } from '../services';
import { useState, useEffect } from 'react';

function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await ProductsService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) return <LoadingSpinner />;
  // ...
}
```

### 6.2 Utiliser les Contexts

**Cart Context:**
```tsx
import { useCart } from '../contexts/CartContext';

function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      product,
      quantity: 1,
      start_date: '2025-01-01',
      end_date: '2025-01-02',
      total_price: product.pricing.oneDay,
    });
  };
}
```

**Auth Context:**
```tsx
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { user, signOut } = useAuth();

  return (
    <div>
      {user ? (
        <button onClick={signOut}>Déconnexion</button>
      ) : (
        <Link to="/login">Connexion</Link>
      )}
    </div>
  );
}
```

---

## 🚨 Troubleshooting

### Erreur: "Invalid API Key"
→ Vérifiez que la `VITE_SUPABASE_ANON_KEY` est correcte dans `.env`

### Erreur: "Network Error"
→ Vérifiez que l'URL Supabase est correcte et que le projet est actif

### Erreur: "Permission Denied"
→ Vérifiez les Row Level Security policies

### Les données ne s'affichent pas
→ Vérifiez dans Supabase > **Table Editor** que les données existent

---

## ✅ Checklist de Migration

- [ ] Projet Supabase créé
- [ ] Variables d'environnement configurées
- [ ] Tables créées avec SQL
- [ ] Index créés
- [ ] RLS activé et policies configurées
- [ ] Données de test importées
- [ ] Authentification testée
- [ ] Services API testés
- [ ] Mock data remplacée
- [ ] Contexts intégrés
- [ ] Application testée end-to-end

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## 💡 Conseils

1. **Testez en local d'abord** avant de déployer
2. **Utilisez des données de test** pendant le développement
3. **Activez les logs** dans Supabase pour debugger
4. **Sauvegardez régulièrement** votre base de données
5. **Documentez** vos modifications

---

**Bon courage avec votre migration ! 🚀**

Si vous rencontrez des problèmes, consultez la documentation Supabase ou contactez leur support.
