# 🔧 Modifications à Apporter au CheckoutPage

**Fichier** : `src/pages/CheckoutPage.tsx`
**Objectif** : Connecter le checkout à Supabase pour créer de vraies réservations

---

## ✅ Changements à Faire

### 1. Imports à Ajouter

```typescript
// Au début du fichier, ajouter :
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ReservationsService } from '../services/reservations.service';
import { DeliveryService } from '../services/delivery.service';
import { calculateDeposit, calculateDurationDays, formatPrice } from '../utils/pricing';
```

### 2. Remplacer les Données Mock par le Vrai Panier

**Ligne actuelle (~40)** :
```typescript
// Simulation des données du panier
const cartItems: CartItem[] = [
  {
    product: mockProducts[0],
    start_date: '2024-01-20',
    end_date: '2024-01-21',
    quantity: 1,
    delivery_address: '123 Rue de la Paix, 13001 Marseille',
    total_price: 60
  },
  ...
];
```

**Remplacer par** :
```typescript
const navigate = useNavigate();
const { items: cartItems, clearCart } = useCart();
const { currentUser } = useAuth();

if (cartItems.length === 0) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-gray-600 mb-4">Votre panier est vide</p>
        <Link to="/catalogue" className="text-blue-600 hover:underline">
          Retour au catalogue
        </Link>
      </div>
    </div>
  );
}
```

### 3. Calculer le Dépôt de Garantie

**Après le calcul du subtotal (~60)** :
```typescript
const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
const deliveryFee = 15;  // ← À remplacer par calcul selon zone
const deposit = calculateDeposit(subtotal);  // ← NOUVEAU
const total = subtotal + deliveryFee + deposit;  // ← Inclure le dépôt
```

### 4. Améliorer le Calcul des Frais de Livraison

**Remplacer** :
```typescript
const deliveryFee = 15;
```

**Par** :
```typescript
const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);

// Quand le code postal change
const handlePostalCodeChange = async (postalCode: string) => {
  setDeliveryAddress(prev => ({ ...prev, postal_code: postalCode }));

  if (postalCode.length >= 5) {
    try {
      const zone = await DeliveryService.findZoneByPostalCode(postalCode);
      setDeliveryZone(zone);
    } catch (error) {
      console.error('Error finding zone:', error);
      setDeliveryZone(null);
    }
  }
};

const deliveryFee = deliveryZone ? deliveryZone.delivery_fee : 0;
```

### 5. Remplacer handleSubmit par une Vraie Création

**Ligne actuelle (~103)** :
```typescript
const handleSubmit = async () => {
  setIsProcessing(true);

  // Simulation du traitement de la commande
  await new Promise(resolve => setTimeout(resolve, 3000));

  setIsProcessing(false);
  // TODO: Rediriger vers la page de confirmation
};
```

**Remplacer par** :
```typescript
const handleSubmit = async () => {
  if (!currentUser) {
    alert('Vous devez être connecté pour passer une commande');
    return;
  }

  setIsProcessing(true);

  try {
    // 1. Créer/récupérer l'adresse si livraison
    let addressId = null;
    if (deliveryAddress.street && deliveryAddress.city && deliveryAddress.postal_code) {
      // Créer l'adresse (ou utiliser AddressesService)
      // Pour simplifier, on peut la passer en dur dans delivery_address_id
      addressId = 'temp-address-id'; // TODO: Créer vraiment l'adresse
    }

    // 2. Préparer les items
    const items = cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      duration_days: calculateDurationDays(item.start_date, item.end_date),
      unit_price: item.total_price / item.quantity,
      subtotal: item.total_price
    }));

    // 3. Trouver les dates min/max
    const startDate = cartItems.reduce((min, item) =>
      item.start_date < min ? item.start_date : min,
      cartItems[0].start_date
    );
    const endDate = cartItems.reduce((max, item) =>
      item.end_date > max ? item.end_date : max,
      cartItems[0].end_date
    );

    // 4. Créer la réservation
    const reservation = await ReservationsService.createReservation({
      customer_id: currentUser.id,
      start_date: startDate,
      end_date: endDate,
      delivery_type: deliveryAddress.street ? 'delivery' : 'pickup',
      delivery_time: deliveryTime,
      delivery_address_id: addressId,
      zone_id: deliveryZone?.id,
      event_type: eventType,
      items,
      subtotal,
      delivery_fee: deliveryFee,
      discount: 0, // TODO: Gérer les codes promo
      deposit,
      total,
      notes: specialNotes,
      payment_method: 'card' // TODO: Stripe
    });

    // 5. Vider le panier
    clearCart();

    // 6. Rediriger vers confirmation
    navigate(`/confirmation/${reservation.id}`);
  } catch (error) {
    console.error('Error creating reservation:', error);
    alert('Erreur lors de la création de la réservation. Veuillez réessayer.');
  } finally {
    setIsProcessing(false);
  }
};
```

### 6. Afficher le Dépôt dans le Récapitulatif

**Dans le récapitulatif financier (~600)**, ajouter :

```typescript
{/* Dépôt de garantie */}
<div className="flex justify-between text-orange-600">
  <span className="flex items-center gap-2">
    Caution (remboursable)
    <span className="text-xs text-gray-500">💰</span>
  </span>
  <span className="font-semibold">{formatPrice(deposit)}</span>
</div>
```

---

## 📁 Fichiers Modifiés

1. **src/pages/CheckoutPage.tsx**
   - Connexion au CartContext
   - Connexion à AuthContext
   - Appel à ReservationsService
   - Calcul dépôt
   - Redirection vers ConfirmationPage

---

## ✅ Résultat Attendu

Après ces modifications :

1. ✅ Le checkout utilise le vrai panier
2. ✅ Une vraie réservation est créée dans Supabase
3. ✅ Les tâches de livraison/retour sont créées automatiquement
4. ✅ Les stocks sont vérifiés et réservés
5. ✅ Le dépôt de garantie est calculé et ajouté
6. ✅ Le client est redirigé vers la page de confirmation
7. ✅ Le panier est vidé après succès

---

## 🎯 Prochaines Étapes

1. **Créer AddressesService** pour gérer les adresses proprement
2. **Intégrer Stripe** pour le paiement (Phase 2)
3. **Ajouter les notifications email** (Phase 2)

---

**Date** : 12 novembre 2025
**Statut** : 📋 Guide complet des modifications
