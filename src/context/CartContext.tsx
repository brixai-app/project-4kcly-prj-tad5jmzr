import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { CartItem, Product, ProductVariant } from '@/types';

type CartContextValue = {
  items: CartItem[];
  isDrawerOpen: boolean;
  subtotal: number;
  bagCount: number;
  addToCart: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const getItemKey = (productId: string, variantId?: string) => `${productId}::${variantId ?? 'default'}`;

const getVariantLabel = (variant?: ProductVariant | null) => variant?.label ?? 'Default';

export function CartProvider({ children }: { children?: React.ReactNode } = {}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const bagCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const addToCart = useCallback(
    (product: Product, variant?: ProductVariant | null, quantity = 1) => {
      if (!product?.id) return;
      const safeQuantity = Math.max(1, quantity);
      const variantId = variant?.id;
      const key = getItemKey(product.id, variantId);
      const image = product.images?.[0]?.src ?? '';
      const price = variant?.price ?? product.price ?? 0;
      const stock = variant?.stock ?? product.stock ?? 0;

      setItems((current) => {
        const existing = current.find((item) => getItemKey(item.productId, item.id) === key);
        if (existing) {
          return current.map((item) =>
            getItemKey(item.productId, item.id) === key
              ? { ...item, quantity: Math.min((item.quantity ?? 0) + safeQuantity, stock > 0 ? stock : item.quantity + safeQuantity) }
              : item,
          );
        }
        return [
          ...current,
          {
            id: variantId ?? 'default',
            productId: product.id,
            name: product.name ?? 'Product',
            price,
            currency: product.currency ?? 'INR',
            quantity: Math.min(safeQuantity, stock > 0 ? stock : safeQuantity),
            image,
            size: variant?.size,
            color: variant?.color,
            stock,
          },
        ];
      });

      toast.success(`${product.name ?? 'Item'} added to bag${variant ? ` · ${getVariantLabel(variant)}` : ''}`);
      setIsDrawerOpen(true);
    },
    [],
  );

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    const key = getItemKey(productId, variantId);
    setItems((current) => current.filter((item) => getItemKey(item.productId, item.id) !== key));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    const key = getItemKey(productId, variantId);
    const nextQuantity = Math.max(0, quantity);
    setItems((current) =>
      current
        .map((item) => {
          if (getItemKey(item.productId, item.id) !== key) return item;
          if (nextQuantity === 0) return item;
          const maxQty = item.stock && item.stock > 0 ? item.stock : nextQuantity;
          return { ...item, quantity: Math.min(nextQuantity, maxQty) };
        })
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isDrawerOpen,
      subtotal,
      bagCount,
      addToCart,
      addItem: addToCart,
      removeFromCart,
      removeItem: removeFromCart,
      updateQuantity,
      clearCart,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [items, isDrawerOpen, subtotal, bagCount, addToCart, removeFromCart, updateQuantity, clearCart, openDrawer, closeDrawer, toggleDrawer],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

export default CartProvider;