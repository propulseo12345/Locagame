import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { CartItem } from '../../types';
import { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    product: {
      id: 'prod-1',
      name: 'Babyfoot',
      description: '',
      category_id: 'cat-1',
      images: [],
      specifications: {
        dimensions: null,
        weight: null,
        players: { min: 2, max: 4 },
        electricity: false,
        setup_time: 10,
      },
      pricing: { oneDay: 50, weekend: 80, week: 200, custom: 0 },
      total_stock: 5,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    quantity: 1,
    start_date: '2026-03-09',
    end_date: '2026-03-10',
    total_price: 50,
    ...overrides,
  };
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('addItem() makes product appear in items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = makeCartItem();

    act(() => result.current.addItem(item));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod-1');
  });

  it('addItem() same product+date increments quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = makeCartItem();

    act(() => result.current.addItem(item));
    act(() => result.current.addItem(item));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('addItem() different dates creates separate lines', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeCartItem({ start_date: '2026-03-09' })));
    act(() => result.current.addItem(makeCartItem({ start_date: '2026-03-15' })));

    expect(result.current.items).toHaveLength(2);
  });

  it('removeItem() removes the product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeCartItem()));
    expect(result.current.items).toHaveLength(1);

    act(() => result.current.removeItem('prod-1'));
    expect(result.current.items).toHaveLength(0);
  });

  it('clearCart() empties everything', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeCartItem()));
    act(() => {
      result.current.addItem(
        makeCartItem({
          product: {
            ...makeCartItem().product,
            id: 'prod-2',
            name: 'Flipper',
          },
          total_price: 80,
        })
      );
    });
    expect(result.current.items).toHaveLength(2);

    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('totalItems = sum of quantities, not line count', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeCartItem({ quantity: 3 })));
    act(() => {
      result.current.addItem(
        makeCartItem({
          product: { ...makeCartItem().product, id: 'prod-2' },
          quantity: 2,
          start_date: '2026-03-09',
          total_price: 100,
        })
      );
    });

    // 2 lines, but 3 + 2 = 5 items
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(5);
  });

  it('totalPrice = sum of total_price per line', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeCartItem({ total_price: 50, quantity: 2 })));
    act(() => {
      result.current.addItem(
        makeCartItem({
          product: { ...makeCartItem().product, id: 'prod-2' },
          total_price: 120,
          quantity: 1,
          start_date: '2026-03-09',
        })
      );
    });

    // 50 + 120 = 170  (total_price is pre-computed per line)
    expect(result.current.totalPrice).toBe(170);
  });

  it('updateQuantity() updates quantity and total_price', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeCartItem({ quantity: 1, total_price: 50 })));
    act(() => result.current.updateQuantity('prod-1', 3, '2026-03-09'));

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.items[0].total_price).toBe(150); // 50/1 * 3
  });

  it('updateQuantity(0) removes the item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeCartItem()));
    act(() => result.current.updateQuantity('prod-1', 0, '2026-03-09'));

    expect(result.current.items).toHaveLength(0);
  });
});
