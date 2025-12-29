# ⚡ Quick Start - LOCAGAME

Guide de démarrage rapide pour développeurs.

---

## 🚀 Installation Express (5 minutes)

```bash
# 1. Cloner le projet
cd LocaGame-1

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials Supabase

# 4. Lancer le dev server
npm run dev

# 5. Ouvrir http://localhost:5173
```

---

## 📁 Structure Simplifiée

```
src/
├── pages/              # Pages de l'app
│   ├── admin/         # Interface admin (🔧)
│   ├── client/        # Espace client (👤)
│   └── technician/    # Interface technicien (🚚)
├── components/        # Composants React
│   └── ui/           # Composants réutilisables
├── contexts/         # State management (Auth, Cart)
├── services/         # API Supabase
└── utils/            # Helpers
```

---

## 🎯 Accès Rapide aux Interfaces

### Site Vitrine
- **Home**: http://localhost:5173/
- **Catalogue**: http://localhost:5173/catalogue
- **Panier**: http://localhost:5173/panier

### Interface Admin (DEV uniquement)
- **Dashboard**: http://localhost:5173/admin/dashboard
- **Produits**: http://localhost:5173/admin/products
- **Réservations**: http://localhost:5173/admin/reservations

### Espace Client
- **Dashboard**: http://localhost:5173/client/dashboard
- **Réservations**: http://localhost:5173/client/reservations

### Interface Technicien
- **Dashboard**: http://localhost:5173/technician/dashboard
- **Tâches**: http://localhost:5173/technician/tasks

---

## 🛠 Commandes Utiles

```bash
# Dev
npm run dev              # Lancer le serveur de dev

# Build
npm run build           # Build de production
npm run preview         # Preview du build

# Quality
npm run lint            # Linter ESLint
npm run typecheck       # Vérifier TypeScript
```

---

## 🔑 Variables d'Environnement

Dans `.env`:
```env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

---

## 📦 Composants UI Disponibles

```tsx
import { Button, Input, Card } from '@/components/ui';

// Button
<Button variant="primary" size="md" isLoading>
  Cliquez-moi
</Button>

// Input
<Input
  label="Email"
  type="email"
  error={errors.email}
  required
/>

// Card
<Card variant="glass" hover>
  <CardHeader title="Titre" />
  <CardBody>Contenu</CardBody>
</Card>
```

---

## 🎨 Couleurs du Thème

```css
--primary: #33ffcc      /* Turquoise */
--secondary: #66cccc    /* Cyan */
--dark: #000033         /* Bleu nuit */
--accent: #fe1979       /* Rose */
```

---

## 📖 Documentation Complète

- **README.md** - Documentation générale
- **AUDIT_RAPPORT.md** - Rapport d'audit complet
- **SUPABASE_MIGRATION_GUIDE.md** - Guide migration Supabase

---

## 🆘 Besoin d'Aide ?

1. Consultez `README.md` pour la doc complète
2. Vérifiez `SUPABASE_MIGRATION_GUIDE.md` pour Supabase
3. Lisez `AUDIT_RAPPORT.md` pour comprendre l'architecture

---

**Happy Coding! 🎉**
