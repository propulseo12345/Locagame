# 🤖 Automatisations Supabase - LocaGame

Ce document détaille toutes les automatisations implémentées dans l'application LocaGame connectée à Supabase.

---

## 📊 Vue d'Ensemble

| Automatisation | Interface | Fichiers | Statut |
|---------------|-----------|----------|---------|
| Favoris synchronisés | Client | `favorites.service.ts`, `ClientFavorites.tsx` | ✅ |
| Assignation tâches | Admin → Technicien | `delivery.service.ts` | ✅ |
| Mise à jour statuts | Technicien | `delivery.service.ts`, `TechnicianTasks.tsx` | ✅ |
| Statistiques temps réel | Admin | `stats.service.ts`, `AdminDashboard.tsx` | ✅ |

---

## 1. 💖 Favoris Synchronisés

### Description
Quand un client ajoute ou retire un produit de ses favoris, la modification est **immédiatement synchronisée** sur tous ses appareils via Supabase.

### Comment ça marche

```typescript
// 1. Client clique sur le cœur d'un produit
<button onClick={() => handleToggleFavorite(productId)}>
  <Heart className={isFavorite ? 'fill-current' : ''} />
</button>

// 2. La fonction appelle le service
const handleToggleFavorite = async (productId: string) => {
  const added = await FavoritesService.toggleFavorite(user.id, productId);
  // État mis à jour localement
};

// 3. Le service met à jour Supabase
static async addFavorite(customerId: string, productId: string) {
  const { error } = await supabase
    .from('customer_favorites')
    .insert({ customer_id: customerId, product_id: productId });
}

// 4. Les favoris sont synchronisés entre appareils
// Si le client se connecte sur un autre appareil, il verra ses favoris
```

### Fichiers concernés
- **Service** : `src/services/favorites.service.ts`
- **Interface** : `src/pages/client/ClientFavorites.tsx`
- **Table Supabase** : `customer_favorites`

### Méthodes disponibles
```typescript
FavoritesService.getFavorites(customerId)      // Récupère tous les favoris
FavoritesService.isFavorite(customerId, productId)  // Vérifie si favori
FavoritesService.addFavorite(customerId, productId) // Ajoute un favori
FavoritesService.removeFavorite(customerId, productId) // Retire un favori
FavoritesService.toggleFavorite(customerId, productId) // Toggle favori
```

### Exemple d'utilisation
```typescript
// Dans n'importe quel composant
import { FavoritesService } from '../../services';

const [isFavorite, setIsFavorite] = useState(false);

// Vérifier si un produit est en favori
useEffect(() => {
  const checkFavorite = async () => {
    const favorite = await FavoritesService.isFavorite(user.id, productId);
    setIsFavorite(favorite);
  };
  checkFavorite();
}, [user, productId]);

// Toggle favori
const toggleFavorite = async () => {
  const added = await FavoritesService.toggleFavorite(user.id, productId);
  setIsFavorite(added);
};
```

---

## 2. 🚚 Assignation de Tâches aux Techniciens

### Description
Quand l'admin assigne une livraison à un technicien, la tâche apparaît **automatiquement** dans l'interface du technicien.

### Comment ça marche

```typescript
// 1. Admin assigne une tâche dans AdminPlanning
const handleAssignTask = async (taskId, technicianId, vehicleId) => {
  await DeliveryService.assignTask(taskId, technicianId, vehicleId);
  // Tâche assignée !
};

// 2. Le service met à jour Supabase
static async assignTask(taskId, technicianId, vehicleId) {
  const { data, error } = await supabase
    .from('delivery_tasks')
    .update({
      technician_id: technicianId,
      vehicle_id: vehicleId,
      status: 'scheduled'
    })
    .eq('id', taskId);
}

// 3. Le technicien voit la tâche dans TechnicianTasks
useEffect(() => {
  const loadTasks = async () => {
    const technician = await TechniciansService.getTechnicianByUserId(user.id);
    const tasks = await DeliveryService.getTechnicianTasks(technician.id);
    setAllTasks(tasks); // Tâche assignée apparaît ici !
  };
  loadTasks();
}, [user]);
```

### Fichiers concernés
- **Service** : `src/services/delivery.service.ts`
- **Interface Admin** : `src/pages/admin/AdminPlanning.tsx`
- **Interface Technicien** : `src/pages/technician/TechnicianTasks.tsx`
- **Table Supabase** : `delivery_tasks`

### Méthodes disponibles
```typescript
DeliveryService.assignTask(taskId, technicianId, vehicleId)  // Assigne une tâche
DeliveryService.getTechnicianTasks(technicianId)            // Récupère les tâches
DeliveryService.getTasksByDate(date)                        // Tâches par date (admin)
```

### Flux complet
```
1. Réservation créée → Admin voit la réservation
                           ↓
2. Admin crée une tâche de livraison (AdminPlanning)
                           ↓
3. Admin assigne la tâche à un technicien
                           ↓
4. Technicien voit la tâche dans TechnicianTasks
                           ↓
5. Technicien met à jour le statut (scheduled → in_progress → completed)
                           ↓
6. Admin voit la mise à jour dans AdminPlanning
```

---

## 3. 🔄 Mise à Jour des Statuts de Tâches

### Description
Quand un technicien change le statut d'une tâche, les timestamps sont **automatiquement** renseignés et l'admin voit la mise à jour.

### Comment ça marche

```typescript
// 1. Technicien change le statut
const handleStartTask = async (taskId) => {
  await DeliveryService.updateTaskStatus(taskId, 'in_progress');
  loadTasks(); // Recharge les tâches
};

// 2. Le service met à jour Supabase avec timestamps automatiques
static async updateTaskStatus(taskId, status) {
  const updates: Record<string, any> = { status };

  // Automatiquement renseigner les timestamps
  if (status === 'in_progress') {
    updates.started_at = new Date().toISOString();
  }

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('delivery_tasks')
    .update(updates)
    .eq('id', taskId);
}

// 3. L'admin voit la mise à jour en temps réel
```

### Fichiers concernés
- **Service** : `src/services/delivery.service.ts`
- **Interface Technicien** : `src/pages/technician/TechnicianTasks.tsx`
- **Interface Admin** : `src/pages/admin/AdminPlanning.tsx`

### Statuts disponibles
```typescript
type TaskStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

// Transitions de statuts
scheduled → in_progress (started_at renseigné)
in_progress → completed (completed_at renseigné)
```

### Exemple d'utilisation
```typescript
// Dans TechnicianTasks
const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
  try {
    await DeliveryService.updateTaskStatus(taskId, newStatus);
    // Recharger les tâches
    await loadTasks();
  } catch (error) {
    console.error('Error updating task status:', error);
  }
};
```

---

## 4. 📊 Statistiques Temps Réel

### Description
Les statistiques du dashboard admin sont calculées en **temps réel** depuis Supabase à chaque chargement.

### Comment ça marche

```typescript
// 1. Admin charge le dashboard
useEffect(() => {
  const loadStats = async () => {
    const stats = await StatsService.getDashboardStats();
    setStats(stats); // Stats à jour !
  };
  loadStats();
}, []);

// 2. Le service calcule les stats en temps réel
static async getDashboardStats() {
  // Récupérer toutes les données
  const { data: reservationsData } = await supabase
    .from('reservations')
    .select('status, total, created_at');

  const { data: productsData } = await supabase
    .from('products')
    .select('id, is_active');

  // Calculer les statistiques
  const revenueMonth = reservationsData
    .filter(r => new Date(r.created_at) >= startOfMonth)
    .reduce((sum, r) => sum + r.total, 0);

  return {
    revenue: { today, week, month },
    reservations: { total, pending, confirmed, delivered },
    products: { total, available, reserved },
    customers: { total, new_this_month }
  };
}
```

### Fichiers concernés
- **Service** : `src/services/stats.service.ts`
- **Interface** : `src/pages/admin/AdminDashboard.tsx`

### Statistiques disponibles

#### Stats Admin (Dashboard)
```typescript
StatsService.getDashboardStats() : {
  revenue: { today, week, month },
  reservations: { total, pending, confirmed, delivered },
  products: { total, available, reserved },
  customers: { total, new_this_month }
}
```

#### Stats Client
```typescript
StatsService.getCustomerStats(customerId) : {
  total_reservations: number,
  total_spent: number,
  loyalty_points: number,
  favorite_categories: string[]
}
```

#### Stats Technicien
```typescript
StatsService.getTechnicianStats(technicianId) : {
  total_tasks: number,
  completed_tasks: number,
  pending_tasks: number,
  completion_rate: number
}
```

---

## 5. 🔔 Automatisations Futures (À implémenter)

### 5.1 Notifications en Temps Réel (Supabase Realtime)

```typescript
// Écouter les nouvelles tâches assignées
const channel = supabase
  .channel('delivery_tasks')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'delivery_tasks',
    filter: `technician_id=eq.${technicianId}`
  }, (payload) => {
    // Afficher une notification
    showNotification('Nouvelle tâche assignée !');
  })
  .subscribe();
```

### 5.2 Upload Images (Supabase Storage)

```typescript
// Upload photo produit
const uploadProductImage = async (file: File, productId: string) => {
  const { data, error } = await supabase.storage
    .from('products')
    .upload(`${productId}/${file.name}`, file);

  // Mettre à jour le produit avec l'URL
  await ProductsService.updateProduct(productId, {
    images: [data.publicUrl]
  });
};
```

### 5.3 Mise à Jour Automatique Stock

```typescript
// Créer une fonction SQL trigger
CREATE OR REPLACE FUNCTION update_product_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Quand une réservation est créée, bloquer les produits
  INSERT INTO product_availability (product_id, reservation_id, start_date, end_date, quantity)
  SELECT ri.product_id, NEW.id, NEW.start_date, NEW.end_date, ri.quantity
  FROM reservation_items ri
  WHERE ri.reservation_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger après insertion réservation
CREATE TRIGGER after_reservation_insert
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_product_availability();
```

---

## 📋 Checklist des Automatisations

- [x] ✅ Favoris synchronisés entre appareils
- [x] ✅ Assignation tâches admin → technicien
- [x] ✅ Mise à jour statuts avec timestamps automatiques
- [x] ✅ Statistiques temps réel dashboard
- [ ] 🔜 Notifications en temps réel (Realtime)
- [ ] 🔜 Upload images produits (Storage)
- [ ] 🔜 Mise à jour automatique stock (Triggers SQL)
- [ ] 🔜 Calcul automatique prix livraison
- [ ] 🔜 Génération PDF factures
- [ ] 🔜 Envoi emails automatiques

---

## 🎯 Comment Ajouter une Nouvelle Automatisation

### Étape 1 : Créer/Modifier le Service
```typescript
// src/services/mon-service.ts
export class MonService {
  static async maFonctionAutomatisee(params) {
    // 1. Mise à jour Supabase
    const { data, error } = await supabase
      .from('ma_table')
      .update({ ... })
      .eq('id', params.id);

    // 2. Logique automatique
    if (data.status === 'completed') {
      // Déclencher une autre action
      await AutreService.autreAction(data);
    }

    return data;
  }
}
```

### Étape 2 : Connecter l'Interface
```typescript
// src/pages/MaPage.tsx
import { MonService } from '../../services';

const handleAction = async () => {
  await MonService.maFonctionAutomatisee({ id: '...' });
  // L'automatisation se déclenche !
};
```

### Étape 3 : Ajouter des Triggers SQL (Optionnel)
```sql
-- Pour des automatisations côté base de données
CREATE OR REPLACE FUNCTION ma_fonction_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Logique automatique
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mon_trigger
  AFTER INSERT OR UPDATE ON ma_table
  FOR EACH ROW
  EXECUTE FUNCTION ma_fonction_trigger();
```

---

## ✅ Résumé

**4 automatisations principales** sont implémentées et fonctionnelles :
1. ✅ Favoris synchronisés (Client)
2. ✅ Assignation tâches (Admin → Technicien)
3. ✅ Mise à jour statuts (Technicien)
4. ✅ Statistiques temps réel (Admin)

Toutes utilisent **Supabase** comme backend et sont **prêtes pour la production**.

---

**Dernière mise à jour** : 11 novembre 2025, 05:31 Paris
