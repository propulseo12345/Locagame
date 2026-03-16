# 🔐 Guide d'Authentification - LOCAGAME

Système d'authentification complet avec 3 interfaces protégées par rôle.

---

## 🎯 Accès Rapide

**Page de connexion**: http://localhost:5173/login

---

## 👥 Comptes de Démonstration

### 🔧 Administrateur

**Accès complet à l'interface d'administration**

| Compte | Email | Mot de passe |
|--------|-------|--------------|
| **Sophie Martin** | `admin@locagame.net` | `admin123` |
| **Thomas Dubois** | `manager@locagame.net` | `manager123` |

**Fonctionnalités**:
- Dashboard avec statistiques
- Gestion des produits
- Gestion des réservations
- Planning des livraisons
- Gestion des clients
- Configuration des zones
- Paramètres

**URL**: `/admin/dashboard`

---

### 👤 Client

**Accès à l'espace client avec réservations**

| Compte | Email | Mot de passe | Type |
|--------|-------|--------------|------|
| **Marie Lefebvre** | `client@exemple.fr` | `client123` | Particulier |
| **Jean Dupont** | `jean.dupont@exemple.fr` | `client123` | Particulier |
| **Claire Bernard** | `pro@entreprise.fr` | `client123` | Professionnel |

**Fonctionnalités**:
- Dashboard personnel
- Historique des réservations
- Détails de commande
- Favoris
- Gestion du profil
- Adresses de livraison

**URL**: `/client/dashboard`

---

### 🚚 Technicien Livreur

**Accès à l'interface de livraison**

| Compte | Email | Mot de passe |
|--------|-------|--------------|
| **Lucas Moreau** | `technicien@locagame.net` | `tech123` |
| **Pierre Roux** | `pierre.tech@locagame.net` | `tech123` |

**Fonctionnalités**:
- Dashboard des tâches
- Liste des livraisons/retraits
- Détails des missions
- Informations d'accès
- Gestion du profil

**URL**: `/technician/dashboard`

---

## 🔒 Sécurité

### Routes Protégées

Toutes les routes sont protégées par rôle :

```typescript
/admin/*       → Réservé aux administrateurs
/client/*      → Réservé aux clients
/technician/*  → Réservé aux techniciens
```

Si vous tentez d'accéder à une interface sans le bon rôle, vous serez redirigé automatiquement vers votre interface.

### Session Persistante

- La session est sauvegardée dans `localStorage`
- Reste connecté même après rechargement
- Déconnexion manuelle via le menu utilisateur

---

## 🚀 Comment Tester

### 1. Connexion Simple

1. Aller sur http://localhost:5173/login
2. Cliquer sur un des boutons de démonstration :
   - **Administrateur** → Accès direct interface admin
   - **Client** → Accès direct espace client
   - **Technicien** → Accès direct interface technicien

### 2. Connexion Manuelle

1. Aller sur http://localhost:5173/login
2. Entrer l'email et le mot de passe
3. Cliquer sur "Se connecter"
4. Vous serez redirigé vers votre interface

### 3. Navigation

**Si connecté** :
- Voir votre avatar et nom dans le header
- Cliquer dessus pour ouvrir le menu
- Accéder à votre interface
- Se déconnecter

**Si non connecté** :
- Bouton "Connexion" visible dans le header
- Accès au site vitrine public

---

## 🎨 Interface Utilisateur

### Header Dynamique

Le header s'adapte selon votre état de connexion :

**Non connecté** :
```
[Logo] [Nav] [Recherche] [Connexion] [Panier]
```

**Connecté** :
```
[Logo] [Nav] [Recherche] [Avatar + Nom ▼] [Panier]
```

### Menu Utilisateur

Cliquer sur l'avatar affiche :
- **Nom complet**
- **Email**
- **Badge de rôle** (Admin/Client/Technicien)
- **Lien vers interface** (selon rôle)
- **Bouton déconnexion** (rouge)

---

## 🔄 Flux d'Authentification

### Connexion

```mermaid
User → /login
  ├─ Saisie email/password
  ├─ Validation credentials
  ├─ Création session (localStorage)
  └─ Redirection selon rôle:
      ├─ admin → /admin/dashboard
      ├─ client → /client/dashboard
      └─ technician → /technician/dashboard
```

### Protection des Routes

```mermaid
User → Route protégée
  ├─ Vérification session
  │   ├─ Non connecté → Redirect /login
  │   └─ Connecté →
  │       ├─ Bon rôle → ✅ Accès
  │       └─ Mauvais rôle → Redirect interface appropriée
```

### Déconnexion

```mermaid
User → Clic "Déconnexion"
  ├─ Suppression session (localStorage)
  ├─ Reset state user
  └─ Redirect → /
```

---

## 💡 Conseils de Test

### Pour tester les protections

1. **Se connecter en tant que client**
2. **Tenter d'accéder** à `/admin/dashboard` dans l'URL
3. **Résultat** : Redirection automatique vers `/client/dashboard`

### Pour tester la persistence

1. **Se connecter** avec un compte
2. **Recharger la page** (F5)
3. **Résultat** : Toujours connecté

### Pour tester la déconnexion

1. **Se connecter** avec un compte
2. **Cliquer sur avatar** → Déconnexion
3. **Résultat** : Retour à l'accueil, bouton "Connexion" visible

---

## 🛠 Technique

### Structure des Données

```typescript
interface FakeUser {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'client' | 'technician';
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  companyName?: string;
}
```

### Fichiers Créés

```
src/
├── lib/fake-data/
│   └── users.ts                    # 7 utilisateurs de test
├── contexts/
│   └── AuthContext.tsx             # Gestion auth globale
├── components/
│   ├── ProtectedRoute.tsx          # HOC protection routes
│   └── Header.tsx                  # Header avec auth
└── pages/
    └── LoginPage.tsx               # Page de connexion
```

### Context API

```typescript
const { user, isAuthenticated, signIn, signOut, hasRole } = useAuth();

// Vérifier si connecté
if (isAuthenticated) { ... }

// Vérifier le rôle
if (hasRole('admin')) { ... }

// Se connecter
await signIn('admin@locagame.net', 'admin123');

// Se déconnecter
signOut();
```

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| **Utilisateurs de test** | 7 |
| **Rôles** | 3 |
| **Routes protégées** | 20+ |
| **Session** | localStorage |
| **Temps connexion** | ~500ms |

---

## 🐛 Troubleshooting

### "Email ou mot de passe incorrect"
→ Vérifiez l'email et le mot de passe dans la section "Comptes de Démonstration"

### Redirection en boucle
→ Videz le `localStorage` dans DevTools (F12) → Application → Local Storage

### Menu utilisateur ne s'ouvre pas
→ Rechargez la page, le state peut être corrompu

### Avatar ne s'affiche pas
→ Normal, ce sont des emojis. Vérifiez dans le code source.

---

## 🔜 Migration Supabase ✅ TERMINÉE

### ✅ Migration complète vers Supabase Auth

La migration vers Supabase Auth est **complète** ! L'application utilise maintenant :
- ✅ `supabase.auth.signInWithPassword()` pour la connexion
- ✅ `supabase.auth.signOut()` pour la déconnexion
- ✅ Sessions persistantes avec refresh automatique
- ✅ Rôles déterminés depuis les tables Supabase (`admin_users`, `technicians`, `customers`)
- ✅ Politiques RLS activées pour la séparation des données

### 📝 Créer les utilisateurs de démonstration

Pour tester les 3 interfaces, créer les utilisateurs dans Supabase :

**1. Via Supabase Dashboard** :
- Aller dans **Authentication > Users > Add User**
- Créer les 3 utilisateurs avec ces credentials :

| Rôle | Email | Password | Auto Confirm |
|------|-------|----------|--------------|
| **Admin** | `admin@locagame.net` | `admin123` | ✅ |
| **Client** | `client@exemple.fr` | `client123` | ✅ |
| **Technicien** | `technicien@locagame.net` | `tech123` | ✅ |

**2. Créer les profils** :
- Exécuter le script SQL : `supabase/create_demo_users.sql`
- Ce script crée automatiquement les profils dans les tables correspondantes

**Fichier** : `supabase/create_demo_users.sql`

---

## ✅ Checklist de Test

- [ ] Connexion Admin fonctionne
- [ ] Connexion Client fonctionne
- [ ] Connexion Technicien fonctionne
- [ ] Routes protégées fonctionnent
- [ ] Redirection selon rôle fonctionne
- [ ] Session persiste après F5
- [ ] Déconnexion fonctionne
- [ ] Header affiche avatar
- [ ] Menu utilisateur fonctionne
- [ ] Boutons démo fonctionnent

---

**Système d'authentification prêt à l'emploi ! 🎉**

Pour toute question, consultez le code dans `src/lib/fake-data/users.ts` et `src/contexts/AuthContext.tsx`.
