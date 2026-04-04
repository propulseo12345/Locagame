import { Product } from '../types';

/** Raw product from Supabase — accepts any select shape */
export type RawProduct = Record<string, unknown> & {
  id: string;
  name: string;
};

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
export function normalizeProduct(raw: RawProduct): Product {
  const specs = raw.specifications as Record<string, unknown> | null | undefined;
  const pricing = raw.pricing as Record<string, unknown> | null | undefined;

  // Extraire les catégories depuis la table de liaison product_categories
  const rawPc = raw.product_categories as Array<{
    category_id: string;
    categories: { id: string; name: string; slug?: string } | null;
  }> | undefined;
  const categories: Product['categories'] = Array.isArray(rawPc)
    ? rawPc
        .filter((pc) => pc.categories)
        .map((pc) => pc.categories as Product['categories'] extends (infer U)[] | undefined ? U : never)
    : undefined;

  const players = specs?.players as Record<string, number> | undefined;

  return {
    ...(raw as unknown as Product),
    ...(categories !== undefined && { categories }),
    description: (raw.description as string) || '',
    images: Array.isArray(raw.images) ? raw.images as string[] : [],
    total_stock: (raw.total_stock as number) || 0,
    is_active: (raw.is_active as boolean) ?? true,
    specifications: specs
      ? {
          dimensions: typeof specs.dimensions === 'string' ? specs.dimensions : null,
          weight: specs.weight != null ? Number(specs.weight) : null,
          players: players && typeof players === 'object'
            ? { min: players.min || 1, max: players.max || 10 }
            : DEFAULT_SPECIFICATIONS.players,
          electricity: Boolean(specs.electricity),
          setup_time: Number(specs.setup_time || specs.setupTime || 0),
        }
      : { ...DEFAULT_SPECIFICATIONS },
    pricing: pricing
      ? {
          oneDay: Number(pricing.oneDay || pricing.one_day || pricing.daily || 0),
          weekend: Number(pricing.weekend || 0),
          week: Number(pricing.week || pricing.weekly || 0),
          custom: Number(pricing.custom || 0),
        }
      : { ...DEFAULT_PRICING },
  };
}
