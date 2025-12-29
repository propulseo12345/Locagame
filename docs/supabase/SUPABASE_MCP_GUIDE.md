# 🚀 Guide d'utilisation MCP Supabase

Ce projet utilise les outils MCP (Model Context Protocol) Supabase pour les opérations d'administration et de vérification.

## 📋 Configuration

**Project ID**: `koqdpkkuarbjiimkopei`  
**URL**: `https://koqdpkkuarbjiimkopei.supabase.co`

## 🔧 Utilisation des outils MCP

Les outils MCP Supabase sont utilisés par l'assistant IA pour :
- ✅ Vérifier les tables et leur structure
- ✅ Exécuter des requêtes SQL de diagnostic
- ✅ Vérifier les politiques RLS (Row Level Security)
- ✅ Créer des migrations
- ✅ Vérifier les advisors de sécurité
- ✅ Gérer les branches de développement

## 📊 État actuel du projet

### Tables principales
- ✅ **products**: 243 produits (tous actifs)
- ✅ **categories**: 8 catégories
- ✅ **delivery_zones**: 14 zones
- ✅ **customers**: 17 clients
- ✅ **reservations**: 20 réservations
- ✅ **technicians**: 5 techniciens
- ✅ **vehicles**: 4 véhicules

### Politiques RLS
- ✅ **products**: Lecture publique pour produits actifs (`is_active = true`)
- ✅ **categories**: Lecture publique pour tous
- ✅ Les autres tables ont des politiques appropriées

## 🔍 Commandes MCP utiles

### Vérifier les tables
```typescript
// Via MCP (utilisé par l'assistant)
mcp_supabase_Locagame_Propulseo_list_tables(project_id: "koqdpkkuarbjiimkopei")
```

### Exécuter une requête SQL
```typescript
// Via MCP (utilisé par l'assistant)
mcp_supabase_Locagame_Propulseo_execute_sql(
  project_id: "koqdpkkuarbjiimkopei",
  query: "SELECT COUNT(*) FROM products WHERE is_active = true"
)
```

### Vérifier les advisors de sécurité
```typescript
// Via MCP (utilisé par l'assistant)
mcp_supabase_Locagame_Propulseo_get_advisors(
  project_id: "koqdpkkuarbjiimkopei",
  type: "security"
)
```

## ⚠️ Important

**Le code de l'application continue d'utiliser le client Supabase standard** (`@supabase/supabase-js`) car :
- Les outils MCP ne sont accessibles que depuis l'environnement de l'assistant
- Le navigateur ne peut pas accéder aux outils MCP
- Le client Supabase standard fonctionne parfaitement pour l'application

Les outils MCP sont utilisés pour :
- ✅ Administration et maintenance
- ✅ Vérifications et diagnostics
- ✅ Création de migrations
- ✅ Gestion des branches de développement

## 🔐 Variables d'environnement

Le fichier `.env` contient :
```env
VITE_SUPABASE_URL=https://koqdpkkuarbjiimkopei.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Ces variables sont utilisées par le client Supabase dans `src/lib/supabase.ts`.

## 📝 Notes

- Le Project ID est stocké dans ce fichier pour référence
- Les outils MCP utilisent automatiquement le bon projet via la configuration
- Pour les opérations courantes, continuez d'utiliser le client Supabase standard dans le code
