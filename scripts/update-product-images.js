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
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour nettoyer le nom du produit pour la recherche
function cleanProductName(name) {
  // Retirer les guillemets et caractères spéciaux
  let cleaned = name
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/\(.*?\)/g, '') // Retirer les parenthèses et leur contenu
    .replace(/\[.*?\]/g, '') // Retirer les crochets et leur contenu
    .trim();
  
  // Retirer les mots communs qui ne sont pas utiles pour la recherche
  const stopWords = ['sur', 'avec', 'sans', 'pour', 'de', 'la', 'le', 'les', 'des', 'du', 'et', 'ou'];
  const words = cleaned.split(/\s+/).filter(word => 
    word.length > 2 && !stopWords.includes(word.toLowerCase())
  );
  
  return words.slice(0, 5).join(' '); // Prendre les 5 premiers mots significatifs
}

// Fonction pour rechercher une image via le MCP (simulation - à adapter selon l'API réelle)
// Note: Cette fonction doit être appelée via le MCP dans Cursor, pas directement ici
// Pour l'instant, on va créer une fonction qui sera utilisée manuellement
async function searchImageForProduct(productName) {
  // Cette fonction sera appelée via le MCP stock-images-mcp
  // Pour l'instant, on retourne null et on mettra à jour manuellement
  console.log(`  🔍 Recherche d'image pour: ${productName}`);
  return null;
}

async function updateProductImages() {
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

    // Afficher les 10 premiers produits pour vérification
    console.log('📋 Aperçu des produits (10 premiers):');
    products.slice(0, 10).forEach((product, index) => {
      const cleanedName = cleanProductName(product.name);
      console.log(`  ${index + 1}. ${product.name}`);
      console.log(`     → Recherche: "${cleanedName}"`);
      console.log(`     → Images actuelles: ${product.images?.length || 0}\n`);
    });

    console.log('\n⚠️  NOTE: Ce script prépare les données pour la mise à jour.');
    console.log('   Pour mettre à jour les images, utilisez le MCP stock-images-mcp');
    console.log('   dans Cursor pour rechercher et assigner les images.\n');

    // Générer un fichier JSON avec les produits pour faciliter la mise à jour
    const productsForUpdate = products.map(product => ({
      id: product.id,
      name: product.name,
      searchQuery: cleanProductName(product.name),
      currentImages: product.images || []
    }));

    const fs = await import('fs');
    fs.writeFileSync(
      join(__dirname, 'products-for-image-update.json'),
      JSON.stringify(productsForUpdate, null, 2)
    );

    console.log('✅ Fichier products-for-image-update.json créé avec les données des produits');
    console.log('   Vous pouvez maintenant utiliser ce fichier pour mettre à jour les images via le MCP\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
updateProductImages();
