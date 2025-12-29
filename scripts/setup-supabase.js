import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables SUPABASE manquantes dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Démarrage du setup Supabase...\n');

// Fonction pour exécuter du SQL
async function executeSql(sql, description) {
  console.log(`📝 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.error(`❌ Erreur: ${error.message}`);
      return false;
    }
    console.log(`✅ ${description} - OK\n`);
    return true;
  } catch (err) {
    console.error(`❌ Erreur: ${err.message}\n`);
    return false;
  }
}

// Créer les catégories
async function seedCategories() {
  console.log('📦 Insertion des catégories...');

  const categories = [
    { name: 'Casino', slug: 'casino', description: 'Tables de jeu professionnelles pour une soirée casino réussie', display_order: 1, icon: '🎰' },
    { name: 'Jeux de Bar', slug: 'jeux-de-bar', description: 'Baby-foot, billard, fléchettes et autres jeux conviviaux', display_order: 2, icon: '🎯' },
    { name: 'Jeux Vidéo', slug: 'jeux-video', description: 'Consoles, bornes d\'arcade et jeux vidéo rétro', display_order: 3, icon: '🎮' },
    { name: 'Animations', slug: 'animations', description: 'Structures gonflables et animations pour événements', display_order: 4, icon: '🎪' },
    { name: 'Événements', slug: 'evenements', description: 'Équipements pour vos événements professionnels', display_order: 5, icon: '🎉' },
    { name: 'Extérieur', slug: 'exterieur', description: 'Jeux géants et activités outdoor', display_order: 6, icon: '🌳' },
    { name: 'Réalité Virtuelle', slug: 'realite-virtuelle', description: 'Casques VR et expériences immersives', display_order: 7, icon: '🥽' },
    { name: 'Décoration', slug: 'decoration', description: 'Éléments de décoration thématiques', display_order: 8, icon: '✨' }
  ];

  for (const cat of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Erreur pour ${cat.name}: ${error.message}`);
    } else {
      console.log(`✅ Catégorie ${cat.name} créée`);
    }
  }
  console.log('');
}

// Créer les zones de livraison
async function seedDeliveryZones() {
  console.log('🚚 Insertion des zones de livraison...');

  const zones = [
    {
      name: 'Marseille et périphérie',
      postal_codes: ['13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008', '13009', '13010', '13011', '13012', '13013', '13014', '13015', '13016'],
      cities: ['Marseille'],
      delivery_fee: 0,
      free_delivery_threshold: 0,
      estimated_delivery_time: '2-4 heures',
      is_active: true
    },
    {
      name: 'Bouches-du-Rhône Ouest',
      postal_codes: ['13220', '13127', '13320', '13500', '13800', '13170', '13140'],
      cities: ['Châteauneuf-les-Martigues', 'Vitrolles', 'Bouc-Bel-Air', 'Martigues', 'Istres', 'Les Pennes-Mirabeau', 'Miramas'],
      delivery_fee: 45,
      free_delivery_threshold: 300,
      estimated_delivery_time: '4-6 heures',
      is_active: true
    },
    {
      name: 'Bouches-du-Rhône Est',
      postal_codes: ['13400', '13600', '13390', '13120', '13011', '13009'],
      cities: ['Aubagne', 'La Ciotat', 'Auriol', 'Gardanne', 'Plan-de-Cuques', 'Allauch'],
      delivery_fee: 45,
      free_delivery_threshold: 300,
      estimated_delivery_time: '4-6 heures',
      is_active: true
    },
    {
      name: 'Aix-en-Provence et environs',
      postal_codes: ['13080', '13090', '13100', '13290', '13540'],
      cities: ['Aix-en-Provence'],
      delivery_fee: 55,
      free_delivery_threshold: 350,
      estimated_delivery_time: '6-8 heures',
      is_active: true
    },
    {
      name: 'Var',
      postal_codes: ['83000', '83100', '83200', '83300', '83400', '83500', '83600'],
      cities: ['Toulon', 'Draguignan', 'Hyères', 'La Seyne-sur-Mer', 'Fréjus'],
      delivery_fee: 85,
      free_delivery_threshold: 500,
      estimated_delivery_time: 'Jour suivant',
      is_active: true
    },
    {
      name: 'Alpes-Maritimes',
      postal_codes: ['06000', '06100', '06200', '06300', '06400', '06500'],
      cities: ['Nice', 'Cannes', 'Menton'],
      delivery_fee: 120,
      free_delivery_threshold: 600,
      estimated_delivery_time: 'Jour suivant',
      is_active: true
    },
    {
      name: 'Vaucluse',
      postal_codes: ['84000', '84100', '84200', '84300', '84400'],
      cities: ['Avignon', 'Orange', 'Carpentras', 'Cavaillon', 'Apt'],
      delivery_fee: 95,
      free_delivery_threshold: 500,
      estimated_delivery_time: 'Jour suivant',
      is_active: true
    }
  ];

  for (const zone of zones) {
    const { error } = await supabase
      .from('delivery_zones')
      .upsert(zone, { onConflict: 'name' });

    if (error) {
      console.error(`❌ Erreur pour ${zone.name}: ${error.message}`);
    } else {
      console.log(`✅ Zone ${zone.name} créée`);
    }
  }
  console.log('');
}

// Créer les produits
async function seedProducts() {
  console.log('🎮 Insertion des produits...');

  // Récupérer l'ID des catégories
  const { data: categories } = await supabase.from('categories').select('id, slug');

  const categoryMap = {};
  categories?.forEach(cat => {
    categoryMap[cat.slug] = cat.id;
  });

  const products = [
    {
      category_id: categoryMap['casino'],
      name: 'Table de Roulette Professionnelle',
      slug: 'table-roulette-pro',
      description: 'Table de roulette professionnelle avec roue en bois massif et tapis de jeu en feutrine verte. Installation et explication des règles incluses.',
      specifications: {
        dimensions: { length: 200, width: 120, height: 90 },
        weight: 85,
        players: { min: 1, max: 8 },
        power_requirements: 'Aucune',
        setup_time: 30
      },
      pricing: {
        oneDay: 180,
        weekend: 320,
        week: 550,
        customDurations: []
      },
      total_stock: 3,
      images: ['https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800'],
      is_active: true,
      featured: true
    },
    {
      category_id: categoryMap['casino'],
      name: 'Table de Blackjack Premium',
      slug: 'table-blackjack-premium',
      description: 'Table de blackjack semi-circulaire pour 7 joueurs avec sabot professionnel et jetons inclus.',
      specifications: {
        dimensions: { length: 210, width: 130, height: 90 },
        weight: 75,
        players: { min: 1, max: 7 },
        power_requirements: 'Aucune',
        setup_time: 25
      },
      pricing: {
        oneDay: 150,
        weekend: 270,
        week: 480,
        customDurations: []
      },
      total_stock: 5,
      images: ['https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800'],
      is_active: true,
      featured: true
    },
    {
      category_id: categoryMap['jeux-de-bar'],
      name: 'Baby-foot Professionnel Bonzini',
      slug: 'babyfoot-bonzini',
      description: 'Baby-foot professionnel de compétition Bonzini B90 avec barres télescopiques et balles officielles.',
      specifications: {
        dimensions: { length: 150, width: 75, height: 90 },
        weight: 90,
        players: { min: 2, max: 4 },
        power_requirements: 'Aucune',
        setup_time: 15
      },
      pricing: {
        oneDay: 80,
        weekend: 140,
        week: 250,
        customDurations: []
      },
      total_stock: 8,
      images: ['https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800'],
      is_active: true,
      featured: true
    },
    {
      category_id: categoryMap['jeux-video'],
      name: 'Borne d\'Arcade Rétro Multijeux',
      slug: 'borne-arcade-retro',
      description: 'Borne d\'arcade avec plus de 3000 jeux rétro (Pac-Man, Street Fighter, etc.) et design vintage authentique.',
      specifications: {
        dimensions: { length: 70, width: 80, height: 180 },
        weight: 120,
        players: { min: 1, max: 2 },
        power_requirements: '220V - 300W',
        setup_time: 20
      },
      pricing: {
        oneDay: 120,
        weekend: 210,
        week: 380,
        customDurations: []
      },
      total_stock: 6,
      images: ['https://images.unsplash.com/photo-1577003833154-a6e6c2a00c4f?w=800'],
      is_active: true,
      featured: true
    },
    {
      category_id: categoryMap['exterieur'],
      name: 'Jeu de Pétanque Géant',
      slug: 'petanque-geante',
      description: 'Boules de pétanque géantes gonflables pour des parties amusantes en extérieur. Inclut 6 boules et 1 cochonnet.',
      specifications: {
        dimensions: { diameter: 50 },
        weight: 5,
        players: { min: 2, max: 12 },
        power_requirements: 'Aucune',
        setup_time: 10
      },
      pricing: {
        oneDay: 45,
        weekend: 75,
        week: 130,
        customDurations: []
      },
      total_stock: 10,
      images: ['https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800'],
      is_active: true,
      featured: false
    },
    {
      category_id: categoryMap['realite-virtuelle'],
      name: 'Pack VR Meta Quest 3',
      slug: 'vr-meta-quest-3',
      description: 'Pack complet de réalité virtuelle avec casque Meta Quest 3, manettes et sélection de jeux premium.',
      specifications: {
        dimensions: { length: 20, width: 15, height: 10 },
        weight: 1,
        players: { min: 1, max: 1 },
        power_requirements: 'Batterie rechargeable',
        setup_time: 5
      },
      pricing: {
        oneDay: 90,
        weekend: 160,
        week: 290,
        customDurations: []
      },
      total_stock: 4,
      images: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800'],
      is_active: true,
      featured: true
    }
  ];

  for (const product of products) {
    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Erreur pour ${product.name}: ${error.message}`);
    } else {
      console.log(`✅ Produit ${product.name} créé`);
    }
  }
  console.log('');
}

// Fonction principale
async function main() {
  try {
    // Vérifier la connexion
    const { data, error } = await supabase.from('categories').select('count');
    if (error) {
      console.error('❌ Erreur de connexion Supabase:', error.message);
      console.log('\n💡 Assurez-vous que les tables existent. Exécutez les migrations SQL d\'abord.\n');
      process.exit(1);
    }

    console.log('✅ Connexion Supabase OK\n');

    // Seed data
    await seedCategories();
    await seedDeliveryZones();
    await seedProducts();

    console.log('🎉 Setup Supabase terminé avec succès!\n');

    // Afficher les stats
    const { data: categoriesCount } = await supabase.from('categories').select('count');
    const { data: zonesCount } = await supabase.from('delivery_zones').select('count');
    const { data: productsCount } = await supabase.from('products').select('count');

    console.log('📊 Statistiques:');
    console.log(`   - Catégories: ${categoriesCount?.[0]?.count || 0}`);
    console.log(`   - Zones de livraison: ${zonesCount?.[0]?.count || 0}`);
    console.log(`   - Produits: ${productsCount?.[0]?.count || 0}`);
    console.log('');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

main();
