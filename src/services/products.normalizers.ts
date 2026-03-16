import { Product } from '../types';

export const DEFAULT_SPECIFICATIONS: Product['specifications'] = {
  dimensions: null,
  weight: null,
  players: { min: 1, max: 10 },
  electricity: false,
  setup_time: 0,
};

export const DEFAULT_PRICING: Product['pricing'] = {
  oneDay: 0,
  weekend: 0,
  week: 0,
  custom: 0,
};

/** Normalise un produit brut de Supabase en garantissant specifications/pricing/images */
export function normalizeProduct(raw: any): Product {
  const specs = raw.specifications;
  const pricing = raw.pricing;

  // Extraire les catégories depuis la table de liaison product_categories
  const rawPc = raw.product_categories;
  const categories: Product['categories'] = Array.isArray(rawPc)
    ? rawPc.filter((pc: any) => pc.categories).map((pc: any) => pc.categories)
    : undefined;

  return {
    ...raw,
    ...(categories !== undefined && { categories }),
    description: raw.description || '',
    images: Array.isArray(raw.images) ? raw.images : [],
    total_stock: raw.total_stock || 0,
    is_active: raw.is_active ?? true,
    specifications: specs && typeof specs === 'object'
      ? {
          dimensions: typeof specs.dimensions === 'string' ? specs.dimensions : null,
          weight: specs.weight != null ? Number(specs.weight) : null,
          players: specs.players && typeof specs.players === 'object'
            ? { min: specs.players.min || 1, max: specs.players.max || 10 }
            : DEFAULT_SPECIFICATIONS.players,
          electricity: specs.electricity || false,
          setup_time: specs.setup_time || specs.setupTime || 0,
        }
      : { ...DEFAULT_SPECIFICATIONS },
    pricing: pricing && typeof pricing === 'object'
      ? {
          oneDay: pricing.oneDay || pricing.one_day || pricing.daily || 0,
          weekend: pricing.weekend || 0,
          week: pricing.week || pricing.weekly || 0,
          custom: pricing.custom || 0,
        }
      : { ...DEFAULT_PRICING },
  };
}
