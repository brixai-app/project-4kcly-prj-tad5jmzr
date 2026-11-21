import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product, ProductVariant } from '@/types';

type CartContextValue = {
  items: CartItem[];
  products: Product[];
  isDrawerOpen: boolean;
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  shippingProgress: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addToCart: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  addItem: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, variantId?: string | null) => number;
  getProductById: (productId: string) => Product | undefined;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'nddn-cart-items';
const FREE_SHIPPING_THRESHOLD = 25000;

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeItem(item: CartItem): CartItem {
  return {
    productId: item?.productId ?? '',
    variantId: item?.variantId ?? null,
    name: item?.name ?? 'Untitled item',
    image: item?.image ?? null,
    price: safeNumber(item?.price, 0),
    quantity: Math.max(1, Math.floor(safeNumber(item?.quantity, 1))),
    color: item?.color ?? null,
    size: item?.size ?? null,
  };
}

function storageAvailable() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export function CartProvider({ children }: { children?: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!storageAvailable()) return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CartItem[];
      setItems(Array.isArray(parsed) ? parsed.map(normalizeItem) : []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (!storageAvailable()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    let active = true;
    fetch('/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        const data = (json?.data ?? json ?? []) as Product[];
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setProducts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const addItem = useCallback((item: CartItem) => {
    const next = normalizeItem(item);
    setItems((prev) => {
      const index = prev.findIndex((entry) => entry.productId === next.productId && (entry.variantId ?? null) === (next.variantId ?? null));
      if (index >= 0) {
        return prev.map((entry, i) => (i === index ? { ...entry, quantity: Math.max(1, entry.quantity + next.quantity) } : entry));
      }
      return [...prev, next];
    });
    setIsDrawerOpen(true);
  }, []);

  const addToCart = useCallback((product: Product, variant?: ProductVariant | null, quantity = 1) => {
    const resolvedVariant = variant ?? product?.variants?.[0] ?? null;
    addItem({
      productId: product?.id ?? '',
      variantId: resolvedVariant?.id ?? null,
      name: product?.name ?? 'Untitled item',
      image: resolvedVariant?.image ?? product?.images?.[0] ?? null,
      price: safeNumber(resolvedVariant?.price ?? product?.price, 0),
      quantity: Math.max(1, Math.floor(quantity)),
      color: resolvedVariant?.color ?? null,
      size: resolvedVariant?.size ?? null,
    });
  }, [addItem]);

  const removeFromCart = useCallback((productId: string, variantId?: string | null) => {
    setItems((prev) => prev.filter((item) => !(item.productId === productId && (item.variantId ?? null) === (variantId ?? null))));
  }, []);

  const removeItem = removeFromCart;

  const updateQuantity = useCallback((productId: string, variantId: string | null | undefined, quantity: number) => {
    const nextQuantity = Math.max(1, Math.floor(quantity));
    setItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId && (item.variantId ?? null) === (variantId ?? null)
            ? { ...item, quantity: nextQuantity }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + safeNumber(item?.price) * safeNumber(item?.quantity, 1), 0), [items]);
  const shipping = useMemo(() => (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 1200), [subtotal]);
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + safeNumber(item?.quantity, 1), 0), [items]);
  const shippingProgress = useMemo(() => Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)), [subtotal]);

  const getItemQuantity = useCallback(
    (productId: string, variantId?: string | null) => items.find((item) => item.productId === productId && (item.variantId ?? null) === (variantId ?? null))?.quantity ?? 0,
    [items],
  );

  const getProductById = useCallback((productId: string) => products.find((product) => product?.id === productId), [products]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      products,
      isDrawerOpen,
      subtotal,
      shipping,
      total,
      itemCount,
      shippingProgress,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addToCart,
      addItem,
      removeFromCart,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      getProductById,
    }),
    [
      items,
      products,
      isDrawerOpen,
      subtotal,
      shipping,
      total,
      itemCount,
      shippingProgress,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addToCart,
      addItem,
      removeFromCart,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      getProductById,
    ],
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
