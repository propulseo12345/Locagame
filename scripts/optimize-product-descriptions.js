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

// Fonction pour décoder les entités HTML
function decodeHtmlEntities(text) {
  if (!text) return '';
  
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&agrave;/g, 'à')
    .replace(/&acirc;/g, 'â')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&icirc;/g, 'î')
    .replace(/&ucirc;/g, 'û')
    .replace(/&uuml;/g, 'ü')
    .replace(/&ouml;/g, 'ö')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Fonction pour retirer les guillemets au début et à la fin
function removeQuotes(text) {
  if (!text) return '';
  
  let cleaned = text.trim();
  
  // Retirer les guillemets au début
  if (cleaned.startsWith('"')) {
    cleaned = cleaned.substring(1);
  }
  
  // Retirer les guillemets à la fin
  if (cleaned.endsWith('"')) {
    cleaned = cleaned.substring(0, cleaned.length - 1);
  }
  
  return cleaned.trim();
}

// Fonction pour optimiser la description en tant que copywriter expert
function optimizeDescription(name, description) {
  if (!description) return '';
  
  // Nettoyer la description
  let optimized = decodeHtmlEntities(description);
  optimized = removeQuotes(optimized);
  optimized = optimized.trim();
  
  // Si la description est vide ou très courte, créer une description optimisée
  if (!optimized || optimized.length < 10) {
    // Créer une description basée sur le nom du produit
    optimized = `Location de ${name}. Produit de qualité professionnelle, parfait pour vos événements et animations.`;
    return optimized;
  }
  
  // Améliorer les descriptions existantes
  // Retirer les préfixes inutiles comme "Location de" si déjà présent
  if (optimized.toLowerCase().startsWith('location de ')) {
    optimized = optimized.substring(13);
  }
  
  // Capitaliser la première lettre
  if (optimized.length > 0) {
    optimized = optimized.charAt(0).toUpperCase() + optimized.slice(1);
  }
  
  // S'assurer que la description se termine par un point si elle est complète
  if (optimized.length > 50 && !optimized.endsWith('.') && !optimized.endsWith('!') && !optimized.endsWith('?')) {
    // Ne pas ajouter de point si la description semble tronquée
    if (!optimized.endsWith('...') && !optimized.endsWith('&nbsp')) {
      optimized += '.';
    }
  }
  
  return optimized;
}

async function optimizeAllDescriptions() {
  console.log('🚀 Démarrage de l\'optimisation des descriptions...\n');

  try {
    // Récupérer tous les produits avec leurs descriptions
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description')
      .order('name');

    if (error) {
      throw error;
    }

    if (!products || products.length === 0) {
      console.log('❌ Aucun produit trouvé');
      return;
    }

    console.log(`📦 ${products.length} produits trouvés\n`);

    // Préparer les mises à jour
    const updates = [];
    let updatedCount = 0;

    for (const product of products) {
      const originalDescription = product.description || '';
      const optimizedDescription = optimizeDescription(product.name, originalDescription);
      
      // Ne mettre à jour que si la description a changé
      if (optimizedDescription !== originalDescription) {
        updates.push({
          id: product.id,
          name: product.name,
          original: originalDescription,
          optimized: optimizedDescription
        });
        updatedCount++;
      }
    }

    console.log(`📝 ${updatedCount} descriptions à optimiser\n`);

    // Mettre à jour par lots de 50 pour éviter les limites
    const batchSize = 50;
    let processed = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      // Créer les requêtes SQL pour ce lot
      const sqlQueries = batch.map(update => {
        // Échapper les apostrophes pour SQL
        const escapedDescription = update.optimized.replace(/'/g, "''");
        return `UPDATE products SET description = '${escapedDescription}' WHERE id = '${update.id}';`;
      });

      // Exécuter les mises à jour
      for (const update of batch) {
        const { error } = await supabase
          .from('products')
          .update({ 
            description: update.optimized,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);

        if (error) {
          console.error(`❌ Erreur pour ${update.name}: ${error.message}`);
        } else {
          processed++;
          if (processed % 10 === 0) {
            console.log(`  ✓ ${processed}/${updatedCount} descriptions mises à jour...`);
          }
        }
      }
    }

    console.log(`\n✅ ${processed} descriptions optimisées avec succès !\n`);

    // Afficher quelques exemples
    console.log('📋 Exemples de descriptions optimisées :\n');
    updates.slice(0, 5).forEach(update => {
      console.log(`  ${update.name}:`);
      console.log(`    Avant: ${update.original.substring(0, 60)}...`);
      console.log(`    Après: ${update.optimized.substring(0, 60)}...\n`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

optimizeAllDescriptions();
