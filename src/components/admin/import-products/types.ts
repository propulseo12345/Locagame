export interface ImportRow {
  name: string;
  slug: string;
  category_id: string;
  description: string;
  price_one_day: number;
  price_weekend: number;
  price_week: number;
  total_stock: number;
}

export interface ValidationResult {
  row: ImportRow;
  rowIndex: number;
  errors: string[];
  warnings: string[];
  categoryUuid: string | null;
}

export type ImportStep = 'upload' | 'preview' | 'importing' | 'report';

export interface ImportReport {
  total: number;
  success: number;
  errors: Array<{ index: number; error: string }>;
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

export const EXPECTED_HEADERS = [
  'name', 'slug', 'category_id', 'description',
  'price_one_day', 'price_weekend', 'price_week', 'total_stock'
];
