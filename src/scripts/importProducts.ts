import { createClient } from '@supabase/supabase-js'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

// xlsx uses CommonJS export
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  const wb = XLSX.readFile(
    path.resolve('./STOCK MATERIEL POUR SITE (1).xlsx'),
    { cellFormula: false, cellNF: false }
  )
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as any[]
  console.log(`📋 ${rows.length} produits dans le fichier`)

  // Map catégories slug → UUID
  const { data: cats } = await supabase.from('categories').select('id, slug')
  const catMap = new Map(cats?.map(c => [c.slug.toLowerCase().trim(), c.id]))
  console.log('📁 Catégories disponibles :', [...catMap.keys()])

  const products: any[] = []
  const links: { slug: string; catId: string }[] = []
  const warns: string[] = []
  const slugCount = new Map<string, number>()

  for (const row of rows) {
    const name = String(row.name ?? '').trim()
    if (!name) continue

    const rawSlug = String(row.slug ?? row.name ?? '')
    let slug = rawSlug.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // Deduplicate slugs
    const count = slugCount.get(slug) || 0
    slugCount.set(slug, count + 1)
    if (count > 0) slug = `${slug}-${count}`

    const p1  = Number(row.price_one_day) || 0
    const pw  = Number(row.price_weekend) || p1
    const pk  = Number(row.price_week)    || Math.round(p1 * 1.6 * 100) / 100
    const catSlug = String(row.category_id ?? '').toLowerCase().trim()
    const catId   = catMap.get(catSlug)

    if (!catId)  warns.push(`⚠️  Catégorie inconnue "${catSlug}" pour "${name}"`)
    if (p1 === 0) warns.push(`⚠️  Prix = 0€ pour "${name}"`)

    products.push({
      name,
      slug,
      description: String(row['description '] ?? row.description ?? '').trim(),
      pricing: { oneDay: p1, weekend: pw, week: pk, custom: p1, customDurations: [] },
      total_stock: Number(row.total_stock) || 0,
      is_active: true,
      images: [],
      multi_day_coefficient: 1.0,
      delivery_people_count: 1,
      pickup_people_count: 1,
    })

    if (catId) links.push({ slug, catId })
  }

  warns.forEach(w => console.log(w))

  // Insert par batch de 50
  let done = 0
  for (let i = 0; i < products.length; i += 50) {
    const batch = products.slice(i, i + 50)
    const { data, error } = await supabase
      .from('products')
      .insert(batch)
      .select('id, slug')

    if (error) { console.error('Erreur batch:', error.message); continue }

    // Lie les catégories
    const catInserts = (data ?? [])
      .map(p => {
        const link = links.find(l => l.slug === p.slug)
        return link ? { product_id: p.id, category_id: link.catId } : null
      })
      .filter(Boolean)

    if (catInserts.length) {
      await supabase.from('product_categories').insert(catInserts)
    }

    done += batch.length
    console.log(`📦 ${done}/${products.length} insérés`)
  }

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  console.log(`\n✅ TERMINÉ — ${count} produits en base`)
}

run().catch(console.error)
