# CLAUDE.md - LOCAGAME

## Vue d'ensemble

LOCAGAME est une plateforme SaaS de location de jeux et animations pour événements. Application multi-interfaces avec site vitrine, back-office admin, espace client et interface technicien.

## Stack technique

| Tech | Usage |
|------|-------|
| React 18 + TypeScript | Framework UI |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Supabase | Backend (PostgreSQL + Auth) |
| Framer Motion | Animations |
| React Router v7 | Routage (lazy loading) |

## Commandes

```bash
npm run dev      # Serveur dev (port 5173)
npm run build    # Build production
npm run preview  # Preview du build
```

## Structure du projet

```
src/
├── App.tsx              # Routeur principal (utilise ROUTES constants)
├── main.tsx             # Point d'entrée
├── index.css            # Styles globaux + CSS variables
├── pages/               # Pages (suffixe Page)
│   ├── admin/           # Interface admin
│   ├── client/          # Espace client
│   └── technician/      # Interface technicien
├── components/          # Composants React
│   ├── ui/              # Atomiques (Button, Card, Input, ScrollReveal)
│   ├── catalog/         # Composants catalogue (CategoryFilters, ProductResultsBar)
│   ├── product/         # Composants produit (ProductGallery, ProductInfoTabs)
│   ├── checkout/        # Composants checkout (CheckoutStepper, CustomerInfoStep)
│   ├── admin/
│   ├── client/
│   └── technician/
├── contexts/            # State management (Auth, Cart, Toast)
├── services/            # API Supabase (*.service.ts)
├── hooks/               # Hooks custom (useDebounce, useCatalogFilters)
├── types/               # Interfaces TypeScript
├── lib/                 # Config Supabase + helpers
├── utils/               # Fonctions utilitaires
└── constants/           # Constantes métier (routes.ts)
```

## Conventions de nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `ProductCard.tsx` |
| Pages | PascalCase + Page | `CatalogPage.tsx` |
| Hooks | camelCase + use | `useDebounce.ts` |
| Services | camelCase + .service | `products.service.ts` |
| Utils | camelCase | `pricing.ts` |
| Types | PascalCase (pas de I) | `Product`, `Order` |

## Patterns de code

### Services Supabase

Classes statiques avec méthodes async. CRUD standard + méthodes métier.

```typescript
export class ProductsService {
  static async getProducts(filters?: FilterOptions): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true);

    if (error) throw error;
    return data as Product[];
  }

  static async getProductById(id: string): Promise<Product | null> { ... }
  static async createProduct(...): Promise<Product> { ... }
  static async updateProduct(...): Promise<Product> { ... }
  static async deleteProduct(...): Promise<void> { ... }
}
```

### Hooks custom

```typescript
// Hooks disponibles via src/hooks/index.ts
import { useDebounce, useCatalogFilters, useLocalStorage, useMediaQuery } from '../hooks';

// Exemple: useCatalogFilters pour gérer les filtres du catalogue
const {
  filteredProducts,
  paginatedProducts,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  clearFilters
} = useCatalogFilters({ products, categories, itemsPerPage: 12 });
```

### Composants

Pattern simple : 1 fichier = 1 composant. Barrel exports dans chaque dossier de composants.

```typescript
// Imports via barrel exports
import { CategoryFilters, ProductResultsBar } from '../components/catalog';
import { ProductGallery, ProductInfoTabs } from '../components/product';
import { CheckoutStepper, CustomerInfoStep } from '../components/checkout';
import { Button, Card, ScrollReveal } from '../components/ui';
```

### Routes

Les routes sont centralisées dans `src/constants/routes.ts` :

```typescript
import { ROUTES } from '../constants/routes';

// Utilisation
<Route path={ROUTES.CATALOG} element={<CatalogPage />} />
<Link to={ROUTES.ADMIN.DASHBOARD}>Dashboard</Link>
```

## Variables d'environnement

```bash
# Obligatoires
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optionnels
VITE_APP_NAME=LOCAGAME
VITE_APP_URL=https://www.locagame.fr
VITE_GOOGLE_ANALYTICS_ID=
VITE_STRIPE_PUBLIC_KEY=
```

## Base de données Supabase

### Tables principales

| Table | Usage |
|-------|-------|
| products | Catalogue produits |
| categories | Catégories |
| customers | Clients |
| technicians | Techniciens |
| orders / reservations | Réservations |
| product_availability | Disponibilités/blocages |
| delivery_zones | Zones de livraison |
| vehicles | Véhicules |

### RLS

Prévu mais non implémenté. À activer lors du passage en production.

## Fichiers sensibles

| Fichier | Pourquoi |
|---------|----------|
| `src/lib/supabase.ts` | Config Supabase - ne pas casser |
| `src/lib/database.types.ts` | Types Supabase générés |
| `src/contexts/AuthContext.tsx` | Auth globale - critique |
| `src/contexts/CartContext.tsx` | Panier - persistance localStorage |
| `src/App.tsx` | Routeur - toutes les routes (ROUTES constants) |
| `src/constants/routes.ts` | Routes centralisées |
| `.env` | Secrets - jamais commiter |
| `src/types/index.ts` | Types partagés partout |
| `src/services/delivery.service.ts` | Mapping types stricts |

## Les 4 interfaces

1. **Site Vitrine** (`/`) - Catalogue, panier, réservation, SEO optimisé
2. **Admin** (`/admin`) - Dashboard KPIs, gestion produits/réservations/planning/zones
3. **Espace Client** (`/client`) - Historique réservations, favoris, profil, adresses
4. **Interface Technicien** (`/technician`) - Tâches livraison/retrait du jour

## Workflow Git (recommandé)

### Branches
- `feat/nom-feature` - Nouvelles fonctionnalités
- `fix/nom-bug` - Corrections
- `chore/nom-tache` - Maintenance

### Commits (Conventional Commits)
```
feat: ajout filtres catalogue
fix: correction calcul prix panier
chore: mise à jour dépendances
```

## État du projet

| Aspect | Statut |
|--------|--------|
| Frontend | Complet (~60 fichiers TS, 20+ pages) |
| Services Supabase | Implémentés (10 services, types stricts) |
| Build optimisé | ~1.2 MB, code splitting, tree shaking |
| Composants réutilisables | catalog/, product/, checkout/ |
| Hooks métier | useCatalogFilters, useDebounce, useMediaQuery |
| Routes centralisées | constants/routes.ts |
| SEO | 90/100 |
| Connexion DB réelle | En attente |
| Tests | À ajouter |

## Qualité du code

- Types stricts (pas de `any` dans les services critiques)
- Pas de `console.log` en production
- React.memo sur les composants de liste (ProductCard)
- Barrel exports pour imports propres

## Tâches courantes

### Ajouter un nouveau composant
1. Créer `src/components/MonComposant.tsx`
2. Typer les props avec interface
3. Exporter par défaut

### Ajouter une nouvelle page
1. Créer `src/pages/MaPage.tsx` (ou dans sous-dossier admin/client/technician)
2. Ajouter la route dans `App.tsx` (avec lazy loading)

### Ajouter un service Supabase
1. Créer `src/services/monentite.service.ts`
2. Suivre le pattern classe statique
3. Importer les types depuis `src/types`

### Connecter un composant à Supabase
1. Remplacer import `data/` par appel service
2. Gérer loading/error states
3. Utiliser try/catch

## Documentation

Fichiers de doc à la racine :
- `QUICK_START.md` - Démarrage rapide
- `SUPABASE_MIGRATION_GUIDE.md` - Migration DB
