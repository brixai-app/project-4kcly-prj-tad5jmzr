import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product, AddToCartPayload, UpdateCartItemPayload } from '@/types';

type CartContextValue = {
  items: CartItem[];
  products: Product[];
  isDrawerOpen: boolean;
  isLoading: boolean;
  subtotal: number;
  itemCount: number;
  setDrawerOpen: (open: boolean) => void;
  refreshProducts: () => Promise<void>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  addItem: (payload: AddToCartPayload) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateCartItem: (itemId: string, payload: UpdateCartItemPayload) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const safeJson = async <T,>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export function CartProvider({ children }: { children?: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products', { credentials: 'include' });
      const data = (await safeJson<{ data?: Product[] }>(response))?.data ?? [];
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  }, []);

  const syncCart = useCallback(async (nextItems: CartItem[]) => {
    setItems(nextItems);
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: nextItems }),
      });
    } catch {}
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await fetch('/api/cart', { credentials: 'include' });
        const data = (await safeJson<{ data?: CartItem[] }>(response))?.data ?? [];
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      }
    };
    void loadCart();
  }, []);

  const addToCart = useCallback(async (payload: AddToCartPayload) => {
    const quantity = Math.max(1, payload?.quantity ?? 1);
    setIsLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, quantity }),
      });
      const data = (await safeJson<{ data?: CartItem[] }>(response))?.data;
      if (Array.isArray(data)) {
        setItems(data);
        return;
      }
      const product = products.find((p) => p.id === payload?.productId);
      if (!product) return;
      const existing = items.find(
        (item) =>
          item.productId === payload?.productId &&
          (item.size ?? '') === (payload?.size ?? '') &&
          (item.color ?? '') === (payload?.color ?? '')
      );
      const nextItems = existing
        ? items.map((item) =>
            item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item
          )
        : [
            ...items,
            {
              id: crypto.randomUUID(),
              productId: product.id,
              product,
              name: product.name,
              image: product.images?.[0]?.url ?? '',
              price: product.price,
              quantity,
              size: payload?.size,
              color: payload?.color,
            },
          ];
      await syncCart(nextItems);
    } finally {
      setIsLoading(false);
    }
  }, [items, products, syncCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      const nextItems = items.filter((item) => item.id !== itemId);
      await fetch(`/api/cart/${encodeURIComponent(itemId)}`, { method: 'DELETE', credentials: 'include' }).catch(() => {});
      await syncCart(nextItems);
    } finally {
      setIsLoading(false);
    }
  }, [items, syncCart]);

  const updateCartItem = useCallback(async (itemId: string, payload: UpdateCartItemPayload) => {
    setIsLoading(true);
    try {
      const nextItems = items.map((item) => (item.id === itemId ? { ...item, ...payload } : item));
      await fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload ?? {}),
      }).catch(() => {});
      await syncCart(nextItems);
    } finally {
      setIsLoading(false);
    }
  }, [items, syncCart]);

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch('/api/cart', { method: 'DELETE', credentials: 'include' }).catch(() => {});
      await syncCart([]);
    } finally {
      setIsLoading(false);
    }
  }, [syncCart]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item?.price ?? 0) * (item?.quantity ?? 0), 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + (item?.quantity ?? 0), 0), [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    products,
    isDrawerOpen,
    isLoading,
    subtotal,
    itemCount,
    setDrawerOpen,
    refreshProducts,
    addToCart,
    addItem: addToCart,
    removeFromCart,
    removeItem: removeFromCart,
    updateCartItem,
    clearCart,
  }), [items, products, isDrawerOpen, isLoading, subtotal, itemCount, refreshProducts, addToCart, removeFromCart, updateCartItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export default CartContext;
export { CartContext };
