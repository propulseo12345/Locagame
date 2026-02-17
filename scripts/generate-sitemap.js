import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Config ───────────────────────────────────────────────
const SITE_URL = 'https://www.locagame.fr';
const OUTPUT_PATH = join(__dirname, '..', 'public', 'sitemap.xml');

// Pages statiques avec priorité et fréquence
const STATIC_PAGES = [
  { path: '/',                changefreq: 'daily',   priority: '1.0' },
  { path: '/catalogue',       changefreq: 'daily',   priority: '0.9' },
  { path: '/evenements',      changefreq: 'weekly',  priority: '0.8' },
  { path: '/contact',         changefreq: 'monthly', priority: '0.7' },
  { path: '/a-propos',        changefreq: 'monthly', priority: '0.6' },
  { path: '/cgv',             changefreq: 'yearly',  priority: '0.3' },
  { path: '/mentions-legales', changefreq: 'yearly',  priority: '0.3' },
  { path: '/confidentialite', changefreq: 'yearly',  priority: '0.3' },
];

// ─── Lecture .env ─────────────────────────────────────────
const envPath = join(__dirname, '..', '.env');
let supabaseUrl, supabaseKey;

try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=').slice(1).join('=').trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=').slice(1).join('=').trim();
    }
  }
} catch (err) {
  console.error('Erreur lecture .env:', err.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables SUPABASE manquantes dans .env');
  process.exit(1);
}

// ─── Génération ───────────────────────────────────────────
const supabase = createClient(supabaseUrl, supabaseKey);

function toISODate(date) {
  return date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
}

function buildUrl(loc, lastmod, changefreq, priority) {
  let xml = '  <url>\n';
  xml += `    <loc>${loc}</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += `    <changefreq>${changefreq}</changefreq>\n`;
  xml += `    <priority>${priority}</priority>\n`;
  xml += '  </url>';
  return xml;
}

async function generateSitemap() {
  const today = toISODate();
  const urls = [];

  // 1. Pages statiques
  for (const page of STATIC_PAGES) {
    urls.push(buildUrl(`${SITE_URL}${page.path}`, today, page.changefreq, page.priority));
  }

  // 2. Pages produits dynamiques
  console.log('Chargement des produits...');
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (prodError) {
    console.error('Erreur produits:', prodError.message);
  } else {
    console.log(`  ${products.length} produits actifs`);
    for (const product of products) {
      urls.push(buildUrl(
        `${SITE_URL}/produit/${product.id}`,
        toISODate(product.updated_at),
        'weekly',
        '0.8'
      ));
    }
  }

  // 3. Pages événements dynamiques
  console.log('Chargement des evenements...');
  const { data: events, error: evtError } = await supabase
    .from('portfolio_events')
    .select('id, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (evtError) {
    console.error('Erreur evenements:', evtError.message);
  } else {
    console.log(`  ${events.length} evenements publies`);
    for (const event of events) {
      urls.push(buildUrl(
        `${SITE_URL}/evenements/${event.id}`,
        toISODate(event.created_at),
        'monthly',
        '0.6'
      ));
    }
  }

  // 4. Assemblage XML
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  writeFileSync(OUTPUT_PATH, xml, 'utf8');
  console.log(`\nSitemap genere: ${OUTPUT_PATH}`);
  console.log(`  ${urls.length} URLs totales`);
  console.log(`  - ${STATIC_PAGES.length} pages statiques`);
  console.log(`  - ${products?.length || 0} produits`);
  console.log(`  - ${events?.length || 0} evenements`);
}

generateSitemap().catch((err) => {
  console.error('Erreur generation sitemap:', err);
  process.exit(1);
});
