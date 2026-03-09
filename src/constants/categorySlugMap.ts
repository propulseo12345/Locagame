/** Mapping URL slugs → category display names */
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'casino-poker': 'Casino & Poker',
  'jeux-bar': 'Jeux de Bar',
  'jeux-video': 'Jeux Vidéo',
  'jeux-bois': 'Jeux en Bois',
  'kermesse': 'Kermesse',
  'jeux-sportifs': 'Jeux Sportifs',
  'loto-bingo': 'Loto & Bingo',
  'decoration': 'Décoration',
  'son-lumiere': 'Son & Lumière',
};

/** Mapping category display names → URL slugs */
export const CATEGORY_NAME_TO_SLUG: Record<string, string> = {
  'Casino & Poker': 'casino-poker',
  'Jeux de Bar': 'jeux-bar',
  'Jeux Vidéo': 'jeux-video',
  'Jeux en Bois': 'jeux-bois',
  'Kermesse': 'kermesse',
  'Jeux Sportifs': 'jeux-sportifs',
  'Loto & Bingo': 'loto-bingo',
  'Décoration': 'decoration',
  'Son & Lumière': 'son-lumiere',
};

/** Get the URL slug for a category name */
export function getCategorySlug(name: string): string {
  return CATEGORY_NAME_TO_SLUG[name] || name.toLowerCase().replace(/\s+/g, '-');
}
