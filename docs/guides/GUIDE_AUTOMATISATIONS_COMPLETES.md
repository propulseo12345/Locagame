# 🤖 Guide Complet des Automatisations LocaGame

## 📋 Vue d'Ensemble des Flux Automatiques

Voici TOUTES les automatisations qui doivent fonctionner dans l'application :

---

## 1️⃣ ADMIN AJOUTE UN PRODUIT → APPARAIT SUR LE SITE VITRINE

### Comment ça fonctionne

```
Admin → AdminProducts → Ajoute un produit → ProductsService.createProduct()
                                                      ↓
                                             INSERT dans Supabase
                                                      ↓
                                    Site vitrine (Catalogue) → ProductsService.getProducts()
                                                      ↓
                                          ✅ Produit affiché automatiquement
```

### Fichiers concernés
- **Admin** : `src/pages/admin/AdminProducts.tsx`
- **Service** : `src/services/products.service.ts` (méthode `createProduct`)
- **Vitrine** : `src/pages/CatalogPage.tsx`
- **Table** : `products`

### État actuel
✅ **DÉJÀ IMPLÉMENTÉ**
- Le service `ProductsService.createProduct()` existe
- La page catalogue charge via `ProductsService.getProducts()`
- Dès qu'un produit est ajouté avec `is_active = true`, il apparaît

### Ce qu'il faut vérifier
- [ ] AdminProducts utilise `ProductsService.createProduct()`
- [ ] CatalogPage charge via `ProductsService.getProducts()`

---

## 2️⃣ CLIENT PASSE RÉSERVATION → APPARAIT DANS ADMIN

### Comment ça fonctionne

```
Client → CheckoutPage → Passe commande → ReservationsService.createReservation()
                                                      ↓
                                             INSERT dans Supabase
                                                      ↓
                              Admin → AdminReservations → ReservationsService.getAllReservations()
                                                      ↓
                                          ✅ Réservation affichée automatiquement
```

### Fichiers concernés
- **Client** : `src/pages/CheckoutPage.tsx`
- **Service** : `src/services/reservations.service.ts`
- **Admin** : `src/pages/admin/AdminReservations.tsx`
- **Tables** : `reservations` + `reservation_items`

### État actuel
⚠️ **À IMPLÉMENTER**
- Le service existe mais `createReservation()` doit être amélioré
- Il faut créer les `reservation_items` en même temps
- AdminReservations doit charger via `getAllReservations()`

### Ce qu'il faut faire
- [ ] Améliorer `ReservationsService.createReservation()` pour créer les items
- [ ] Connecter CheckoutPage à `createReservation()`
- [ ] Connecter AdminReservations à `getAllReservations()`

---

## 3️⃣ CHOIX LIVRAISON/PICKUP LORS DE LA RÉSERVATION

### Comment ça fonctionne

```
Client → CheckoutPage → Choix delivery_type
                              ↓
                    'delivery' OU 'pickup'
                              ↓
                    Réservation créée avec le type
                              ↓
              Admin voit dans AdminReservations
```

### Fichiers concernés
- **Client** : `src/pages/CheckoutPage.tsx`
- **Service** : `src/services/reservations.service.ts`
- **Admin** : `src/pages/admin/AdminReservations.tsx`
- **Champ** : `reservations.delivery_type`

### État actuel
⚠️ **À IMPLÉMENTER**
- Ajouter un choix "Livraison" / "Retrait en magasin" dans CheckoutPage
- Sauvegarder dans `delivery_type` ('delivery' ou 'pickup')

### Ce qu'il faut faire
- [ ] Ajouter l'option de choix dans CheckoutPage
- [ ] Passer `delivery_type` à `createReservation()`
- [ ] Afficher le type dans AdminReservations

---

## 4️⃣ ADMIN ASSIGNE LIVRAISON → TECHNICIEN VOIT LA TÂCHE

### Comment ça fonctionne

```
Admin → AdminPlanning → Assigne livraison → DeliveryService.assignTask()
                                                      ↓
                                      UPDATE delivery_tasks (technician_id)
                                                      ↓
                        Technicien → TechnicianTasks → DeliveryService.getTechnicianTasks()
                                                      ↓
                                          ✅ Tâche affichée automatiquement
```

### Fichiers concernés
- **Admin** : `src/pages/admin/AdminPlanning.tsx`
- **Service** : `src/services/delivery.service.ts` (méthode `assignTask`)
- **Technicien** : `src/pages/technician/TechnicianTasks.tsx`
- **Table** : `delivery_tasks`

### État actuel
✅ **DÉJÀ IMPLÉMENTÉ**
- Le service `DeliveryService.assignTask()` existe
- TechnicianTasks charge via `getTechnicianTasks()`
- L'assignation fonctionne

### Ce qu'il faut vérifier
- [ ] AdminPlanning utilise `assignTask()`
- [ ] TechnicianTasks charge correctement les tâches

---

## 5️⃣ CRÉATION AUTOMATIQUE DE TÂCHE DE LIVRAISON

### Comment ça fonctionne

```
Réservation créée avec delivery_type = 'delivery'
                    ↓
      Créer automatiquement une delivery_task
                    ↓
          DeliveryService.createDeliveryTask()
                    ↓
    Tâche créée avec status = 'scheduled'
                    ↓
  Admin peut l'assigner dans AdminPlanning
```

### Fichiers concernés
- **Service** : `src/services/reservations.service.ts`
- **Service** : `src/services/delivery.service.ts`
- **Tables** : `reservations` + `delivery_tasks`

### État actuel
⚠️ **À IMPLÉMENTER**
- Après création d'une réservation avec `delivery_type = 'delivery'`
- Créer automatiquement une `delivery_task`

### Ce qu'il faut faire
- [ ] Dans `createReservation()`, si `delivery_type = 'delivery'`
- [ ] Appeler `DeliveryService.createDeliveryTask()` automatiquement
- [ ] Remplir les infos (customer_data, address_data, products_data)

---

## 6️⃣ CLIENT S'INSCRIT → APPARAIT DANS ADMIN CLIENTS

### Comment ça fonctionne

```
Client → Inscription → AuthContext.signUp() → Supabase Auth
                                                      ↓
                                      Utilisateur créé dans auth.users
                                                      ↓
                              CustomersService.createCustomer(auth.uid)
                                                      ↓
                                      INSERT dans table customers
                                                      ↓
                        Admin → AdminCustomers → CustomersService.getAllCustomers()
                                                      ↓
                                          ✅ Client affiché automatiquement
```

### Fichiers concernés
- **Auth** : `src/contexts/AuthContext.tsx`
- **Service** : `src/services/customers.service.ts`
- **Admin** : `src/pages/admin/AdminCustomers.tsx`
- **Tables** : `auth.users` + `customers`

### État actuel
⚠️ **À IMPLÉMENTER**
- AuthContext utilise encore fake-data
- Migrer vers Supabase Auth
- Créer automatiquement le profil customer après inscription

### Ce qu'il faut faire
- [ ] Migrer AuthContext vers `supabase.auth.signUp()`
- [ ] Après signUp, appeler `CustomersService.createCustomer()`
- [ ] Connecter AdminCustomers à `getAllCustomers()`

---

## 7️⃣ ADMIN MODIFIE ZONES → RÉPERCUSSION SUR VITRINE

### Comment ça fonctionne

```
Admin → AdminZones → Modifie zone → DeliveryService.updateZone()
                                                      ↓
                                      UPDATE dans delivery_zones
                                                      ↓
                        Site vitrine → CheckoutPage → DeliveryService.getDeliveryZones()
                                                      ↓
                                    ✅ Nouvelles zones/prix affichés automatiquement
```

### Fichiers concernés
- **Admin** : `src/pages/admin/AdminZones.tsx`
- **Service** : `src/services/delivery.service.ts`
- **Vitrine** : `src/pages/CheckoutPage.tsx`
- **Table** : `delivery_zones`

### État actuel
⚠️ **À IMPLÉMENTER**
- Le service `DeliveryService.getDeliveryZones()` existe
- Il faut ajouter `updateZone()` et `createZone()`
- AdminZones doit être connecté

### Ce qu'il faut faire
- [ ] Ajouter `updateZone()` et `createZone()` dans DeliveryService
- [ ] Connecter AdminZones à ces méthodes
- [ ] CheckoutPage charge déjà via `getDeliveryZones()`

---

## 📊 Résumé des Automatisations

| # | Automatisation | Statut | Priorité |
|---|----------------|--------|----------|
| 1 | Admin ajoute produit → Vitrine | ✅ Fait | Haute |
| 2 | Client réserve → Admin voit | ⚠️ À faire | Haute |
| 3 | Choix livraison/pickup | ⚠️ À faire | Haute |
| 4 | Admin assigne → Technicien voit | ✅ Fait | Haute |
| 5 | Création auto tâche livraison | ⚠️ À faire | Moyenne |
| 6 | Inscription → Admin clients | ⚠️ À faire | Moyenne |
| 7 | Zones admin → Vitrine | ⚠️ À faire | Basse |

---

## 🔧 Méthodes de Service À Ajouter

### DeliveryService
```typescript
// À ajouter dans delivery.service.ts
static async updateZone(id: string, updates: Partial<DeliveryZone>)
static async createZone(zone: Omit<DeliveryZone, 'id' | 'created_at'>)
static async deleteZone(id: string)
```

### ReservationsService
```typescript
// À améliorer dans reservations.service.ts
static async createReservation(order: CreateOrderDTO): Promise<Order> {
  // 1. Créer la réservation
  const reservation = await supabase.from('reservations').insert(...)

  // 2. Créer les reservation_items
  const items = await supabase.from('reservation_items').insert(...)

  // 3. Si delivery_type = 'delivery', créer delivery_task
  if (order.delivery_type === 'delivery') {
    await DeliveryService.createDeliveryTask(...)
  }

  return reservation
}
```

---

## ✅ Prochaines Étapes

### Phase 1 : Flux de Réservation (PRIORITAIRE)
1. ⚠️ Améliorer `ReservationsService.createReservation()`
2. ⚠️ Ajouter choix livraison/pickup dans CheckoutPage
3. ⚠️ Créer auto delivery_task si livraison
4. ⚠️ Connecter AdminReservations

### Phase 2 : Authentification
5. ⚠️ Migrer AuthContext vers Supabase Auth
6. ⚠️ Créer auto profil customer après inscription
7. ⚠️ Connecter AdminCustomers

### Phase 3 : Gestion des Zones
8. ⚠️ Ajouter CRUD zones dans DeliveryService
9. ⚠️ Connecter AdminZones

---

**Ce guide sera mis à jour au fur et à mesure de l'implémentation.**
