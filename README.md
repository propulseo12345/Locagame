# LOCAGAME - Plateforme de Location de Jeux et Animations

Plateforme complète de location de jeux et animations pour événements avec gestion administrative, espace client et interface technicien.

## 🚀 Fonctionnalités

### Site Vitrine
- Catalogue de produits avec filtres avancés
- Calculateur de prix en temps réel
- Système de panier avec persistance
- Gestion des zones de livraison
- Pages événements et contact
- SEO optimisé

### Interface Admin
- Dashboard avec statistiques
- Gestion des produits et stock
- Gestion des réservations
- Planning de livraisons
- Gestion des clients
- Configuration des zones de livraison

### Espace Client
- Dashboard personnalisé
- Historique des réservations
- Gestion des adresses
- Favoris
- Profil utilisateur

### Interface Technicien
- Liste des tâches de livraison/retrait
- Détails des missions
- Informations d'accès
- Gestion du profil

## 🛠 Technologies

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL)
- **Build**: Vite
- **Auth**: Supabase Auth

## 📁 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI réutilisables (Button, Input, Card)
│   ├── admin/          # Composants admin
│   ├── client/         # Composants client
│   └── technician/     # Composants technicien
├── pages/              # Pages de l'application
│   ├── admin/          # Pages admin
│   ├── client/         # Pages client
│   └── technician/     # Pages technicien
├── contexts/           # Contexts React (Auth, Cart)
├── services/           # Services API Supabase
├── lib/                # Configuration (Supabase, types)
├── utils/              # Utilitaires (pricing, validation, etc.)
├── types/              # Définitions TypeScript
└── data/               # Données mockées pour dev
```

## 🚦 Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase

### Installation

1. Cloner le repository
```bash
git clone <repository-url>
cd LocaGame-1
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```

Puis éditer `.env` avec vos credentials Supabase :
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Lancer le serveur de développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🗄️ Configuration Supabase

### Tables principales

1. **products** - Catalogue de produits
2. **categories** - Catégories de produits
3. **orders** - Réservations/Commandes
4. **customers** - Clients
5. **delivery_zones** - Zones de livraison
6. **delivery_tasks** - Tâches de livraison
7. **vehicles** - Véhicules de livraison
8. **technicians** - Techniciens livreurs

Voir `src/lib/database.types.ts` pour les schémas détaillés.

## 🏗️ Build pour Production

```bash
npm run build
```

Le build sera généré dans le dossier `dist/`

### Optimisations incluses
- Code splitting automatique
- Lazy loading des routes
- Tree shaking
- Minification avec Terser
- Suppression des console.log
- Vendor chunks séparés pour meilleur caching

## 📦 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Preview du build de production
- `npm run lint` - Linting ESLint
- `npm run typecheck` - Vérification TypeScript

## 🎨 Composants UI Réutilisables

Le projet inclut une bibliothèque de composants UI :

```tsx
import { Button, Input, Card } from '@/components/ui';

// Button
<Button variant="primary" size="md">
  Ajouter au panier
</Button>

// Input avec validation
<Input
  label="Email"
  type="email"
  error={errors.email}
  required
/>

// Card
<Card variant="glass" padding="lg" hover>
  <CardHeader title="Titre" subtitle="Sous-titre" />
  <CardBody>Contenu</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>
```

## 🔐 Authentification

Le projet utilise Supabase Auth avec des contexts React :

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  // ...
}
```

## 🛒 Gestion du Panier

```tsx
import { useCart } from '@/contexts/CartContext';

function MyComponent() {
  const { items, addItem, removeItem, totalPrice } = useCart();
  // ...
}
```

## ✅ Validation de Formulaires

Système de validation complet avec règles prédéfinies :

```tsx
import { validateFields, required, email, phone } from '@/utils/validation';

const errors = validateFields({
  email: {
    value: formData.email,
    rules: [required(), email()]
  },
  phone: {
    value: formData.phone,
    rules: [required(), phone()]
  }
});
```

## 🌐 SEO

Le projet inclut :
- Meta tags optimisés (Open Graph, Twitter Cards)
- Structured Data (Schema.org)
- Sitemap.xml
- Robots.txt
- Images optimisées avec lazy loading
- Attributs alt sur toutes les images

## 📱 Responsive Design

- Mobile first
- Breakpoints Tailwind CSS
- Navigation mobile optimisée
- Images adaptatives

## 🚀 Déploiement

Le projet est prêt pour être déployé sur :
- Vercel
- Netlify
- AWS Amplify
- Firebase Hosting

### Variables d'environnement à configurer
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📄 Licence

Propriétaire - Tous droits réservés

## 👥 Support

Pour toute question ou problème, contactez l'équipe de développement.
