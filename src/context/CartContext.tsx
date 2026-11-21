import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { CartItem, CartPayload, Product } from '@/types';

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, payload?: CartPayload) => void;
  addToCart: (product: Product, payload?: CartPayload) => void;
  removeItem: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'nddn-cart-v1';

const safeNumber = (value: unknown, fallback = 0) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

const normalizeItem = (item: Partial<CartItem> & { productId?: string; name?: string; image?: string; price?: number }) => ({
  id: item?.id ?? crypto.randomUUID(),
  productId: item?.productId ?? '',
  name: item?.name ?? '',
  slug: item?.slug,
  image: item?.image ?? '',
  price: safeNumber(item?.price),
  quantity: Math.max(1, Math.floor(safeNumber(item?.quantity, 1))),
  size: item?.size,
  color: item?.color,
});

export function CartProvider({ children }: { children?: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) setItems(parsed.map((item) => normalizeItem(item)));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + safeNumber(item?.price) * safeNumber(item?.quantity, 1), 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + safeNumber(item?.quantity, 1), 0), [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = useCallback((product: Product, payload: CartPayload = {}) => {
    if (!product?.id) return;
    const quantity = Math.max(1, Math.floor(safeNumber(payload?.quantity, 1)));
    const existing = items.find(
      (item) => item?.productId === product.id && (item?.size ?? '') === (payload?.size ?? '') && (item?.color ?? '') === (payload?.color ?? '')
    );
    const stockLimit = Math.max(1, Math.floor(safeNumber((product as Product)?.size?.length, 99)));
    setItems((current) => {
      const next = [...current];
      const index = next.findIndex(
        (item) => item?.productId === product.id && (item?.size ?? '') === (payload?.size ?? '') && (item?.color ?? '') === (payload?.color ?? '')
      );
      if (index >= 0) {
        const updatedQty = Math.min(stockLimit, safeNumber(next[index]?.quantity, 1) + quantity);
        next[index] = { ...next[index], quantity: updatedQty };
      } else {
        next.unshift(
          normalizeItem({
            id: crypto.randomUUID(),
            productId: product.id,
            name: product.name,
            slug: product.slug,
            image: product.image,
            price: product.price,
            quantity: Math.min(stockLimit, quantity),
            size: payload?.size,
            color: payload?.color,
          })
        );
      }
      return next;
    });
    toast.success(existing ? 'Updated cart' : 'Added to cart');
    openCart();
  }, [items, openCart]);

  const removeItem = useCallback((itemId: string) => {
    setItems((current) => current.filter((item) => item?.id !== itemId));
    toast.message('Removed from cart');
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const nextQty = Math.max(1, Math.floor(safeNumber(quantity, 1)));
    setItems((current) => current.map((item) => (item?.id === itemId ? { ...item, quantity: nextQty } : item)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    toast.message('Cart cleared');
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      subtotal,
      itemCount,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      addToCart: addItem,
      removeItem,
      removeFromCart: removeItem,
      updateQuantity,
      clearCart,
      setCartOpen: setIsCartOpen,
    }),
    [items, subtotal, itemCount, isCartOpen, openCart, closeCart, toggleCart, addItem, removeItem, updateQuantity, clearCart]
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
