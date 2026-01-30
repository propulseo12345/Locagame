# Implementation des regles tarifaires LOCAGAME

## Resume de l'implementation

Cette documentation decrit l'implementation du systeme de tarification "forfait week-end" et des majorations pour livraison/reprise week-end ou jour ferie.

## Fichiers modifies/crees

### Nouveaux fichiers

| Fichier | Description |
|---------|-------------|
| `src/utils/dateHolidays.ts` | Utilitaires jours feries FR + detection week-end |
| `src/utils/pricingRules.ts` | Module principal des regles tarifaires |
| `src/utils/pricingRules.test.ts` | Tests unitaires |
| `supabase/migrations/20260130_add_pricing_rules_fields.sql` | Migration SQL |

### Fichiers modifies

| Fichier | Modifications |
|---------|---------------|
| `src/types/index.ts` | Ajout `DaySlot`, `PricingBreakdownData`, champs Order |
| `src/pages/CheckoutPage.tsx` | Options livraison/reprise imperatives + breakdown |
| `src/services/reservations.service.ts` | Nouveaux champs pricing |
| `src/pages/admin/AdminReservationDetail.tsx` | Affichage regles tarifaires |

## Schema de la solution

### 1. Forfait week-end (Regle 1)

**Declenchement:**
- Si la periode de location couvre un samedi ou dimanche
- OU si pattern "vendredi PM -> lundi AM"

**Logique:**
- Le produit doit avoir `weekend_flat_price` defini (ex: 125 pour babyfoot)
- Si oui, ce prix remplace le calcul standard "prix/jour * jours"
- Si non, le pricing standard s'applique

**Champ DB:** `products.weekend_flat_price` (NUMERIC, nullable)

### 2. Majorations livraison/reprise (Regle 2)

**Declenchement:**
- Client coche "Livraison imperative" + date est week-end/ferie
- Client coche "Reprise imperative" + date est week-end/ferie

**Montants:**
- `WEEKEND_DELIVERY_SURCHARGE = 50€`
- `HOLIDAY_SURCHARGE = 50€`

**UX:**
- Si non cochee, message: "Livraison planifiee hors week-end / jours feries"

### 3. Jours feries FR

**Fixes:**
- 1er janvier, 1er mai, 8 mai, 14 juillet, 15 aout
- 1er novembre, 11 novembre, 25 decembre

**Mobiles (bases sur Paques):**
- Lundi de Paques (Paques + 1 jour)
- Ascension (Paques + 39 jours)
- Lundi de Pentecote (Paques + 50 jours)

## Structure du PricingBreakdown

```typescript
interface PricingBreakdown {
  basePrice: number;           // Prix unitaire (forfait ou calcul standard)
  basePriceLabel: string;      // "Forfait week-end" ou "X jours"
  quantity: number;
  productSubtotal: number;     // basePrice * quantity
  durationDays: number;
  rulesApplied: [{
    id: string;                // ex: "weekend_flat_rate"
    name: string;              // ex: "Forfait week-end"
    description: string;
    amount: number;
    type: 'flat_rate' | 'surcharge' | 'discount';
  }];
  surchargesTotal: number;     // Total des majorations
  total: number;               // productSubtotal + surchargesTotal
  weekendFlatRateApplied: boolean;
  infoMessage?: string;        // Message UX optionnel
}
```

## Migration SQL

```sql
-- Products: forfait week-end
ALTER TABLE products
ADD COLUMN weekend_flat_price NUMERIC(10,2) DEFAULT NULL;

-- Reservations: slots + flags + breakdown
ALTER TABLE reservations
ADD COLUMN start_slot TEXT DEFAULT 'AM' CHECK (start_slot IN ('AM', 'PM'));
ADD COLUMN end_slot TEXT DEFAULT 'AM' CHECK (end_slot IN ('AM', 'PM'));
ADD COLUMN delivery_is_mandatory BOOLEAN DEFAULT FALSE;
ADD COLUMN pickup_is_mandatory BOOLEAN DEFAULT FALSE;
ADD COLUMN pricing_breakdown JSONB DEFAULT NULL;

-- Mise a jour babyfoots existants
UPDATE products
SET weekend_flat_price = 125.00
WHERE LOWER(name) LIKE '%baby%';
```

## Tests manuels

### Cas 1: Babyfoot avec forfait week-end
1. Ajouter un babyfoot au panier
2. Dates: vendredi -> dimanche
3. Verifier: base = 125€ (forfait week-end)

### Cas 2: Babyfoot hors week-end
1. Ajouter un babyfoot au panier
2. Dates: lundi -> mardi
3. Verifier: base = tarif standard (80€ pour 2 jours)

### Cas 3: Livraison imperative samedi
1. Choisir livraison samedi
2. Cocher "Livraison imperative"
3. Verifier: +50€ majoration affichee

### Cas 4: Livraison non imperative samedi
1. Choisir livraison samedi
2. Ne pas cocher "Livraison imperative"
3. Verifier: message "nous vous contacterons" affiche

### Cas 5: Jour ferie (25 decembre)
1. Choisir livraison 25 decembre
2. Cocher "Livraison imperative"
3. Verifier: +50€ majoration jour ferie

## Configuration future

Les constantes sont actuellement hardcodees:
- `WEEKEND_DELIVERY_SURCHARGE = 50`
- `HOLIDAY_SURCHARGE = 50`
- `DEFAULT_WEEKEND_FLAT_PRICE = 125` (fallback non utilise)

Pour les rendre configurables, creer une table `pricing_settings` ou utiliser les settings admin.

## Extension possible

1. **Forfait par categorie**: Ajouter `weekend_flat_price` sur `categories`
2. **Majorations variables**: Pourcentage au lieu de montant fixe
3. **Calendrier de prix**: Prix differents selon saison
4. **Remises automatiques**: Multi-produits, fidelite, etc.
