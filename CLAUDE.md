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
| Lucide React | Icônes |
| @dnd-kit | Drag & drop (planning admin) |
| xlsx | Import/export Excel |

## Commandes

```bash
npm run dev      # Serveur dev (port 1974)
npm run build    # Build production
npm run preview  # Preview du build
npm run typecheck       # Vérification TypeScript
npm run supabase:test   # Test connexion Supabase
npm run supabase:seed   # Seed base de données
npm run generate:sitemap # Génération sitemap
```

## Structure du projet

```
src/
├── App.tsx              # Routeur principal (utilise ROUTES constants)
├── main.tsx             # Point d'entrée
├── index.css            # Styles globaux + CSS variables
├── pages/               # 40 pages (suffixe Page)
│   ├── admin/           # 14 pages admin
│   ├── client/          # 6 pages client
│   └── technician/      # 4 pages technicien
├── components/          # Composants React
│   ├── ui/              # Atomiques (Button, Card, Input, ScrollReveal)
│   ├── catalog/         # Catalogue (CatalogHeroSearch, CategoryFilters, ProductResultsBar)
│   ├── product/         # Produit (ProductGallery, ProductInfoTabs, ProductReservationCard)
│   ├── checkout/        # Checkout (CheckoutStepper, CheckoutDeliveryStep, CheckoutSummaryStep)
│   ├── cart/            # Panier (CartItemCard, CartSummary, EmptyCart)
│   ├── hero/            # Hero section (HeroBackground, HeroCategories, HeroSearchBar)
│   ├── header/          # Header (DesktopNav, DesktopTopBar, MobileMenu)
│   ├── login/           # Login (LoginFormCard, DemoSection, FloatingParticles)
│   ├── contact/         # Contact (ContactForm, ContactMap, ContactSidebar)
│   ├── event/           # Événements (EventLightbox, EventSidebar)
│   ├── auth/            # Auth (AuthModal, RegisterSuccess)
│   ├── date-range-picker/ # Sélecteur de dates (CalendarGrid, DateSelectionSummary)
│   ├── price-calculator/  # Calculateur prix (DeliveryForm, PriceSummary)
│   ├── product-card/    # Carte produit (ProductCardActions, ProductCardImage)
│   ├── admin/           # Admin (AdminLayout, planning/, products/, reservationDetail/)
│   ├── client/          # Client (ClientLayout, addresses/, profile/)
│   └── technician/      # Technicien (TechnicianLayout, dashboard/, tasks/, taskDetail/)
├── contexts/            # State management (Auth, Cart, Favorites, Toast)
├── services/            # 23 services API Supabase (*.service.ts)
├── hooks/               # Hooks custom organisés par domaine
│   ├── admin/           # 8 hooks (useAdminProducts, useAdminPlanning, usePlanningDragDrop...)
│   ├── checkout/        # 4 hooks (useCheckoutForm, useCheckoutPricing, useCheckoutSubmit...)
│   ├── client/          # 2 hooks (useClientAddresses, useClientProfile)
│   ├── technician/      # 3 hooks (useTaskDetail, useTechnicianDashboard, useTechnicianTasks)
│   └── *.ts             # Hooks généraux (useCatalogFilters, useDebounce, useMediaQuery...)
├── types/               # Interfaces TypeScript
├── lib/                 # Config Supabase + auth-helpers
├── utils/               # Fonctions utilitaires (pricing, availability, validation)
└── constants/           # Constantes métier (routes.ts, time.ts)
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
| addresses | Adresses clients |
| favorites | Favoris produits |
| faqs | FAQ |
| testimonials | Témoignages |
| portfolio_events | Portfolio événements |
| event_types | Types d'événements |
| time_slots | Créneaux horaires |
| settings | Paramètres site |

### RLS

Implémenté via migrations Supabase (checkout, auth).

## Fichiers sensibles

| Fichier | Pourquoi |
|---------|----------|
| `src/lib/supabase.ts` | Config Supabase - ne pas casser |
| `src/lib/database.types.ts` | Types Supabase générés |
| `src/lib/auth-helpers.ts` | Helpers authentification |
| `src/contexts/AuthContext.tsx` | Auth globale - critique |
| `src/contexts/CartContext.tsx` | Panier - persistance localStorage |
| `src/contexts/FavoritesContext.tsx` | Favoris - sync Supabase |
| `src/App.tsx` | Routeur - toutes les routes (ROUTES constants) |
| `src/constants/routes.ts` | Routes centralisées |
| `.env` | Secrets - jamais commiter |
| `src/types/index.ts` | Types partagés partout |
| `src/services/delivery.service.ts` | Mapping types stricts |
| `src/services/checkout.service.ts` | Logique checkout - critique |
| `src/utils/pricingRules.ts` | Moteur de pricing |

## Les 4 interfaces

1. **Site Vitrine** (`/`) - Catalogue, panier, réservation, SEO, événements, contact, pages légales (16 pages)
2. **Admin** (`/admin`) - Dashboard KPIs, gestion produits/réservations/planning/zones/FAQ/témoignages/portfolio/créneaux (14 pages)
3. **Espace Client** (`/client`) - Dashboard, réservations, favoris, profil, adresses (6 pages)
4. **Interface Technicien** (`/technician`) - Dashboard, tâches, détail tâche, profil (4 pages)

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
| Frontend | Complet (~307 fichiers TS/TSX, 40 pages) |
| Services Supabase | 23 services, types stricts, barrel export |
| Hooks métier | 17+ hooks organisés par domaine (admin, checkout, client, technician) |
| Build optimisé | ~2.1 MB, code splitting, tree shaking, vendor splitting |
| Composants réutilisables | 16 dossiers composants (catalog/, product/, checkout/, hero/, header/...) |
| Routes centralisées | constants/routes.ts |
| Auth | Supabase Auth + RLS + ProtectedRoute |
| Checkout | Multi-step avec pricing engine, zones de livraison, créneaux |
| SEO | 90/100, BreadcrumbSchema, ProductSchema, sitemap |
| Connexion DB | Connectée (Supabase) |
| Tests | pricingRules.test.ts (à étendre) |

## Qualité du code

- Types stricts (pas de `any` dans les services critiques)
- Pas de `console.log` en production
- React.memo sur les composants de liste (ProductCard)
- Barrel exports pour imports propres (services, hooks, components)
- Code splitting par route (lazy loading)
- Composants refactorisés en sous-modules (<250 lignes par fichier)
- ErrorBoundary + SupabaseDiagnosticBanner pour le debug

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

## Services Supabase (23)

| Service | Domaine |
|---------|---------|
| products, categories | Catalogue |
| customers, addresses, favorites | Clients |
| reservations, reservationCreation, checkout | Réservations |
| delivery, deliveryZones, deliveryTasks, distance | Livraison |
| technicians | Techniciens |
| productAvailability | Disponibilités |
| stats | Dashboard KPIs |
| settings, timeSlots, eventTypes | Configuration |
| faqs, testimonials, portfolioEvents | Contenu |
| accessDifficulty, accessKeys | Accès |

## Documentation

Fichiers de doc à la racine :
- `QUICK_START.md` - Démarrage rapide
- `SUPABASE_MIGRATION_GUIDE.md` - Migration DB
