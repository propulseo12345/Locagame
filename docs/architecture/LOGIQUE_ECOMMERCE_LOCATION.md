# 🛒 Logique E-Commerce Complète - Site de Location

**Date** : 12 novembre 2025
**Type** : E-commerce de **LOCATION** (pas de vente)
**Secteur** : Location de jeux et matériel événementiel

---

## 🎯 Particularités d'un E-Commerce de Location

### ❌ Ce qui est DIFFÉRENT de la vente classique

| E-Commerce Vente | E-Commerce Location (LocaGame) |
|------------------|--------------------------------|
| Stock permanent | **Stock temporaire** (dates) |
| 1 produit = 1 vente | **1 produit = plusieurs locations** |
| Pas de retour obligatoire | **Retour obligatoire** |
| Livraison unique | **Livraison + Retrait** |
| Pas de calendrier | **Calendrier de disponibilité** |
| Stock = quantité | **Stock = quantité × dates** |

---

## 📊 ÉTAT ACTUEL : Ce Qui Existe Déjà

### ✅ Fonctionnalités Implémentées

#### 1. Gestion des Produits
- ✅ Catalogue avec catégories
- ✅ Fiches produits détaillées
- ✅ Images, descriptions, specs
- ✅ Tarifs par durée (1 jour, weekend, semaine)
- ✅ Stock total par produit

#### 2. Panier (CartContext)
- ✅ Ajout/retrait produits
- ✅ Modification quantités
- ✅ Sauvegarde localStorage
- ✅ Calcul total

#### 3. Réservations (Supabase)
- ✅ Création réservation complète
- ✅ Items de réservation
- ✅ Tâches de livraison automatiques
- ✅ Validation stocks automatique

#### 4. Gestion des Stocks
- ✅ Calcul stock disponible en temps réel
- ✅ Validation avant réservation (trigger)
- ✅ Restauration automatique (annulation)
- ✅ Protection sur-réservation

#### 5. Livraison/Retrait
- ✅ Zones de livraison (PACA)
- ✅ Calcul frais de livraison
- ✅ Choix pickup/delivery
- ✅ Tâches techniciens automatiques

---

## ⚠️ CE QUI MANQUE : Fonctionnalités E-Commerce Critiques

### 🔴 CRITIQUE (Bloquant)

#### 1. **Calendrier de Disponibilité par Produit**
**Problème actuel** :
- Le panier utilise des dates hardcodées (`start_date`, `end_date`)
- Pas d'interface pour sélectionner les dates
- Impossible de voir si un produit est disponible pour des dates spécifiques

**Ce qu'il faut** :
```typescript
// Sur la page produit
<DateRangePicker
  productId={product.id}
  onSelect={(startDate, endDate) => {
    // Vérifier disponibilité
    const isAvailable = await ProductsService.checkAvailability(
      productId, startDate, endDate, quantity
    );
    if (isAvailable) {
      addToCart({ product, startDate, endDate, quantity });
    }
  }}
/>
```

**Impact** : Sans ça, **impossible de louer réellement** !

---

#### 2. **Calcul de Prix Dynamique Selon Durée**
**Problème actuel** :
- Prix hardcodés dans le panier
- Pas de calcul automatique selon durée

**Ce qu'il faut** :
```typescript
function calculateRentalPrice(
  product: Product,
  startDate: Date,
  endDate: Date,
  quantity: number
): number {
  const durationDays = calculateDays(startDate, endDate);

  if (durationDays === 1) {
    return product.pricing.oneDay * quantity;
  } else if (durationDays <= 3) {
    return product.pricing.weekend * quantity;
  } else if (durationDays <= 7) {
    return product.pricing.week * quantity;
  } else {
    // Durées custom
    return calculateCustomDuration(product, durationDays) * quantity;
  }
}
```

**Impact** : Tarifs incorrects = **perte d'argent** !

---

#### 3. **Connexion CartContext ↔ Supabase**
**Problème actuel** :
- CartContext utilise localStorage uniquement
- CheckoutPage ne crée PAS de réservation Supabase
- Données mockées partout

**Ce qu'il faut** :
```typescript
// Dans CheckoutPage.tsx
const handleSubmit = async () => {
  const cartItems = useCart().items;

  // Créer la réservation dans Supabase
  const reservation = await ReservationsService.createReservation({
    customer_id: currentUser.id,
    items: cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      duration_days: calculateDays(item.start_date, item.end_date),
      unit_price: item.product.pricing.oneDay,
      subtotal: item.total_price
    })),
    start_date: earliest(cartItems.map(i => i.start_date)),
    end_date: latest(cartItems.map(i => i.end_date)),
    delivery_type: deliveryType,
    delivery_address_id: selectedAddress.id,
    ...
  });

  // Vider le panier
  clearCart();

  // Rediriger vers confirmation
  navigate(`/confirmation/${reservation.id}`);
};
```

**Impact** : Aucune commande n'est réellement créée !

---

#### 4. **Paiement en Ligne (Stripe)**
**Problème actuel** :
- Page "payment" existe mais ne fait rien
- Simulation de paiement uniquement

**Ce qu'il faut** :
```typescript
// Intégration Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY);

// Créer un PaymentIntent côté serveur
const { clientSecret } = await fetch('/api/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({ amount: total * 100 }) // en centimes
});

// Confirmer le paiement
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  { payment_method: { card: cardElement } }
);

if (!error && paymentIntent.status === 'succeeded') {
  // Créer la réservation
  await createReservation();
}
```

**Impact** : **Impossible d'encaisser** !

---

### 🟠 IMPORTANT (Très recommandé)

#### 5. **Gestion des Retours/Récupérations**
**Problème actuel** :
- Pas de gestion du retour du matériel
- Pas de workflow "pickup after rental"

**Ce qu'il faut** :
```typescript
// Créer automatiquement 2 tâches lors de la réservation
if (delivery_type === 'delivery') {
  // Tâche 1 : Livraison (start_date)
  await DeliveryService.createDeliveryTask({
    type: 'delivery',
    scheduled_date: start_date,
    ...
  });

  // Tâche 2 : Récupération (end_date)
  await DeliveryService.createDeliveryTask({
    type: 'pickup',  // ← NOUVEAU
    scheduled_date: end_date,
    ...
  });
}
```

**Impact** : Matériel pas récupéré = **perte** !

---

#### 6. **États de Réservation Complets**
**Problème actuel** :
- Stati existants : pending, confirmed, preparing, in_delivery, completed, cancelled
- Mais pas de workflow complet

**Ce qu'il faut** :
```typescript
// Workflow complet
type ReservationStatus =
  | 'pending'           // Client vient de réserver
  | 'payment_pending'   // En attente paiement
  | 'paid'              // Paiement confirmé
  | 'confirmed'         // Admin a confirmé
  | 'preparing'         // Préparation du matériel
  | 'ready'             // Prêt pour livraison/pickup
  | 'in_delivery'       // En cours de livraison
  | 'delivered'         // Matériel livré/retiré
  | 'in_use'            // En cours d'utilisation
  | 'pickup_scheduled'  // Récupération planifiée
  | 'pickup_in_progress'// Récupération en cours
  | 'returned'          // Matériel retourné
  | 'completed'         // Tout terminé
  | 'cancelled'         // Annulée

// Transitions automatiques
async function transitionReservationStatus(
  reservationId: string,
  newStatus: ReservationStatus
) {
  // Vérifier que la transition est valide
  // Déclencher actions automatiques
  // Notifier client/admin
}
```

**Impact** : Suivi impossible sans ça

---

#### 7. **Caution/Dépôt de Garantie**
**Problème actuel** :
- Pas de gestion de caution
- Location sans protection

**Ce qu'il faut** :
```typescript
// Dans la réservation
{
  subtotal: 1000,
  delivery_fee: 45,
  deposit: 300,  // ← NOUVEAU : Caution
  total: 1345    // subtotal + delivery + deposit
}

// Lors du paiement : prélever total
// Après retour : rembourser deposit (si matériel OK)
```

**Impact** : Aucune protection contre dommages

---

#### 8. **Notifications Automatiques**
**Problème actuel** :
- Aucune notification email/SMS
- Client ne sait pas où en est sa commande

**Ce qu'il faut** :
```typescript
// Événements qui déclenchent des notifs
enum NotificationEvent {
  RESERVATION_CREATED,      // → Email confirmation
  PAYMENT_CONFIRMED,        // → Email + SMS
  DELIVERY_SCHEDULED,       // → SMS J-1
  DELIVERY_IN_PROGRESS,     // → SMS "On arrive"
  DELIVERED,                // → Email "Profitez bien"
  PICKUP_REMINDER,          // → SMS J-1 du retour
  PICKUP_IN_PROGRESS,       // → SMS "On vient récupérer"
  RETURNED,                 // → Email merci + demande avis
  DEPOSIT_REFUNDED          // → Email remboursement
}

// Service de notifications
class NotificationsService {
  static async sendNotification(
    event: NotificationEvent,
    reservationId: string
  ) {
    const reservation = await getReservation(reservationId);
    const customer = reservation.customer;

    // Email via Resend/SendGrid
    await sendEmail({
      to: customer.email,
      template: getEmailTemplate(event),
      data: reservation
    });

    // SMS via Twilio
    if (customer.phone) {
      await sendSMS({
        to: customer.phone,
        message: getSMSMessage(event, reservation)
      });
    }
  }
}
```

**Impact** : Mauvaise expérience client

---

### 🟡 AMÉLIORATIONS (Nice to have)

#### 9. **Programme de Fidélité**
```typescript
// Utiliser customers.loyalty_points
- 1€ dépensé = 1 point
- 100 points = 10€ de réduction

// Dans ReservationsService.createReservation()
if (reservation created successfully) {
  const points = Math.floor(reservation.total);
  await CustomersService.addLoyaltyPoints(customerId, points);
}
```

#### 10. **Codes Promo Supabase**
```typescript
// Actuellement : codes hardcodés dans CartPage
// À faire : table promo_codes dans Supabase

CREATE TABLE promo_codes (
  id uuid PRIMARY KEY,
  code text UNIQUE,
  discount_type text, -- 'percentage' | 'fixed'
  discount_value numeric,
  valid_from date,
  valid_until date,
  max_uses integer,
  uses_count integer DEFAULT 0
);
```

#### 11. **Favoris Synchronisés**
- ✅ Déjà implémenté ! (FavoritesService existe)
- ⚠️ Mais pas connecté à l'interface catalogue

#### 12. **Avis Clients**
```typescript
CREATE TABLE reviews (
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  customer_id uuid REFERENCES customers(id),
  reservation_id uuid REFERENCES reservations(id),
  rating integer CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

// Demander avis après reservation.status = 'completed'
```

#### 13. **Assurance Optionnelle**
```typescript
// Option au checkout
{
  insurance: {
    selected: true,
    coverage: 'full',  // 'basic' | 'full'
    price: 25
  }
}
```

#### 14. **Multi-langues**
```typescript
// i18n pour français/anglais
import { useTranslation } from 'react-i18next';
```

---

## 🔄 FLUX COMPLET E-COMMERCE (Ce qu'il devrait être)

### Parcours Client Idéal

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. NAVIGATION CATALOGUE                                          │
└──────────────────────────────────────────────────────────────────┘
Client browse les produits
  → Filtre par catégorie
  → Recherche
  → Voit les prix par durée
  → Voit le stock disponible (temps réel)

┌──────────────────────────────────────────────────────────────────┐
│ 2. SÉLECTION PRODUIT + DATES                                     │
└──────────────────────────────────────────────────────────────────┘
Client clique sur un produit
  → Voit fiche détaillée
  → **Sélectionne dates** via calendrier ⚠️ MANQUANT
  → Calendrier montre disponibilité
  → Sélectionne quantité
  → Voit prix calculé automatiquement
  → Clique "Ajouter au panier"

  ⚡ Vérification automatique:
     - Stock disponible pour ces dates?
     - Produit actif?
     - Quantité <= stock?

┌──────────────────────────────────────────────────────────────────┐
│ 3. PANIER                                                        │
└──────────────────────────────────────────────────────────────────┘
Client voit son panier
  → Liste des produits avec dates
  → Prix par produit (calculé selon durée)
  → Peut modifier quantités
  → Peut supprimer items
  → **Applique code promo** ⚠️ À connecter Supabase
  → Voit sous-total + frais de livraison
  → Clique "Commander"

┌──────────────────────────────────────────────────────────────────┐
│ 4. CHECKOUT (3 étapes)                                           │
└──────────────────────────────────────────────────────────────────┘

Étape 1 : Informations Client
  → Si connecté : prérempli
  → Sinon : formulaire inscription
  → Choix particulier/professionnel

Étape 2 : Livraison
  → Choix : Livraison OU Retrait
  → Si Livraison:
    - Sélectionne adresse (liste) ou nouvelle
    - Calcul frais selon zone
    - Choix créneau horaire
  → Si Retrait:
    - Adresse magasin
    - Choix créneau
  → Type d'événement
  → Notes spéciales

Étape 3 : Paiement ⚠️ MANQUANT
  → **Intégration Stripe**
  → Affichage récapitulatif:
    - Sous-total
    - Livraison
    - **Caution** ⚠️ MANQUANT
    - Réduction (promo)
    - **TOTAL**
  → Paiement sécurisé
  → Validation

┌──────────────────────────────────────────────────────────────────┐
│ 5. CONFIRMATION                                                  │
└──────────────────────────────────────────────────────────────────┘
  ✅ Réservation créée dans Supabase
  ✅ Items créés
  ✅ Stocks réservés
  ✅ Tâche(s) créée(s) :
     - Livraison (start_date)
     - Récupération (end_date) ⚠️ MANQUANT
  ✅ Email de confirmation envoyé ⚠️ MANQUANT
  ✅ SMS de confirmation ⚠️ MANQUANT
  ✅ Points de fidélité ajoutés ⚠️ À faire

  → Client voit sa réservation dans "Mes Réservations"
  → Admin voit la réservation dans AdminReservations
  → Panier vidé

┌──────────────────────────────────────────────────────────────────┐
│ 6. SUIVI RÉSERVATION (Client)                                    │
└──────────────────────────────────────────────────────────────────┘
Client → "Mes Réservations"
  → Voit toutes ses réservations
  → Statut en temps réel
  → Peut annuler (conditions)
  → Reçoit notifications automatiques ⚠️ MANQUANT

┌──────────────────────────────────────────────────────────────────┐
│ 7. GESTION ADMIN                                                 │
└──────────────────────────────────────────────────────────────────┘
Admin voit nouvelle réservation
  → Vérifie paiement
  → Change statut: "confirmed"
  → Prépare le matériel: "preparing"
  → Matériel prêt: "ready"
  → Assigne livreur (si livraison)

┌──────────────────────────────────────────────────────────────────┐
│ 8. LIVRAISON (J du start_date)                                   │
└──────────────────────────────────────────────────────────────────┘
Technicien reçoit tâche
  → Voit détails client/adresse/produits
  → **Démarre livraison** (GPS optionnel)
  → Statut → "in_delivery"
  → **Client reçoit SMS "On arrive"** ⚠️ MANQUANT
  → Livre le matériel
  → **Fait signer bon de livraison** (photo/signature)
  → Marque "delivered"

┌──────────────────────────────────────────────────────────────────┐
│ 9. LOCATION EN COURS                                             │
└──────────────────────────────────────────────────────────────────┘
  → Statut: "in_use"
  → **J-1 du end_date: SMS rappel** ⚠️ MANQUANT
  → Stocks restent "réservés"

┌──────────────────────────────────────────────────────────────────┐
│ 10. RÉCUPÉRATION (J du end_date) ⚠️ MANQUANT                     │
└──────────────────────────────────────────────────────────────────┘
Technicien reçoit tâche de pickup
  → Voit détails
  → Va récupérer le matériel
  → **Vérifie état** (bon/endommagé)
  → Si OK: marque "returned"
  → Si endommagé: note dégâts
  → **Remboursement caution** (si OK) ⚠️ MANQUANT

┌──────────────────────────────────────────────────────────────────┐
│ 11. APRÈS LOCATION                                               │
└──────────────────────────────────────────────────────────────────┘
  ✅ Statut → "completed"
  ✅ Stocks libérés (automatique)
  ✅ **Email merci + demande avis** ⚠️ MANQUANT
  ✅ **Points fidélité crédités** ⚠️ À faire
```

---

## 📋 PLAN D'IMPLÉMENTATION PRIORITAIRE

### Phase 1 : CRITIQUE (2-3 jours)

1. **Calendrier de sélection de dates** (ProductPage + Calendrier)
2. **Calcul prix dynamique selon durée**
3. **Connecter CheckoutPage → ReservationsService**
4. **Intégration paiement Stripe**

**Résultat** : Site fonctionnel pour prendre des réservations réelles

---

### Phase 2 : IMPORTANT (1-2 jours)

5. **Gestion des retours** (2ème tâche pickup)
6. **États de réservation complets**
7. **Caution/Dépôt de garantie**
8. **Notifications email de base**

**Résultat** : Workflow complet

---

### Phase 3 : AMÉLIORATIONS (1-2 jours)

9. **Notifications SMS**
10. **Programme de fidélité actif**
11. **Codes promo Supabase**
12. **Avis clients**

**Résultat** : Expérience client optimale

---

## 📁 Fichiers à Créer/Modifier

### À Créer

1. `src/components/DateRangePicker.tsx`
2. `src/services/payments.service.ts` (Stripe)
3. `src/services/notifications.service.ts`
4. `src/utils/pricing.ts` (calculs dynamiques)
5. `src/pages/ConfirmationPage.tsx`
6. `supabase/add_pickup_tasks_and_deposit.sql`

### À Modifier

1. `src/pages/ProductPage.tsx` → Ajouter calendrier
2. `src/pages/CheckoutPage.tsx` → Connecter Supabase + Stripe
3. `src/contexts/CartContext.tsx` → Ajouter validation dates
4. `src/services/reservations.service.ts` → Ajouter pickup task
5. `src/types/index.ts` → Ajouter nouveaux types

---

## ✅ Checklist Complète E-Commerce

### Fonctionnalités Essentielles

- [ ] Calendrier sélection dates
- [ ] Calcul prix dynamique
- [ ] Vérification disponibilité temps réel
- [ ] Paiement en ligne sécurisé
- [ ] Gestion caution
- [ ] Notifications automatiques
- [ ] Gestion retours
- [ ] États réservation complets
- [ ] Codes promo Supabase
- [ ] Programme fidélité actif
- [ ] Avis clients
- [ ] Assurance optionnelle

---

**Date** : 12 novembre 2025
**Statut** : 📋 Audit complet terminé
**Prochaine étape** : Implémenter Phase 1 (fonctionnalités critiques)
