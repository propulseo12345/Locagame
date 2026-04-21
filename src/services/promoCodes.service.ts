import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type PromoCodeRow = Database['public']['Tables']['promo_codes']['Row'];

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  stripe_coupon_id: string | null;
  created_at: string;
}

export interface PromoCodeInput {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  valid_from?: string;
  valid_until?: string | null;
  is_active?: boolean;
}

export interface PromoValidationResult {
  valid: boolean;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  description?: string;
  code?: string;
  stripe_coupon_id?: string | null;
  error?: string;
}

function toPromoCode(row: PromoCodeRow): PromoCode {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    discount_type: row.discount_type as 'percentage' | 'fixed',
    discount_value: row.discount_value,
    min_order_amount: row.min_order_amount ?? 0,
    max_uses: row.max_uses,
    current_uses: row.current_uses ?? 0,
    valid_from: row.valid_from ?? '',
    valid_until: row.valid_until,
    is_active: row.is_active ?? true,
    stripe_coupon_id: row.stripe_coupon_id,
    created_at: row.created_at ?? '',
  };
}

export class PromoCodesService {
  static async getAll(): Promise<PromoCode[]> {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toPromoCode);
  }

  static async create(input: PromoCodeInput): Promise<PromoCode> {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code: input.code.toUpperCase().trim(),
        description: input.description || null,
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        min_order_amount: input.min_order_amount || 0,
        max_uses: input.max_uses ?? null,
        valid_from: input.valid_from || new Date().toISOString(),
        valid_until: input.valid_until || null,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return toPromoCode(data);
  }

  static async update(id: string, input: Partial<PromoCodeInput>): Promise<PromoCode> {
    const updates: Database['public']['Tables']['promo_codes']['Update'] = {};
    if (input.code !== undefined) updates.code = input.code.toUpperCase().trim();
    if (input.description !== undefined) updates.description = input.description || null;
    if (input.discount_type !== undefined) updates.discount_type = input.discount_type;
    if (input.discount_value !== undefined) updates.discount_value = input.discount_value;
    if (input.min_order_amount !== undefined) updates.min_order_amount = input.min_order_amount || 0;
    if (input.max_uses !== undefined) updates.max_uses = input.max_uses ?? null;
    if (input.valid_from !== undefined) updates.valid_from = input.valid_from || null;
    if (input.valid_until !== undefined) updates.valid_until = input.valid_until || null;
    if (input.is_active !== undefined) updates.is_active = input.is_active ?? true;

    const { data, error } = await supabase
      .from('promo_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toPromoCode(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Valide un code promo côté serveur via la RPC Supabase.
   * Appelable par n'importe quel utilisateur (SECURITY DEFINER).
   */
  static async validate(code: string, orderAmount: number): Promise<PromoValidationResult> {
    const { data, error } = await supabase.rpc('validate_promo_code', {
      p_code: code.trim(),
      p_order_amount: orderAmount,
    });

    if (error) {
      return { valid: false, error: 'Erreur lors de la validation du code promo' };
    }

    return data as unknown as PromoValidationResult;
  }
}
