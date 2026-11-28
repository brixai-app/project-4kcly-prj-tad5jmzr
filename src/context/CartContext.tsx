import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product } from '@/types';

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  subtotal: number;
  itemCount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'nddn-cart-v1';

const safeNumber = (value: unknown, fallback = 0) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
const lineKey = (productId: string, size?: string, color?: string) => `${productId}::${size ?? ''}::${color ?? ''}`;

export function CartProvider({ children }: { children?: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartItem[] | null;
      if (Array.isArray(parsed)) {
        setItems(
          parsed
            .filter((item) => item?.productId && item?.id)
            .map((item) => ({
              ...item,
              quantity: Math.max(1, safeNumber(item?.quantity, 1)),
              price: Math.max(0, safeNumber(item?.price, 0)),
            })),
        );
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);
  const setCartOpen = useCallback((open: boolean) => setIsOpen(open), []);

  const addToCart = useCallback((product: Product, quantity = 1, size?: string, color?: string) => {
    if (!product?.id) return;
    const qty = Math.max(1, Math.floor(quantity));
    setItems((prev) => {
      const key = lineKey(product.id, size, color);
      const existing = prev.find((item) => lineKey(item.productId, item.size, item.color) === key);
      const stockCap = product?.inStock === false ? 0 : Number.POSITIVE_INFINITY;
      if (existing) {
        return prev.map((item) => {
          if (lineKey(item.productId, item.size, item.color) !== key) return item;
          const nextQty = Math.min(stockCap, item.quantity + qty);
          return { ...item, quantity: Number.isFinite(nextQty) ? nextQty : item.quantity };
        });
      }
      if (stockCap <= 0) return prev;
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          productId: product.id,
          product,
          name: product?.name ?? 'Untitled product',
          price: Math.max(0, safeNumber(product?.price, 0)),
          quantity: Math.min(stockCap, qty),
          image: product?.image ?? product?.images?.[0]?.url,
          size,
          color,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string, size?: string, color?: string) => {
    setItems((prev) => prev.filter((item) => lineKey(item.productId, item.size, item.color) !== lineKey(productId, size, color)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, size?: string, color?: string) => {
    const nextQty = Math.max(0, Math.floor(quantity));
    setItems((prev) =>
      prev
        .map((item) => {
          if (lineKey(item.productId, item.size, item.color) !== lineKey(productId, size, color)) return item;
          const stockCap = item?.product?.inStock === false ? 0 : Number.POSITIVE_INFINITY;
          return { ...item, quantity: Math.min(stockCap, nextQty) };
        })
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + safeNumber(item?.price, 0) * safeNumber(item?.quantity, 0), 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + safeNumber(item?.quantity, 0), 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      subtotal,
      itemCount,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setCartOpen,
    }),
    [items, isOpen, subtotal, itemCount, openCart, closeCart, toggleCart, addToCart, removeFromCart, updateQuantity, clearCart, setCartOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

export default CartContext;
export { CartContext };
