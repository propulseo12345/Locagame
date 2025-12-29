# 🔐 Architecture de Sécurité - LOCAGAME

## 🎯 Principe Fondamental

**Un seul admin gère tout, chaque utilisateur voit uniquement ses propres données.**

---

## 👥 Rôles et Permissions

### 🔧 ADMIN (Un seul compte)
**Accès complet à toutes les données et fonctionnalités :**

✅ **Gestion des clients**
- Voir tous les clients (`customers`)
- Modifier les profils clients
- Voir toutes les adresses (`addresses`)
- Voir tous les favoris (`customer_favorites`)

✅ **Gestion des réservations**
- Voir toutes les réservations (`reservations`)
- Modifier les réservations
- Voir tous les items de réservation (`reservation_items`)

✅ **Assignation des livraisons**
- Voir toutes les tâches de livraison (`delivery_tasks`)
- Assigner un technicien à une tâche
- Assigner un véhicule à une tâche
- Modifier le statut des tâches

✅ **Gestion des techniciens**
- Voir tous les techniciens (`technicians`)
- Créer/modifier/supprimer des techniciens
- Assigner des véhicules aux techniciens

✅ **Gestion du catalogue**
- Produits (`products`)
- Catégories (`categories`)
- Zones de livraison (`delivery_zones`)
- Disponibilités (`product_availability`)

✅ **Gestion des véhicules**
- Voir tous les véhicules (`vehicles`)
- Créer/modifier/supprimer des véhicules

---

### 👤 CLIENT
**Accès uniquement à ses propres données :**

✅ **Profil personnel**
- Voir son propre profil (`customers` WHERE `id = auth.uid()`)
- Modifier son propre profil
- Voir ses propres adresses (`addresses` WHERE `customer_id = auth.uid()`)
- Gérer ses propres adresses

✅ **Réservations**
- Voir uniquement ses propres réservations (`reservations` WHERE `customer_id = auth.uid()`)
- Créer de nouvelles réservations
- Voir uniquement ses propres items de réservation

✅ **Favoris**
- Voir uniquement ses propres favoris (`customer_favorites` WHERE `customer_id = auth.uid()`)
- Ajouter/retirer des favoris

❌ **Interdictions**
- Ne peut PAS voir les autres clients
- Ne peut PAS voir les réservations des autres
- Ne peut PAS voir les tâches de livraison
- Ne peut PAS modifier les produits/catégories/zones

---

### 🚚 TECHNICIEN
**Accès uniquement à ses propres tâches :**

✅ **Tâches de livraison**
- Voir uniquement ses propres tâches (`delivery_tasks` WHERE `technician_id = [son id]`)
- Mettre à jour le statut de ses tâches (scheduled → in_progress → completed)

✅ **Profil personnel**
- Voir son propre profil (`technicians` WHERE `user_id = auth.uid()`)

❌ **Interdictions**
- Ne peut PAS voir les tâches des autres techniciens
- Ne peut PAS voir les clients
- Ne peut PAS voir les réservations
- Ne peut PAS assigner des tâches

---

## 🔒 Row Level Security (RLS) Policies

### Tables avec isolation complète

| Table | Client | Technicien | Admin |
|-------|--------|------------|-------|
| `customers` | ✅ Ses propres données | ❌ | ✅ Tous |
| `addresses` | ✅ Ses propres adresses | ❌ | ✅ Toutes |
| `reservations` | ✅ Ses propres réservations | ❌ | ✅ Toutes |
| `reservation_items` | ✅ Ses propres items | ❌ | ✅ Tous |
| `customer_favorites` | ✅ Ses propres favoris | ❌ | ✅ Tous (lecture) |
| `delivery_tasks` | ❌ | ✅ Ses propres tâches | ✅ Toutes |
| `technicians` | ❌ | ✅ Son propre profil | ✅ Tous |
| `vehicles` | ❌ | ✅ Lecture seule | ✅ Tous |
| `products` | ✅ Lecture (actifs) | ✅ Lecture (actifs) | ✅ Tous |
| `categories` | ✅ Lecture | ✅ Lecture | ✅ Tous |
| `delivery_zones` | ✅ Lecture (actives) | ✅ Lecture (actives) | ✅ Toutes |

---

## 📋 Exemples Concrets

### Scénario 1 : Client A et Client B
```
Client A se connecte
  → Voit uniquement ses réservations
  → Ne voit PAS les réservations de Client B
  → Ne voit PAS les données de Client B

Client B se connecte
  → Voit uniquement ses réservations
  → Ne voit PAS les réservations de Client A
  → Ne voit PAS les données de Client A
```

### Scénario 2 : Admin assigne une livraison
```
Admin se connecte
  → Voit TOUTES les tâches de livraison
  → Voit TOUS les techniciens
  → Assigne la tâche #123 au Technicien X

Technicien X se connecte
  → Voit uniquement la tâche #123 (qui lui est assignée)
  → Ne voit PAS les autres tâches
  → Met à jour le statut : "in_progress" → "completed"
```

### Scénario 3 : Technicien Y
```
Technicien Y se connecte
  → Voit uniquement SES propres tâches
  → Ne voit PAS la tâche #123 (assignée à Technicien X)
  → Ne voit PAS les clients
  → Ne voit PAS les réservations
```

---

## 🛡️ Sécurité Implémentée

### ✅ Policies RLS Actives

Toutes les tables ont des policies RLS qui garantissent :

1. **Isolation des clients** : `customer_id = auth.uid()`
2. **Isolation des techniciens** : `technician_id IN (SELECT id FROM technicians WHERE user_id = auth.uid())`
3. **Accès admin complet** : `EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)`

### ✅ Vérification dans le Code

- `ProtectedRoute` vérifie le rôle avant d'afficher les pages
- `AuthContext` charge le rôle depuis Supabase
- Les services utilisent les policies RLS automatiquement

---

## 📝 Fichiers SQL

**Fichier principal** : `supabase/EXECUTE_THIS_SQL.sql`

Contient toutes les policies RLS pour :
- ✅ Isolation complète des clients
- ✅ Isolation complète des techniciens
- ✅ Accès admin complet à toutes les données

---

## ✅ Checklist de Vérification

- [x] Clients ne voient que leurs propres données
- [x] Techniciens ne voient que leurs propres tâches
- [x] Admin voit toutes les données
- [x] Admin peut assigner des livraisons
- [x] Admin peut gérer tous les clients
- [x] Admin peut gérer toutes les réservations
- [x] Policies RLS activées sur toutes les tables
- [x] Routes protégées par rôle

---

**Architecture de sécurité prête ! 🔒**

