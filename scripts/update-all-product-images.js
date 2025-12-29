import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour nettoyer le nom du produit pour la recherche
function cleanProductName(name) {
  let cleaned = name
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .trim();
  
  const stopWords = ['sur', 'avec', 'sans', 'pour', 'de', 'la', 'le', 'les', 'des', 'du', 'et', 'ou', 'cm', 'x'];
  const words = cleaned.split(/\s+/).filter(word => 
    word.length > 2 && !stopWords.includes(word.toLowerCase())
  );
  
  return words.slice(0, 4).join(' ');
}

// Fonction pour mettre à jour un produit avec une image
async function updateProductImage(productId, imageUrl) {
  const { error } = await supabase
    .from('products')
    .update({ 
      images: [imageUrl],
      updated_at: new Date().toISOString()
    })
    .eq('id', productId);

  if (error) {
    console.error(`  ❌ Erreur lors de la mise à jour: ${error.message}`);
    return false;
  }
  return true;
}

async function processProducts() {
  console.log('🚀 Démarrage de la mise à jour des images des produits...\n');

  try {
    // Récupérer tous les produits
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')
      .order('name');

    if (error) {
      throw error;
    }

    if (!products || products.length === 0) {
      console.log('❌ Aucun produit trouvé');
      return;
    }

    console.log(`📦 ${products.length} produits trouvés\n`);
    console.log('⚠️  Ce script génère un fichier JSON avec les requêtes de recherche.');
    console.log('   Utilisez le MCP stock-images-mcp dans Cursor pour rechercher les images.\n');

    // Générer les données pour chaque produit
    const productsData = products.map((product, index) => {
      const searchQuery = cleanProductName(product.name);
      return {
        index: index + 1,
        id: product.id,
        name: product.name,
        searchQuery: searchQuery,
        currentImages: product.images || []
      };
    });

    // Sauvegarder dans un fichier JSON
    const fs = await import('fs');
    fs.writeFileSync(
      join(__dirname, 'products-image-mapping.json'),
      JSON.stringify(productsData, null, 2)
    );

    console.log('✅ Fichier products-image-mapping.json créé');
    console.log(`   ${products.length} produits prêts pour la mise à jour\n`);
    console.log('📝 Instructions:');
    console.log('   1. Utilisez le MCP stock-images-mcp pour rechercher une image pour chaque produit');
    console.log('   2. Utilisez la fonction updateProductImage() pour mettre à jour chaque produit');
    console.log('   3. Ou utilisez SQL directement pour mettre à jour en masse\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

processProducts();
