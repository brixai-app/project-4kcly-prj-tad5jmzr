import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/types";

type CartContextValue = {
  items: CartItem[];
  isDrawerOpen: boolean;
  subtotal: number;
  itemCount: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "nddn-cart-v1";

const safeParse = (value: string | null): CartItem[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as CartItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => !!item?.product?.id) : [];
  } catch {
    return [];
  }
};

const sameVariant = (a: CartItem, productId: string, size?: string, color?: string) =>
  a?.productId === productId && (a?.size ?? "") === (size ?? "") && (a?.color ?? "") === (color ?? "");

export function CartProvider({ children }: { children?: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setItems(safeParse(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const addItem = useCallback((product: Product, quantity = 1, size?: string, color?: string) => {
    if (!product?.id) return;
    const safeQty = Math.max(1, Math.floor(quantity ?? 1));
    setItems((prev) => {
      const existing = prev.find((item) => sameVariant(item, product.id, size, color));
      if (existing) {
        const nextQty = Math.min((existing.quantity ?? 1) + safeQty, product?.inStock ? 99 : 1);
        return prev.map((item) => (sameVariant(item, product.id, size, color) ? { ...item, quantity: nextQty } : item));
      }
      return [...prev, { productId: product.id, product, quantity: Math.min(safeQty, product?.inStock ? 99 : 1), size, color }];
    });
    setIsDrawerOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size?: string, color?: string) => {
    setItems((prev) => prev.filter((item) => !sameVariant(item, productId, size, color)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, size?: string, color?: string) => {
    const nextQty = Math.max(0, Math.floor(quantity ?? 0));
    setItems((prev) =>
      prev
        .map((item) => {
          if (!sameVariant(item, productId, size, color)) return item;
          const maxQty = item?.product?.inStock ? 99 : 1;
          return { ...item, quantity: Math.min(nextQty, maxQty) };
        })
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item?.product?.price ?? 0) * (item?.quantity ?? 0), 0),
    [items],
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + (item?.quantity ?? 0), 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isDrawerOpen,
      subtotal,
      itemCount,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      addToCart: addItem,
      removeItem,
      removeFromCart: removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, isDrawerOpen, subtotal, itemCount, openDrawer, closeDrawer, toggleDrawer, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}

export default CartContext;
export { CartContext };
