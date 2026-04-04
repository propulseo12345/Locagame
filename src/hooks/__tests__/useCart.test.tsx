import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../../contexts/CartContext';
import type { CartItem } from '../../types';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

function makeItem(overrides: Partial<CartItem> & { id?: string } = {}): CartItem {
  const { id = 'prod-1', ...rest } = overrides;
  return {
    product: {
      id,
      name: `Product ${id}`,
      description: '',
      category_id: 'cat-1',
      images: [],
      specifications: {
        dimensions: null,
        weight: null,
        players: { min: 1, max: 4 },
        electricity: false,
        setup_time: 10,
      },
      pricing: { oneDay: 50, weekend: 80, week: 200, custom: 0 },
      total_stock: 5,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      ...(rest.product || {}),
    },
    quantity: 1,
    start_date: '2026-04-10',
    end_date: '2026-04-12',
    delivery_mode: 'delivery',
    delivery_fee: 0,
    product_price: 50,
    total_price: 50,
    ...rest,
  } as CartItem;
}

describe('useCart — cart count and quantities', () => {
  beforeEach(() => localStorage.clear());

  it('cartCount (totalItems) increases by the quantity added', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem({ quantity: 3, total_price: 150 })));

    expect(result.current.totalItems).toBe(3);
  });

  it('adding same product+date increments quantity without creating duplicates', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem({ quantity: 2, total_price: 100 })));
    act(() => result.current.addItem(makeItem({ quantity: 3, total_price: 150 })));

    // 1 line, quantity = 2 + 3 = 5
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalItems).toBe(5);
  });

  it('adding different products creates separate lines', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem({ id: 'prod-A', total_price: 50 })));
    act(() => result.current.addItem(makeItem({ id: 'prod-B', total_price: 80 })));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
  });
});

describe('useCart — removeItem', () => {
  beforeEach(() => localStorage.clear());

  it('removes product by id', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem({ id: 'prod-1' })));
    act(() => result.current.addItem(makeItem({ id: 'prod-2', total_price: 80 })));
    expect(result.current.items).toHaveLength(2);

    act(() => result.current.removeItem('prod-1'));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod-2');
  });

  it('removes only the matching date when startDate is provided', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem({ start_date: '2026-04-10', total_price: 50 })));
    act(() => result.current.addItem(makeItem({ start_date: '2026-04-20', total_price: 60 })));
    expect(result.current.items).toHaveLength(2);

    act(() => result.current.removeItem('prod-1', '2026-04-10'));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].start_date).toBe('2026-04-20');
  });
});

describe('useCart — totalPrice calculation', () => {
  beforeEach(() => localStorage.clear());

  it('sums total_price across all items correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem({ id: 'a', quantity: 2, total_price: 100 })));
    act(() => result.current.addItem(makeItem({ id: 'b', quantity: 1, total_price: 75 })));
    act(() => result.current.addItem(makeItem({ id: 'c', quantity: 3, total_price: 210 })));

    // 100 + 75 + 210 = 385
    expect(result.current.totalPrice).toBe(385);
    expect(result.current.totalItems).toBe(6); // 2 + 1 + 3
  });

  it('totalPrice is 0 after clearCart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem({ total_price: 150 })));
    act(() => result.current.clearCart());

    expect(result.current.totalPrice).toBe(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.items).toHaveLength(0);
  });
});

describe('useCart — clearCart', () => {
  beforeEach(() => localStorage.clear());

  it('empties all items and resets state', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem({ id: 'x', total_price: 50 })));
    act(() => result.current.addItem(makeItem({ id: 'y', total_price: 80 })));
    act(() => result.current.setDeliveryType('pickup'));
    act(() => result.current.setRentalDateRange({ from: '2026-04-10', to: '2026-04-12' }));

    act(() => result.current.clearCart());

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
    expect(result.current.deliveryType).toBe('delivery'); // reset to default
    expect(result.current.rentalDateRange).toBeNull();
  });
});

describe('useCart — delivery fee', () => {
  beforeEach(() => localStorage.clear());

  it('delivery fee is sum of item fees when deliveryType = delivery', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem({ id: 'a', delivery_fee: 15, total_price: 50 })));
    act(() => result.current.addItem(makeItem({ id: 'b', delivery_fee: 25, total_price: 80 })));

    expect(result.current.deliveryFee).toBe(40); // 15 + 25
  });

  it('delivery fee is 0 when deliveryType = pickup', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem({ delivery_fee: 30, total_price: 50 })));
    act(() => result.current.setDeliveryType('pickup'));

    expect(result.current.deliveryFee).toBe(0);
  });
});

describe('useCart — updateQuantity', () => {
  beforeEach(() => localStorage.clear());

  it('scales total_price proportionally', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // 1 unit at 50€
    act(() => result.current.addItem(makeItem({ quantity: 1, total_price: 50 })));

    // Update to 4 units → 50/1 * 4 = 200€
    act(() => result.current.updateQuantity('prod-1', 4, '2026-04-10'));

    expect(result.current.items[0].quantity).toBe(4);
    expect(result.current.items[0].total_price).toBe(200);
  });

  it('quantity 0 removes the item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeItem()));
    act(() => result.current.updateQuantity('prod-1', 0, '2026-04-10'));

    expect(result.current.items).toHaveLength(0);
  });
});
