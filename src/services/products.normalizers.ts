import { Product } from '../types';

export const DEFAULT_SPECIFICATIONS: Product['specifications'] = {
  dimensions: { length: 0, width: 0, height: 0 },
  weight: 0,
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

  return {
    ...raw,
    description: raw.description || '',
    images: Array.isArray(raw.images) ? raw.images : [],
    total_stock: raw.total_stock || 0,
    is_active: raw.is_active ?? true,
    specifications: specs && typeof specs === 'object'
      ? {
          dimensions: specs.dimensions && typeof specs.dimensions === 'object'
            ? { length: specs.dimensions.length || 0, width: specs.dimensions.width || 0, height: specs.dimensions.height || 0 }
            : DEFAULT_SPECIFICATIONS.dimensions,
          weight: specs.weight || 0,
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
