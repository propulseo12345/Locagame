# Plan de Réorganisation - LOCAGAME

**Date :** 29 décembre 2025
**Basé sur :** AUDIT_REPORT.md

---

## Priorité 1 - Critique (à faire immédiatement)

### 1.1 Supprimer les fichiers orphelins

- [ ] **Supprimer `src/data/mockData.ts`**
  - Raison : Jamais utilisé, duplique lib/fake-data/products.ts
  - Impact : Aucun (fichier non importé)

- [ ] **Supprimer `src/components/Header.tsx.backup`**
  - Raison : Fichier backup en production
  - Impact : Aucun

- [ ] **Supprimer `src/pages/ProductPageNew.tsx`**
  - Raison : Doublon de ProductPage.tsx, non utilisé dans le routeur
  - Impact : Aucun (non routé)

### 1.2 Nettoyer les console.log de production

- [ ] **Nettoyer `src/lib/auth-helpers.ts`** (13 occurrences)
  - Fichier critique pour l'authentification
  - Supprimer tous les console.log de debug

- [ ] **Nettoyer `src/pages/CatalogPage.tsx`** (5 occurrences)
  - Supprimer les logs de chargement produits

- [ ] **Nettoyer `src/pages/admin/AdminPlanning.tsx`** (4 occurrences)
  - Supprimer les logs d'assignation

- [ ] **Nettoyer `src/services/reservations.service.ts`** (5 occurrences)
  - Supprimer ou remplacer par un logger configurable

### 1.3 Corriger les types `any` critiques

- [ ] **Typer `src/services/delivery.service.ts`** (lignes 60, 241)
  ```typescript
  // Avant
  return (data || []).map((task: any): DeliveryTask => ({
  // Après
  return (data || []).map((task: Database['public']['Tables']['delivery_tasks']['Row']): DeliveryTask => ({
  ```

- [ ] **Typer `src/services/products.service.ts`** (ligne 119)
  ```typescript
  // Avant
  static async getProductsWithStock(): Promise<any[]>
  // Après
  static async getProductsWithStock(): Promise<ProductWithStock[]>
  ```

---

## Priorité 2 - Important (cette semaine)

### 2.1 Utiliser ou supprimer routes.ts

- [ ] **Option A : Utiliser les constantes de routes**
  - Refactorer App.tsx pour utiliser ROUTES
  - Refactorer les composants Link pour utiliser ROUTES

  ```typescript
  // Avant
  <Route path="/catalogue" element={<CatalogPage />} />

  // Après
  import { ROUTES } from './constants/routes';
  <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
  ```

- [ ] **Option B : Supprimer si non nécessaire**
  - Supprimer `src/constants/routes.ts`

### 2.2 Compléter les barrel exports UI

- [ ] **Mettre à jour `src/components/ui/index.ts`**
  ```typescript
  export { Button } from './Button';
  export { Input } from './Input';
  export { Card, CardHeader, CardBody, CardFooter } from './Card';
  // Ajouter
  export { ScrollReveal, StaggerContainer, StaggerItem, Parallax, animationVariants } from './ScrollReveal';
  export type { AnimationType } from './ScrollReveal';
  ```

- [ ] **Mettre à jour les imports dans les composants**
  - `src/components/FeaturedProducts.tsx`
  - `src/components/HowItWorks.tsx`
  - `src/components/Testimonials.tsx`
  - `src/components/About.tsx`

### 2.3 Découper les pages volumineuses

#### AdminPlanning.tsx (959 lignes)

- [ ] Créer `src/components/admin/planning/`
  - `PlanningCalendarView.tsx` - Vue calendrier mensuel
  - `PlanningDayView.tsx` - Vue journalière
  - `VehicleModal.tsx` - Modal ajout/édition véhicule
  - `TaskCard.tsx` - Carte de tâche drag & drop
  - `UnassignedReservations.tsx` - Liste des réservations non assignées

#### CheckoutPage.tsx (849 lignes)

- [ ] Créer `src/components/checkout/`
  - `CheckoutSteps.tsx` - Indicateur d'étapes
  - `CustomerInfoForm.tsx` - Formulaire client
  - `DeliveryOptionsForm.tsx` - Options de livraison
  - `PaymentForm.tsx` - Formulaire de paiement
  - `OrderSummary.tsx` - Récapitulatif commande

#### ProductPage.tsx (735 lignes)

- [ ] Créer `src/components/product/`
  - `ProductGallery.tsx` - Galerie d'images
  - `ProductInfo.tsx` - Informations produit
  - `ProductSpecs.tsx` - Spécifications techniques
  - `ProductPricing.tsx` - Affichage prix
  - `AddToCartSection.tsx` - Section ajout panier

#### CatalogPage.tsx (703 lignes)

- [ ] Créer `src/components/catalog/`
  - `CatalogFilters.tsx` - Filtres latéraux
  - `CatalogGrid.tsx` - Grille de produits
  - `CatalogPagination.tsx` - Pagination
  - `ActiveFilters.tsx` - Tags filtres actifs

---

## Priorité 3 - Nice to have (plus tard)

### 3.1 Créer des hooks métier

- [ ] **Créer `src/hooks/modules/useProducts.ts`**
  ```typescript
  export function useProducts(filters?: FilterOptions) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    // ... logique
    return { products, loading, error, refetch };
  }
  ```

- [ ] **Créer `src/hooks/modules/useReservations.ts`**
- [ ] **Créer `src/hooks/modules/useDeliveryTasks.ts`**

### 3.2 Ajouter la mémoisation

- [ ] **Auditer et ajouter `useCallback`** dans :
  - AdminPlanning.tsx
  - CatalogPage.tsx
  - ProductPage.tsx

- [ ] **Ajouter `React.memo`** pour les composants purs :
  - ProductCard
  - TaskCard
  - FilterTag

### 3.3 Standardiser l'ordre des imports

- [ ] **Créer `.eslintrc.js` avec règle import/order**
  ```javascript
  'import/order': [
    'error',
    {
      groups: [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index',
        'type'
      ],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' }
    }
  ]
  ```

### 3.4 Renommer le package

- [ ] **Mettre à jour `package.json`**
  ```json
  {
    "name": "locagame",
    "version": "1.0.0",
    ...
  }
  ```

### 3.5 Ajouter des tests

- [ ] **Installer les dépendances de test**
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```

- [ ] **Créer `src/__tests__/`**
  - `services/products.service.test.ts`
  - `hooks/useDebounce.test.ts`
  - `utils/pricing.test.ts`

---

## Nouvelle Structure Proposée

### Structure Cible

```
src/
├── app/                          # Configuration application
│   ├── App.tsx                   # Routeur principal
│   ├── main.tsx                  # Point d'entrée
│   └── providers/                # Context providers
│       ├── AuthProvider.tsx
│       ├── CartProvider.tsx
│       └── ToastProvider.tsx
│
├── components/
│   ├── common/                   # Composants partagés (tous)
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── ErrorBoundary/
│   │   └── ProtectedRoute/
│   │
│   ├── ui/                       # Composants atomiques
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── ScrollReveal/
│   │   └── index.ts              # Barrel export
│   │
│   ├── catalog/                  # Composants catalogue
│   │   ├── CatalogFilters/
│   │   ├── CatalogGrid/
│   │   └── ProductCard/
│   │
│   ├── checkout/                 # Composants checkout
│   │   ├── CheckoutSteps/
│   │   ├── CustomerInfoForm/
│   │   ├── DeliveryForm/
│   │   └── OrderSummary/
│   │
│   ├── product/                  # Composants page produit
│   │   ├── ProductGallery/
│   │   ├── ProductInfo/
│   │   └── PriceCalculator/
│   │
│   └── layouts/                  # Layouts par interface
│       ├── AdminLayout/
│       ├── ClientLayout/
│       └── TechnicianLayout/
│
├── pages/                        # Pages (routées)
│   ├── public/                   # Pages publiques
│   │   ├── HomePage/
│   │   ├── CatalogPage/
│   │   ├── ProductPage/
│   │   ├── CartPage/
│   │   └── CheckoutPage/
│   │
│   ├── admin/                    # Pages admin
│   │   ├── DashboardPage/
│   │   ├── ProductsPage/
│   │   └── PlanningPage/
│   │
│   ├── client/                   # Pages client
│   │   ├── DashboardPage/
│   │   └── ReservationsPage/
│   │
│   └── technician/               # Pages technicien
│       ├── DashboardPage/
│       └── TasksPage/
│
├── hooks/                        # Hooks custom
│   ├── common/                   # Hooks génériques
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMediaQuery.ts
│   │
│   └── modules/                  # Hooks métier
│       ├── useProducts.ts
│       ├── useReservations.ts
│       └── useDeliveryTasks.ts
│
├── services/                     # Services API (inchangé)
│   ├── products.service.ts
│   ├── reservations.service.ts
│   └── index.ts
│
├── lib/                          # Configuration et helpers
│   ├── supabase.ts
│   ├── auth-helpers.ts
│   └── database.types.ts
│
├── data/                         # Données mock (dev only)
│   └── fake/
│       ├── products.ts
│       ├── reservations.ts
│       └── index.ts
│
├── types/                        # Types TypeScript
│   ├── models/                   # Modèles de données
│   │   ├── product.ts
│   │   ├── reservation.ts
│   │   └── user.ts
│   ├── api/                      # Types API
│   └── index.ts
│
├── utils/                        # Fonctions utilitaires (inchangé)
│   ├── pricing.ts
│   ├── availability.ts
│   └── validation.ts
│
├── constants/                    # Constantes
│   ├── routes.ts
│   └── ui.ts
│
└── styles/
    └── index.css
```

---

## Mapping Ancien → Nouveau

| Ancien | Nouveau | Action |
|--------|---------|--------|
| `src/App.tsx` | `src/app/App.tsx` | Déplacer |
| `src/main.tsx` | `src/app/main.tsx` | Déplacer |
| `src/contexts/AuthContext.tsx` | `src/app/providers/AuthProvider.tsx` | Déplacer + renommer |
| `src/contexts/CartContext.tsx` | `src/app/providers/CartProvider.tsx` | Déplacer + renommer |
| `src/components/Header.tsx` | `src/components/common/Header/Header.tsx` | Déplacer |
| `src/components/Header.tsx.backup` | ❌ | Supprimer |
| `src/components/admin/AdminLayout.tsx` | `src/components/layouts/AdminLayout/AdminLayout.tsx` | Déplacer |
| `src/data/mockData.ts` | ❌ | Supprimer |
| `src/lib/fake-data/` | `src/data/fake/` | Déplacer |
| `src/pages/ProductPageNew.tsx` | ❌ | Supprimer |

---

## Script de Migration

```bash
#!/bin/bash
# migration.sh - Script de migration de structure

# Phase 1: Suppression des fichiers orphelins
rm src/data/mockData.ts
rm src/components/Header.tsx.backup
rm src/pages/ProductPageNew.tsx

# Phase 2: Création des nouveaux dossiers
mkdir -p src/app/providers
mkdir -p src/components/common
mkdir -p src/components/catalog
mkdir -p src/components/checkout
mkdir -p src/components/product
mkdir -p src/components/layouts
mkdir -p src/pages/public
mkdir -p src/hooks/common
mkdir -p src/hooks/modules
mkdir -p src/data/fake
mkdir -p src/types/models
mkdir -p src/styles

# Phase 3: Déplacements (à exécuter avec précaution)
# Note: Utiliser git mv pour préserver l'historique

# Phase 4: Mise à jour des imports
# Note: Utiliser un script ou IDE pour refactorer automatiquement
```

---

## Checklist de Validation

Après chaque phase de migration :

- [ ] Le build passe (`npm run build`)
- [ ] Pas d'erreurs TypeScript (`npm run typecheck`)
- [ ] L'application démarre (`npm run dev`)
- [ ] Les fonctionnalités critiques fonctionnent :
  - [ ] Page d'accueil
  - [ ] Catalogue + filtres
  - [ ] Page produit
  - [ ] Panier
  - [ ] Checkout
  - [ ] Login
  - [ ] Dashboard admin
  - [ ] Dashboard client
  - [ ] Dashboard technicien

---

## Planning Suggéré

| Phase | Tâches | Durée estimée |
|-------|--------|---------------|
| 1 | Suppression fichiers orphelins + console.log | 1h |
| 2 | Complétion barrel exports + routes.ts | 1h |
| 3 | Découpage AdminPlanning | 3h |
| 4 | Découpage CheckoutPage | 3h |
| 5 | Découpage ProductPage | 2h |
| 6 | Découpage CatalogPage | 2h |
| 7 | Migration structure (si validée) | 4h |
| 8 | Tests + documentation | 2h |

**Total estimé : 18h de travail**

---

*Plan de réorganisation créé le 29/12/2025*
