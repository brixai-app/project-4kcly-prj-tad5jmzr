import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/types";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  subtotal: number;
  shippingFee: number;
  shippingProgress: number;
  total: number;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "nddn-cart";

const safeNumber = (value: unknown, fallback = 0) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);
const itemKey = (productId: string, size?: string, color?: string) => `${productId}::${size ?? ""}::${color ?? ""}`;

export function CartProvider({ children }: { children?: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1, size?: string, color?: string) => {
    if (!product?.id) return;
    const qty = Math.max(1, Math.floor(safeNumber(quantity, 1)));
    setItems((current) => {
      const existingIndex = current.findIndex((item) => itemKey(item.productId, item.size, item.color) === itemKey(product.id, size, color));
      if (existingIndex >= 0) {
        return current.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: Math.max(1, Math.min((item.quantity ?? 1) + qty, product?.inStock === false ? item.quantity ?? 1 : 99)) }
            : item,
        );
      }
      const nextItem: CartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        product,
        quantity: Math.max(1, Math.min(qty, product?.inStock === false ? 1 : 99)),
        size,
        color,
        price: safeNumber(product?.price, 0),
        addedAt: new Date().toISOString(),
      };
      return [...current, nextItem];
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    if (!itemId) return;
    setItems((current) => current.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const nextQuantity = Math.max(1, Math.floor(safeNumber(quantity, 1)));
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;
        const maxStock = item?.product?.inStock === false ? item.quantity ?? 1 : 99;
        return { ...item, quantity: Math.min(nextQuantity, maxStock) };
      }),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + safeNumber(item?.price, 0) * Math.max(1, safeNumber(item?.quantity, 1)), 0),
    [items],
  );

  const shippingFee = useMemo(() => (subtotal > 15000 ? 0 : subtotal > 0 ? 499 : 0), [subtotal]);
  const total = useMemo(() => subtotal + shippingFee, [subtotal, shippingFee]);
  const shippingProgress = useMemo(() => Math.min(100, Math.round((subtotal / 15000) * 100)), [subtotal]);
  const getItemCount = useCallback(() => items.reduce((count, item) => count + Math.max(1, safeNumber(item?.quantity, 1)), 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      setIsOpen,
      subtotal,
      shippingFee,
      shippingProgress,
      total,
      addToCart,
      addItem: addToCart,
      removeFromCart,
      removeItem: removeFromCart,
      updateQuantity,
      clearCart,
      getItemCount,
    }),
    [items, isOpen, subtotal, shippingFee, shippingProgress, total, addToCart, removeFromCart, updateQuantity, clearCart, getItemCount],
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

// Auto-synthesized missing component export
export const CartContents: any = (props: any) => props?.children || null;
