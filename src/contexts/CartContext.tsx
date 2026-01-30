import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CartItem } from '../types';
import { calculateDurationDays } from '../utils/pricing';

type DeliveryType = 'delivery' | 'pickup';

/** Plage de dates de location sélectionnée globalement (format YYYY-MM-DD) */
export interface RentalDateRange {
  from: string;
  to: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, startDate?: string) => void;
  updateQuantity: (productId: string, quantity: number, startDate?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  deliveryFee: number;
  // Plage de dates globale pour le catalogue/checkout
  rentalDateRange: RentalDateRange | null;
  setRentalDateRange: (range: RentalDateRange | null) => void;
  /** Nombre de jours de location (inclusif: from et to comptent) */
  rentalDurationDays: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('locagame_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(() => {
    const savedType = localStorage.getItem('locagame_delivery_type');
    return (savedType as DeliveryType) || 'delivery';
  });

  const [rentalDateRange, setRentalDateRangeState] = useState<RentalDateRange | null>(() => {
    const saved = localStorage.getItem('locagame_rental_dates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('locagame_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('locagame_delivery_type', deliveryType);
  }, [deliveryType]);

  useEffect(() => {
    if (rentalDateRange) {
      localStorage.setItem('locagame_rental_dates', JSON.stringify(rentalDateRange));
    } else {
      localStorage.removeItem('locagame_rental_dates');
    }
  }, [rentalDateRange]);

  const setRentalDateRange = useCallback((range: RentalDateRange | null) => {
    setRentalDateRangeState(range);
  }, []);

  const rentalDurationDays = rentalDateRange
    ? calculateDurationDays(rentalDateRange.from, rentalDateRange.to)
    : 0;

  // Frais de livraison : 0 si pickup, sinon somme des frais par item
  const deliveryFee = deliveryType === 'pickup'
    ? 0
    : items.reduce((sum, item) => sum + (item.delivery_fee || 0), 0);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === item.product.id && i.start_date === item.start_date
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: string, startDate?: string) => {
    setItems((prev) => 
      prev.filter((item) => 
        startDate 
          ? !(item.product.id === productId && item.start_date === startDate)
          : item.product.id !== productId
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, startDate?: string) => {
    if (quantity <= 0) {
      removeItem(productId, startDate);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (startDate) {
          return item.product.id === productId && item.start_date === startDate
            ? { ...item, quantity, total_price: (item.total_price / item.quantity) * quantity }
            : item;
        }
        return item.product.id === productId
          ? { ...item, quantity, total_price: (item.total_price / item.quantity) * quantity }
          : item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        deliveryType,
        setDeliveryType,
        deliveryFee,
        rentalDateRange,
        setRentalDateRange,
        rentalDurationDays,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
