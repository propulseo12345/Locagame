# Audit pré-production LOCAGAME — 2026-03-04

---

## 🔴 BLOQUANTS (à corriger avant mise en ligne)

### SEC-01 : Policies RLS anon trop permissives — Fuite de données clients
**Tables concernées :** `customers`, `reservations`, `reservation_items`

Ces 3 tables ont des policies SELECT pour le rôle `anon` avec `qual = true`, ce qui signifie que **n'importe qui sans authentification peut lire TOUTES les données** :

| Table | Policy | Risque |
|-------|--------|--------|
| `customers` | `customers_anon_select_for_reservation` | Emails, téléphones, noms, SIRET, stripe_customer_id de TOUS les clients |
| `reservations` | `reservations_anon_select_by_id` | Toutes les réservations : montants, adresses de livraison, données événement, payment_intent_id |
| `reservation_items` | `reservation_items_anon_select` | Tous les articles réservés avec prix |

**Impact :** Faille RGPD majeure. Données personnelles accessibles publiquement via l'API Supabase.

**Correction :**
```sql
-- Supprimer les policies anon trop permissives
DROP POLICY IF EXISTS "customers_anon_select_for_reservation" ON customers;
DROP POLICY IF EXISTS "reservations_anon_select_by_id" ON reservations;
DROP POLICY IF EXISTS "reservation_items_anon_select" ON reservation_items;

-- Si le guest checkout a besoin d'un accès anon, le limiter au strict nécessaire
-- via une RPC côté serveur (déjà le cas avec create_guest_checkout)
```

---

### SEC-02 : Edge Function `create-checkout-session` — verify_jwt: false
**Fichier :** Edge Function `create-checkout-session`

Cette fonction est accessible **sans authentification**. Un attaquant peut :
1. Envoyer un `reservation_id` arbitraire
2. Créer des sessions Stripe pour n'importe quelle réservation
3. La fonction vérifie seulement `status === 'pending_payment'`, pas que l'appelant est le propriétaire

**Note :** La fonction utilise `SUPABASE_SERVICE_ROLE_KEY` côté serveur (légitime), mais l'absence de JWT signifie qu'elle est publique.

**Correction :** Activer `verify_jwt: true` et vérifier que `auth.uid() === reservation.customer_id` dans la fonction, OU vérifier l'ownership dans le code de la fonction elle-même.

---

### SEC-03 : Credentials hardcodés dans `.claude/settings.local.json`
**Fichier :** `.claude/settings.local.json`

Contient en clair :
- Mot de passe PostgreSQL : `Locagame12345@`
- Clé `SUPABASE_SERVICE_ROLE_KEY` complète
- Clé `SUPABASE_ANON_KEY` complète

**Action :** Supprimer les credentials de ce fichier. Régénérer les clés Supabase si ce fichier a été partagé.

---

### ~~SEC-04 : Leaked Password Protection désactivée~~ ✅ CORRIGÉ
**Source :** Supabase Security Advisor

La protection contre les mots de passe compromis (HaveIBeenPwned) était désactivée.

**Correction appliquée :** Activée manuellement dans Supabase Dashboard > Authentication > Settings > Password Security > Enable Leaked Password Protection (2026-03-04).

---

### SEC-05 : `vercel.json` manquant — SPA routing cassé en production
**Impact :** Toutes les routes React (ex: `/catalogue`, `/produit/xxx`, `/admin/dashboard`) retourneront une **erreur 404** si l'utilisateur rafraîchit la page ou accède directement par URL.

**Correction :** Créer `vercel.json` à la racine :
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### SEC-06 : Suppression de compte non fonctionnelle (obligation RGPD)
**Fichier :** `src/components/client/profile/DangerZone.tsx`

Le bouton "Supprimer mon compte" existe visuellement mais **n'a aucun handler onClick**. Obligation légale RGPD (droit à l'effacement, art. 17).

**Correction :** Implémenter la suppression avec confirmation, appel RPC côté serveur, et suppression des données associées.

---

### FRONT-01 : Produits à prix 0 ajoutables au panier
**Fichiers :** `useProductPage.ts`, `CartContext.tsx`

30 produits actifs ont `pricing.oneDay = 0`. Aucune validation n'empêche de les ajouter au panier et de passer au checkout avec un montant de 0€.

**Correction :** Bloquer l'ajout au panier si `pricing.oneDay <= 0` ou désactiver ces produits.

---

### FRONT-02 : 239 produits actifs sans images
**Base de données :** 239 produits sur 482 actifs n'ont aucune image.

Le catalogue affichera soit un placeholder soit une image cassée. En production, cela donne une impression de site non fini.

**Correction :** Soit ajouter les images, soit désactiver ces produits (`is_active = false`), soit s'assurer qu'un placeholder élégant est affiché.

---

## 🟡 IMPORTANTS (à corriger rapidement après lancement)

### SEC-07 : Functions search_path mutable
**Source :** Supabase Security Advisor

4 fonctions n'ont pas de `search_path` fixe :
- `clean_description`
- `optimize_description`
- `format_product_name`
- `is_admin`

**Risque :** Vulnérabilité potentielle de search_path injection.

**Correction :** Ajouter `SET search_path = public` à chaque fonction.

Ref: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

---

### FRONT-03 : Pas de protection double-clic sur le bouton de paiement
**Fichier :** `src/pages/CheckoutPage.tsx` (~ligne 200)

Le bouton a `disabled={isProcessing}` mais pas de debounce. Un clic rapide avant que `isProcessing` soit mis à `true` pourrait créer 2 sessions Stripe.

**Correction :** Ajouter un state `submitting` avec verrouillage immédiat, ou un `useRef` pour bloquer le double-clic.

---

### FRONT-04 : Aucun email transactionnel implémenté
**Impact :** Le checkout promet "Vous recevrez une confirmation par email" mais aucun service d'email n'est intégré :
- Pas de confirmation d'inscription
- Pas de confirmation de réservation/paiement
- Pas de rappel avant événement
- Les templates Supabase Auth (reset password) sont probablement par défaut

**Correction :** Intégrer Resend ou un autre service (Edge Function ou trigger DB) pour les emails critiques.

---

### FRONT-05 : Page de confirmation accessible sans vérification
**Fichier :** `src/pages/ConfirmationPage.tsx`

N'importe qui peut naviguer vers `/confirmation/:reservationId`. La page charge les données via Supabase (protégé par RLS pour les clients authentifiés), mais un utilisateur anon pourrait voir les détails de réservation si la policy anon SELECT reste en place (voir SEC-01).

**Correction :** Vérifier que l'utilisateur connecté est bien le propriétaire de la réservation.

---

### FRONT-06 : Abandon de paiement — réservation bloquée
**Fichier :** `src/hooks/checkout/useCheckoutSubmit.ts`

Si l'utilisateur ferme le navigateur pendant le paiement Stripe, la réservation reste en `pending_payment` indéfiniment. Le webhook `checkout.session.expired` gère l'expiration automatique (30 min), mais :
- Pas de cron/mécanisme pour nettoyer les réservations orphelines plus anciennes
- Le stock reste bloqué pendant 30 minutes

**Correction :** Le webhook `checkout.session.expired` est déjà implémenté. Vérifier qu'il fonctionne correctement en production. Considérer un cleanup périodique.

---

### FRONT-07 : Données de test en base de production
**Table customers :**
| Email | Nom | Type |
|-------|-----|------|
| `client@exemple.fr` | test test | Compte de test |
| `test@gmail;com` | test test | Guest avec email invalide |

**Correction :** Supprimer ces entrées avant la mise en production.

---

### FRONT-08 : Dépendances circulaires dans le build
**Build Vite :** 3 avertissements de dépendances circulaires :
1. `availabilityCheck.ts` ↔ `availability.ts` (2 exports)
2. `checkout.service.ts` ↔ `services/index.ts`

**Impact :** Peut causer des bugs d'exécution imprévisibles en production.

**Correction :** Importer directement depuis le module source au lieu du barrel export.

---

### PERF-01 : Chunk AdminProducts trop volumineux
**Build output :** `AdminProducts-CeD1EX89.js` = **448.80 KB** (gzip: 145.48 KB)

Probablement dû à la librairie `xlsx` importée entièrement.

**Correction :** Import dynamique de `xlsx` uniquement quand l'utilisateur clique sur l'export Excel.

---

### SEO-01 : Lien politique de confidentialité manquant dans le footer
**Fichier :** `src/components/Footer.tsx`

Le footer a des liens vers CGV et Mentions légales mais pas vers `/confidentialite`.

**Correction :** Ajouter le lien dans la section "Informations" du footer.

---

### DB-01 : Index dupliqués
**Source :** Supabase Performance Advisor

| Table | Index dupliqués |
|-------|----------------|
| `addresses` | `idx_addresses_customer` = `idx_addresses_customer_id` |
| `delivery_tasks` | `idx_delivery_tasks_reservation` = `idx_delivery_tasks_reservation_id` |
| `delivery_tasks` | `idx_delivery_tasks_technician` = `idx_delivery_tasks_technician_id` |
| `reservations` | `idx_reservations_customer` = `idx_reservations_customer_id` |

**Correction :** Supprimer les doublons pour économiser de l'espace et améliorer les performances d'écriture.

---

### DB-02 : Foreign keys sans index
**Source :** Supabase Performance Advisor

| Table | FK sans index |
|-------|--------------|
| `payments` | `payments_reservation_id_fkey` |
| `product_availability` | `product_availability_reservation_id_fkey` |
| `reservation_items` | `reservation_items_product_id_fkey` |
| `reservations` | `reservations_delivery_address_id_fkey` |

**Correction :** Créer des index sur ces colonnes FK pour de meilleures performances JOIN/DELETE.

---

## 🟢 MINEURS (améliorations futures)

### PERF-02 : Policies RLS avec `auth_rls_initplan`
56 policies utilisent `current_setting()` ou `auth.uid()` d'une manière qui force la réévaluation à chaque ligne. Performance dégradée sur les grosses tables. Optimisation possible mais non bloquante pour le lancement.

### PERF-03 : Policies multiples permissives
De nombreuses tables ont des policies permissives dupliquées pour le même rôle/action (ex: `addresses` a à la fois `addresses_own_select` et `addresses_customer_select`). Consolidation recommandée.

### FRONT-09 : Validation email faible à l'inscription
La regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` accepte des emails invalides comme `test@gmail;com` (présent en base). Considérer une validation plus stricte.

### FRONT-10 : Pas de validation des dates passées sur ProductPage
Le catalogue empêche les dates passées via `min={getTodayString()}` mais la page produit ne le fait pas. Un utilisateur manipulant les paramètres pourrait sélectionner une date passée.

### FRONT-11 : Produits supprimés restant dans le panier localStorage
Si un produit est supprimé de Supabase alors qu'il est dans le panier d'un utilisateur, aucune synchronisation n'est faite. L'utilisateur verra une erreur au checkout.

### FRONT-12 : `console.error` en production
Bien que `console.log` soit supprimé par Terser (`drop_console: true`), `console.error` est conservé. Considérer l'intégration d'un service de monitoring (Sentry).

### DB-03 : 17 index inutilisés
Index créés mais jamais utilisés par les requêtes. Nettoyage possible pour économiser de l'espace.

---

## ✅ Points validés

### Sécurité
- [x] RLS activé sur TOUTES les tables (23 tables)
- [x] Policies admin correctes : `is_user_admin(auth.uid())` sur toutes les tables sensibles
- [x] Policies client : isolation par `customer_id = auth.uid()` sur customers, addresses, favorites
- [x] Policies technicien : accès limité à leurs propres tâches
- [x] `.env` non tracké par git (`.gitignore` correct)
- [x] `.env.example` sans valeurs sensibles
- [x] Clé anon uniquement côté client (`src/lib/supabase.ts`)
- [x] Pas de clé Stripe secrète (`sk_`) dans le code frontend
- [x] Webhook Stripe : vérification de signature correcte
- [x] Webhook Stripe : idempotence via `stripe_event_id`
- [x] Webhook Stripe : gestion `checkout.session.expired` (libère le stock)
- [x] Routes protégées par `ProtectedRoute` avec vérification de rôle server-side
- [x] Rôle utilisateur déterminé par RPC `get_current_user_role()` (non falsifiable)
- [x] Functions `is_user_admin`, `is_user_technician`, `get_technician_id` correctement implémentées
- [x] Service role key utilisée uniquement dans les Edge Functions (côté serveur)
- [x] Mode démo contrôlé par `VITE_ENABLE_DEMO_MODE` (désactivé par défaut)

### Base de données
- [x] Contraintes CHECK sur les champs status (reservations, delivery_tasks, payments)
- [x] Foreign keys correctement définies entre les tables
- [x] Index sur les colonnes fréquemment filtrées (customer_id, status, dates)
- [x] Unique constraints sur email, slug, license_plate
- [x] Contrainte CHECK sur `multi_day_coefficient` (0.50-1.00)
- [x] Statuts de réservation cohérents (paid = confirmed, unpaid = pending/pending_payment)

### Frontend
- [x] ErrorBoundary global sur le Router (`App.tsx`)
- [x] Code splitting par route (lazy loading)
- [x] Vendor splitting (react, supabase, icons)
- [x] Console.log supprimé en production (Terser `drop_console: true`)
- [x] Source maps désactivés en production
- [x] Build réussi sans erreurs TypeScript
- [x] Taille totale du bundle raisonnable (hors AdminProducts)
- [x] Panier vidé après checkout réussi

### SEO & Légal
- [x] Meta tags complets dans `index.html` (title, description, OG, Twitter)
- [x] Composant SEO dynamique par page
- [x] Schema.org : Organization, LocalBusiness, BreadcrumbList, Product
- [x] Sitemap généré dynamiquement (produits + événements)
- [x] `robots.txt` : exclut /admin, /client, /technician, /panier, /checkout
- [x] Page Mentions légales complète (SIREN, hébergeur, DPO)
- [x] Page CGV complète
- [x] Page Politique de confidentialité RGPD
- [x] Cookie banner avec 3 niveaux de consentement
- [x] Checkbox CGV obligatoire au checkout
- [x] Opt-in newsletter optionnel au checkout

### Configuration production
- [x] Vite optimisé (minification, chunking, tree shaking)
- [x] Preconnect/prefetch pour ressources externes
- [x] `index.html` : lang="fr", viewport, favicon, theme-color

---

## Actions recommandées par ordre de priorité

### Avant mise en ligne (bloquants)
1. **SEC-01** — Supprimer les 3 policies RLS anon SELECT sur `customers`, `reservations`, `reservation_items`
2. **SEC-02** — Sécuriser `create-checkout-session` (verify_jwt ou vérification ownership)
3. **SEC-03** — Nettoyer `.claude/settings.local.json` des credentials
4. ~~**SEC-04** — Activer Leaked Password Protection dans Supabase Auth~~ ✅ Fait
5. **SEC-05** — Créer `vercel.json` avec rewrite SPA
6. **FRONT-01** — Bloquer les produits à prix 0 (ajout panier ou désactivation)
7. **FRONT-02** — Désactiver les 239 produits sans images ou ajouter placeholder
8. **SEC-06** — Implémenter la suppression de compte (RGPD art. 17)

### Semaine 1 après lancement
9. **FRONT-03** — Protection double-clic paiement
10. **FRONT-04** — Intégrer un service d'emails transactionnels
11. **FRONT-05** — Vérifier ownership sur page confirmation
12. **FRONT-07** — Supprimer les données de test
13. **FRONT-08** — Corriger les dépendances circulaires
14. **DB-01** — Supprimer les index dupliqués
15. **DB-02** — Ajouter les index FK manquants
16. **SEO-01** — Ajouter lien confidentialité dans le footer

### Mois 1
17. **PERF-01** — Lazy import xlsx dans AdminProducts
18. **FRONT-12** — Intégrer Sentry pour le monitoring d'erreurs
19. **SEC-07** — Fixer le search_path des fonctions DB
20. Consolider les policies RLS dupliquées
