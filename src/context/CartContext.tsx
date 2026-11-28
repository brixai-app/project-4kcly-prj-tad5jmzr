import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product } from '@/types';

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  shippingProgress: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'nddn-store-cart-v1';
const DRAWER_KEY = 'nddn-store-cart-open-v1';
const FREE_SHIPPING_THRESHOLD = 25000;

const getKey = (productId: string, size?: string, color?: string) => `${productId}::${size ?? ''}::${color ?? ''}`;

export function CartProvider({ children }: { children?: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const rawItems = window.localStorage.getItem(STORAGE_KEY);
      const rawOpen = window.localStorage.getItem(DRAWER_KEY);
      if (rawItems) setItems(JSON.parse(rawItems) as CartItem[]);
      if (rawOpen) setIsOpen(rawOpen === 'true');
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAWER_KEY, String(isOpen));
    } catch {}
  }, [isOpen]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.product?.price ?? 0) * (item.quantity ?? 0), 0),
    [items]
  );

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 1200;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const upsertItem = useCallback((product: Product, quantity = 1, size?: string, color?: string) => {
    if (!product?.id) return;
    setItems((current) => {
      const key = getKey(product.id, size, color);
      const existing = current.find((item) => getKey(item.productId, item.size, item.color) === key);
      const stockLimit = product.inStock === false ? 0 : Number.MAX_SAFE_INTEGER;
      if (existing) {
        const nextQuantity = Math.min(stockLimit, (existing.quantity ?? 0) + Math.max(1, quantity));
        return current.map((item) => (getKey(item.productId, item.size, item.color) === key ? { ...item, product, quantity: nextQuantity } : item));
      }
      if (stockLimit <= 0) return current;
      return [...current, { productId: product.id, product, quantity: Math.min(stockLimit, Math.max(1, quantity)), size, color }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size?: string, color?: string) => {
    setItems((current) => current.filter((item) => getKey(item.productId, item.size, item.color) !== getKey(productId, size, color)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, size?: string, color?: string) => {
    setItems((current) =>
      current
        .map((item) => {
          if (getKey(item.productId, item.size, item.color) !== getKey(productId, size, color)) return item;
          const nextQuantity = Math.max(1, Math.floor(quantity));
          const stockLimit = item.product?.inStock === false ? 0 : Number.MAX_SAFE_INTEGER;
          return { ...item, quantity: Math.min(stockLimit, nextQuantity) };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((current) => !current), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      subtotal,
      shipping,
      total,
      itemCount,
      shippingProgress,
      openCart,
      closeCart,
      toggleCart,
      addItem: upsertItem,
      addToCart: upsertItem,
      removeItem,
      removeFromCart: removeItem,
      updateQuantity,
      clearCart,
      setCartOpen: setIsOpen,
    }),
    [items, isOpen, subtotal, shipping, total, itemCount, shippingProgress, openCart, closeCart, toggleCart, upsertItem, removeItem, updateQuantity, clearCart]
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
