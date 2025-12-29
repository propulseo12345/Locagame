/**
 * Script pour mettre à jour les images de tous les produits
 * Utilise le MCP stock-images-mcp pour rechercher des images appropriées
 * 
 * Usage: Ce script doit être exécuté depuis Cursor avec accès au MCP
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping de mots-clés pour améliorer les recherches
const keywordMapping = {
  'baby foot': 'foosball table',
  'billard': 'pool table',
  'roulette': 'roulette wheel casino',
  'flipper': 'pinball machine',
  'vr': 'virtual reality headset',
  'nintendo': 'nintendo console',
  'playstation': 'playstation console',
  'xbox': 'xbox console',
  'casino': 'casino game table',
  'poker': 'poker table',
  'black jack': 'blackjack table',
  'jenga': 'jenga tower game',
  'twister': 'twister game',
  'puissance 4': 'connect four game',
  'morpion': 'tic tac toe game',
  'jeu de dames': 'checkers game',
  'échec': 'chess game',
  'ping pong': 'table tennis',
  'basket': 'basketball',
  'foot': 'soccer football',
  'volley': 'volleyball',
  'pétanque': 'petanque boules',
  'molkky': 'molkky game',
  'corn hole': 'cornhole game',
  'arcade': 'arcade machine',
  'borne': 'arcade machine',
  'projecteur': 'projector',
  'écran': 'screen display',
  'tapis': 'carpet rug',
  'rideau': 'curtain',
  'décoration': 'decoration',
  'costume': 'costume',
  'silhouette': 'silhouette cutout',
};

function cleanProductName(name) {
  let cleaned = name
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\d+x\d+/g, '') // Retirer les dimensions
    .replace(/\d+cm/g, '')
    .replace(/\d+m/g, '')
    .trim();
  
  return cleaned;
}

function generateSearchQuery(name) {
  const cleaned = cleanProductName(name).toLowerCase();
  
  // Chercher des correspondances dans le mapping
  for (const [key, value] of Object.entries(keywordMapping)) {
    if (cleaned.includes(key)) {
      return value;
    }
  }
  
  // Sinon, utiliser les mots significatifs du nom
  const stopWords = ['sur', 'avec', 'sans', 'pour', 'de', 'la', 'le', 'les', 'des', 'du', 'et', 'ou', 'cm', 'x', 'geant', 'géant', 'xxl', 'xl', 'small', 'pro', 'pack', 'set'];
  const words = cleaned.split(/\s+/).filter(word => 
    word.length > 2 && !stopWords.includes(word.toLowerCase())
  );
  
  return words.slice(0, 4).join(' ');
}

async function updateProductImage(productId, imageUrl) {
  const { error } = await supabase
    .from('products')
    .update({ 
      images: [imageUrl],
      updated_at: new Date().toISOString()
    })
    .eq('id', productId);

  return !error;
}

async function processAllProducts() {
  console.log('🚀 Démarrage du traitement de tous les produits...\n');

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')
      .order('name');

    if (error) throw error;

    if (!products || products.length === 0) {
      console.log('❌ Aucun produit trouvé');
      return;
    }

    console.log(`📦 ${products.length} produits trouvés\n`);

    // Générer le mapping des requêtes de recherche
    const searchMappings = products.map(product => ({
      id: product.id,
      name: product.name,
      searchQuery: generateSearchQuery(product.name),
      hasImage: product.images && product.images.length > 0
    }));

    // Sauvegarder le mapping
    const fs = await import('fs');
    fs.writeFileSync(
      join(__dirname, 'product-search-mappings.json'),
      JSON.stringify(searchMappings, null, 2)
    );

    console.log('✅ Fichier product-search-mappings.json créé');
    console.log(`   ${searchMappings.length} produits avec leurs requêtes de recherche\n`);
    
    const withoutImages = searchMappings.filter(p => !p.hasImage);
    console.log(`📊 Statistiques:`);
    console.log(`   - Produits avec images: ${searchMappings.length - withoutImages.length}`);
    console.log(`   - Produits sans images: ${withoutImages.length}\n`);

    console.log('📝 Prochaines étapes:');
    console.log('   1. Utilisez le MCP stock-images-mcp pour rechercher des images');
    console.log('   2. Utilisez les requêtes de recherche du fichier JSON');
    console.log('   3. Mettez à jour les produits avec les URLs d\'images trouvées\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

processAllProducts();
