# Guide de Tests Post-Migration RLS - LOCAGAME

## Comptes de test

| Rôle | Email | Description |
|------|-------|-------------|
| Admin | admin@locagame.fr | Accès total |
| Client | client@exemple.fr | Accès ses données uniquement |
| Technicien | technicien@locagame.fr | Accès ses tâches uniquement |

---

## 10 Tests de validation

### TEST 1: Admin - Lecture toutes les réservations
**Rôle:** Admin
**Action:** `SELECT * FROM reservations`
**Attendu:** ✅ Toutes les réservations visibles
```sql
-- Connecté en admin
SELECT COUNT(*) FROM reservations;
-- Doit retourner le total (ex: 4+)
```

---

### TEST 2: Client - Lecture ses réservations uniquement
**Rôle:** Client
**Action:** `SELECT * FROM reservations`
**Attendu:** ✅ Uniquement où `customer_id = auth.uid()`
```sql
-- Connecté en client
SELECT id, status FROM reservations;
-- Ne doit voir que ses propres réservations
```

---

### TEST 3: Client - Impossible de voir autres clients
**Rôle:** Client
**Action:** `SELECT * FROM customers WHERE id != auth.uid()`
**Attendu:** ❌ 0 résultats
```sql
-- Connecté en client
SELECT * FROM customers;
-- Ne doit voir que sa propre ligne
```

---

### TEST 4: Technicien - Lecture ses delivery_tasks uniquement
**Rôle:** Technicien
**Action:** `SELECT * FROM delivery_tasks`
**Attendu:** ✅ Uniquement ses tâches assignées
```sql
-- Connecté en technicien
SELECT id, type, status, scheduled_date FROM delivery_tasks;
-- Ne voit que les tâches où technician_id = son ID
```

---

### TEST 5: Technicien - Lecture réservations via ses tâches
**Rôle:** Technicien
**Action:** `SELECT * FROM reservations`
**Attendu:** ✅ Uniquement les réservations liées à ses delivery_tasks
```sql
-- Connecté en technicien
SELECT id, start_date, status FROM reservations;
-- Uniquement celles liées à ses tâches
```

---

### TEST 6: Technicien - Impossible d'UPDATE directement une tâche
**Rôle:** Technicien
**Action:** `UPDATE delivery_tasks SET notes = 'test' WHERE id = 'xxx'`
**Attendu:** ❌ 0 lignes modifiées (pas de policy UPDATE)
```sql
-- Connecté en technicien
UPDATE delivery_tasks SET notes = 'hack' WHERE id = '...';
-- Doit échouer ou ne rien modifier
```

---

### TEST 7: Technicien - UPDATE via RPC fonctionne
**Rôle:** Technicien
**Action:** Appeler `update_delivery_task_status(task_id, 'in_progress', NOW(), NULL)`
**Attendu:** ✅ Succès si c'est sa tâche
```sql
-- Connecté en technicien
SELECT update_delivery_task_status(
  'id-de-sa-tache',
  'in_progress',
  NOW(),
  NULL
);
-- Doit retourner {"success": true, "task_id": "..."}
```

---

### TEST 8: Anon - Impossible de lire les réservations
**Rôle:** Non connecté (anon)
**Action:** `SELECT * FROM reservations`
**Attendu:** ❌ 0 résultats
```sql
-- Sans token / anon
SELECT * FROM reservations;
-- Doit retourner 0 lignes
```

---

### TEST 9: Anon - Impossible de créer une réservation
**Rôle:** Non connecté (anon)
**Action:** `INSERT INTO reservations (...)`
**Attendu:** ❌ Erreur RLS
```sql
-- Sans token / anon
INSERT INTO reservations (customer_id, start_date, end_date, total, status)
VALUES (gen_random_uuid(), '2025-02-01', '2025-02-02', 100, 'pending');
-- Doit échouer (pas de policy INSERT pour anon)
```

---

### TEST 10: Admin - Création technicien via Edge Function
**Rôle:** Admin
**Action:** POST `/functions/v1/create-technician-and-vehicle`
**Attendu:** ✅ Technicien + véhicule créés, invitation envoyée
```bash
curl -X POST 'https://koqdpkkuarbjiimkopei.supabase.co/functions/v1/create-technician-and-vehicle' \
  -H 'Authorization: Bearer <ADMIN_JWT>' \
  -H 'Content-Type: application/json' \
  -d '{
    "technician": {
      "email": "nouveau.tech@locagame.fr",
      "first_name": "Jean",
      "last_name": "Test",
      "phone": "0600000000"
    },
    "vehicle": {
      "name": "Camion Test",
      "type": "truck",
      "capacity": 20,
      "license_plate": "TEST-123"
    }
  }'
```
**Réponse attendue:**
```json
{
  "success": true,
  "technician": { "id": "...", "email": "nouveau.tech@locagame.fr", ... },
  "vehicle": { "id": "...", "name": "Camion Test", "license_plate": "TEST-123" },
  "invite_sent": true
}
```

---

## Résumé des accès par rôle

| Table | Admin | Client | Technicien | Anon |
|-------|-------|--------|------------|------|
| `customers` | CRUD | R/I/U own | ❌ | ❌ |
| `addresses` | R | CRUD own | R (via tasks) | ❌ |
| `reservations` | CRUD | R/I own | R (via tasks) | ❌ |
| `reservation_items` | CRUD | R/I own | R (via tasks) | ❌ |
| `delivery_tasks` | CRUD | ❌ | R + RPC update | ❌ |
| `technicians` | CRUD | ❌ | R/U own | ❌ |
| `vehicles` | CRUD | ❌ | R own | ❌ |
| `product_availability` | CRUD | R | R | R |
| `app_settings` | CRUD | ❌ | ❌ | ❌ |
| Tables ref | CRUD | R | R | R |

---

## Rollback d'urgence

Si problème critique:
```sql
-- ATTENTION: Désactive toute protection!
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tasks DISABLE ROW LEVEL SECURITY;
-- etc.
```

Puis investiguer via les logs Supabase.
