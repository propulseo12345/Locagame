#!/bin/bash

# Script pour générer les types TypeScript depuis Supabase
# Utilise l'API REST de Supabase pour récupérer les types

PROJECT_ID="koqdpkkuarbjiimkopei"
OUTPUT_FILE="src/lib/database.types.ts"

echo "🔍 Génération des types TypeScript depuis Supabase..."

# Méthode 1 : Via Supabase Dashboard (recommandé)
echo ""
echo "📋 Méthode recommandée :"
echo "1. Aller sur https://supabase.com/dashboard/project/$PROJECT_ID/settings/api"
echo "2. Scroller jusqu'à 'TypeScript types'"
echo "3. Copier le code généré"
echo "4. Coller dans $OUTPUT_FILE"
echo ""

# Méthode 2 : Via CLI (si installé et connecté)
if command -v supabase &> /dev/null; then
    echo "🔧 Tentative via Supabase CLI..."
    npx supabase gen types typescript --project-id $PROJECT_ID > $OUTPUT_FILE 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Types générés avec succès dans $OUTPUT_FILE"
    else
        echo "⚠️  CLI Supabase nécessite une authentification"
        echo "   Exécutez: npx supabase login"
    fi
else
    echo "⚠️  Supabase CLI non installé"
    echo "   Installez avec: npm install -g supabase"
fi

echo ""
echo "✅ Fichier .env configuré avec:"
echo "   - VITE_SUPABASE_URL=https://koqdpkkuarbjiimkopei.supabase.co"
echo "   - VITE_SUPABASE_ANON_KEY=***"

