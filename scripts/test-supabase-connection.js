import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lire le fichier .env manuellement
const envPath = join(__dirname, '..', '.env');
let supabaseUrl, supabaseKey;

try {
  const envContent = readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (err) {
  console.error('❌ Erreur lecture .env:', err.message);
  process.exit(1);
}

console.log('🔍 Test de connexion Supabase\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '✅ Présente' : '❌ Manquante');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables SUPABASE manquantes dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('📡 Test de connexion...\n');

  try {
    // Test 1: Catégories
    console.log('1️⃣  Test: Récupération des catégories');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (catError) {
      console.error('   ❌ Erreur:', catError.message);
      if (catError.code === '42P01') {
        console.error('   💡 La table "categories" n\'existe pas. Exécutez le script SQL d\'abord!');
      }
    } else {
      console.log(`   ✅ ${categories.length} catégories trouvées`);
      categories.forEach(cat => {
        console.log(`      ${cat.icon} ${cat.name}`);
      });
    }
    console.log('');

    // Test 2: Zones de livraison
    console.log('2️⃣  Test: Récupération des zones de livraison');
    const { data: zones, error: zoneError } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('delivery_fee');

    if (zoneError) {
      console.error('   ❌ Erreur:', zoneError.message);
    } else {
      console.log(`   ✅ ${zones.length} zones trouvées`);
      zones.forEach(zone => {
        console.log(`      🚚 ${zone.name} - ${zone.delivery_fee}€`);
      });
    }
    console.log('');

    // Test 3: Produits
    console.log('3️⃣  Test: Récupération des produits');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('name, pricing, total_stock, category:categories(name)')
      .eq('is_active', true);

    if (prodError) {
      console.error('   ❌ Erreur:', prodError.message);
    } else {
      console.log(`   ✅ ${products.length} produits trouvés`);
      products.forEach(prod => {
        const price = prod.pricing?.oneDay || 0;
        const category = prod.category?.name || 'Sans catégorie';
        console.log(`      🎮 ${prod.name} - ${price}€/jour (${category})`);
      });
    }
    console.log('');

    // Test 4: Vérifier les tables vides
    console.log('4️⃣  Test: Vérification des tables vides (normal si aucun utilisateur)');

    const tables = [
      'customers',
      'reservations',
      'technicians',
      'delivery_tasks',
      'customer_favorites'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table}: Erreur - ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count || 0} entrées`);
      }
    }
    console.log('');

    // Résumé
    if (!catError && !zoneError && !prodError) {
      console.log('🎉 SUCCÈS! Toutes les connexions fonctionnent!\n');
      console.log('📊 Résumé:');
      console.log(`   - Catégories: ${categories?.length || 0}`);
      console.log(`   - Zones: ${zones?.length || 0}`);
      console.log(`   - Produits: ${products?.length || 0}`);
      console.log('');
      console.log('✅ Votre application est prête à fonctionner avec Supabase!');
      console.log('');
      console.log('🚀 Prochaines étapes:');
      console.log('   1. Créer des utilisateurs de test dans Supabase Auth');
      console.log('   2. Lancer l\'application: npm run dev');
      console.log('   3. Se connecter et tester les fonctionnalités');
    } else {
      console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
      console.log('');
      console.log('💡 Solutions:');
      console.log('   - Si les tables n\'existent pas: Exécutez supabase/EXECUTE_THIS_SQL.sql');
      console.log('   - Si erreur de permission: Vérifiez les policies RLS');
      console.log('   - Si pas de données: Vérifiez que le seed data s\'est bien exécuté');
    }

  } catch (err) {
    console.error('❌ Erreur lors du test:', err.message);
    process.exit(1);
  }
}

testConnection();
