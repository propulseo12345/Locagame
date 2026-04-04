import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../lib/supabase';
import { ProductsAvailability } from '../products.availability';

// supabase is already mocked in setup.ts — we override per-test

const mockRpc = supabase.rpc as ReturnType<typeof vi.fn>;
const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

describe('ProductsAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── checkAvailability ───────────────────────────────────────

  describe('checkAvailability', () => {
    it('returns true when product is available', async () => {
      mockRpc.mockResolvedValueOnce({ data: true, error: null });

      const result = await ProductsAvailability.checkAvailability(
        'prod-1', '2026-04-10', '2026-04-12', 2
      );

      expect(result).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith('check_product_availability_for_dates', {
        p_product_id: 'prod-1',
        p_quantity: 2,
        p_start_date: '2026-04-10',
        p_end_date: '2026-04-12',
      });
    });

    it('returns false when stock is 0 / unavailable', async () => {
      mockRpc.mockResolvedValueOnce({ data: false, error: null });

      const result = await ProductsAvailability.checkAvailability(
        'prod-1', '2026-04-10', '2026-04-12', 5
      );

      expect(result).toBe(false);
    });

    it('throws on supabase error', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'DB down' } });

      await expect(
        ProductsAvailability.checkAvailability('prod-1', '2026-04-10', '2026-04-12', 1)
      ).rejects.toEqual({ message: 'DB down' });
    });
  });

  // ─── getAvailableStock ───────────────────────────────────────

  describe('getAvailableStock', () => {
    it('returns stock count from RPC', async () => {
      mockRpc.mockResolvedValueOnce({ data: 7, error: null });

      const stock = await ProductsAvailability.getAvailableStock('prod-1');

      expect(stock).toBe(7);
      expect(mockRpc).toHaveBeenCalledWith('get_available_stock', {
        p_product_id: 'prod-1',
      });
    });

    it('returns 0 for out of stock', async () => {
      mockRpc.mockResolvedValueOnce({ data: 0, error: null });

      const stock = await ProductsAvailability.getAvailableStock('prod-1');
      expect(stock).toBe(0);
    });

    it('throws on error', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'timeout' } });

      await expect(
        ProductsAvailability.getAvailableStock('prod-1')
      ).rejects.toEqual({ message: 'timeout' });
    });
  });

  // ─── getActiveProductIds ─────────────────────────────────────

  describe('getActiveProductIds', () => {
    it('returns empty Set for empty input', async () => {
      const result = await ProductsAvailability.getActiveProductIds([]);
      expect(result).toEqual(new Set());
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('returns Set of active IDs', async () => {
      // Chain: from().select().in().eq()
      const mockEq = vi.fn().mockResolvedValueOnce({
        data: [{ id: 'p1' }, { id: 'p3' }],
        error: null,
      });
      const mockIn = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      mockFrom.mockReturnValueOnce({ select: mockSelect });

      const result = await ProductsAvailability.getActiveProductIds(['p1', 'p2', 'p3']);

      expect(result).toEqual(new Set(['p1', 'p3']));
      expect(mockFrom).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalledWith('id');
    });

    it('throws on supabase error', async () => {
      const mockEq = vi.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'permission denied' },
      });
      const mockIn = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      mockFrom.mockReturnValueOnce({ select: mockSelect });

      await expect(
        ProductsAvailability.getActiveProductIds(['p1'])
      ).rejects.toEqual({ message: 'permission denied' });
    });
  });

  // ─── getAvailableStockForDates ───────────────────────────────

  describe('getAvailableStockForDates', () => {
    it('returns available stock = total - blocked', async () => {
      // First call: product total_stock
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: { total_stock: 10 },
        error: null,
      });
      const mockProductEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockProductSelect = vi.fn().mockReturnValue({ eq: mockProductEq });

      // Second call: blocked availability
      const mockAvailIn = vi.fn().mockResolvedValueOnce({
        data: [
          { quantity: 3, status: 'reserved' },
          { quantity: 2, status: 'blocked' },
        ],
        error: null,
      });
      const mockAvailGte = vi.fn().mockReturnValue({ in: mockAvailIn });
      const mockAvailLte = vi.fn().mockReturnValue({ gte: mockAvailGte });
      const mockAvailEq = vi.fn().mockReturnValue({ lte: mockAvailLte });
      const mockAvailSelect = vi.fn().mockReturnValue({ eq: mockAvailEq });

      mockFrom
        .mockReturnValueOnce({ select: mockProductSelect })
        .mockReturnValueOnce({ select: mockAvailSelect });

      const stock = await ProductsAvailability.getAvailableStockForDates(
        'prod-1', '2026-04-10', '2026-04-15'
      );

      // 10 - (3 + 2) = 5
      expect(stock).toBe(5);
    });

    it('returns 0 when fully booked (never negative)', async () => {
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: { total_stock: 3 },
        error: null,
      });
      const mockProductEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockProductSelect = vi.fn().mockReturnValue({ eq: mockProductEq });

      const mockAvailIn = vi.fn().mockResolvedValueOnce({
        data: [{ quantity: 5, status: 'reserved' }],
        error: null,
      });
      const mockAvailGte = vi.fn().mockReturnValue({ in: mockAvailIn });
      const mockAvailLte = vi.fn().mockReturnValue({ gte: mockAvailGte });
      const mockAvailEq = vi.fn().mockReturnValue({ lte: mockAvailLte });
      const mockAvailSelect = vi.fn().mockReturnValue({ eq: mockAvailEq });

      mockFrom
        .mockReturnValueOnce({ select: mockProductSelect })
        .mockReturnValueOnce({ select: mockAvailSelect });

      const stock = await ProductsAvailability.getAvailableStockForDates(
        'prod-1', '2026-04-10', '2026-04-15'
      );

      expect(stock).toBe(0); // Math.max(0, 3-5) = 0
    });

    it('returns full stock when no reservations exist', async () => {
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: { total_stock: 8 },
        error: null,
      });
      const mockProductEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockProductSelect = vi.fn().mockReturnValue({ eq: mockProductEq });

      const mockAvailIn = vi.fn().mockResolvedValueOnce({
        data: [],
        error: null,
      });
      const mockAvailGte = vi.fn().mockReturnValue({ in: mockAvailIn });
      const mockAvailLte = vi.fn().mockReturnValue({ gte: mockAvailGte });
      const mockAvailEq = vi.fn().mockReturnValue({ lte: mockAvailLte });
      const mockAvailSelect = vi.fn().mockReturnValue({ eq: mockAvailEq });

      mockFrom
        .mockReturnValueOnce({ select: mockProductSelect })
        .mockReturnValueOnce({ select: mockAvailSelect });

      const stock = await ProductsAvailability.getAvailableStockForDates(
        'prod-1', '2026-04-10', '2026-04-15'
      );

      expect(stock).toBe(8);
    });

    it('throws when product not found', async () => {
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'not found' },
      });
      const mockProductEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockProductSelect = vi.fn().mockReturnValue({ eq: mockProductEq });

      mockFrom.mockReturnValueOnce({ select: mockProductSelect });

      await expect(
        ProductsAvailability.getAvailableStockForDates('unknown', '2026-04-10', '2026-04-15')
      ).rejects.toThrow('Produit non trouvé');
    });
  });
});
