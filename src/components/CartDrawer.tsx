import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/types';
import { cn } from '@/lib/utils';

export function CartDrawer({ open = false, onOpenChange = () => {} }: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}) {
  const { items = [], updateQuantity, removeItem, subtotal = 0, currency = 'INR' } = useCart() as {
    items?: CartItem[];
    updateQuantity?: (productId: string, quantity: number, size?: string, color?: string) => void;
    removeItem?: (productId: string, size?: string, color?: string) => void;
    subtotal?: number;
    currency?: string;
  };

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency ?? 'INR', maximumFractionDigits: 0 }).format(value ?? 0);

  const shippingThreshold = 5000;
  const shipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 250;
  const total = subtotal + shipping;
  const progress = Math.min(100, (subtotal / shippingThreshold) * 100);

  const handleQty = (item: CartItem, next: number) => {
    const quantity = Math.max(1, Math.min(next, item?.stock ?? 99));
    updateQuantity?.(item?.productId ?? '', quantity, item?.size, item?.color);
  };

  const handleRemove = (item: CartItem) => {
    removeItem?.(item?.productId ?? '', item?.size, item?.color);
    toast.message('Removed from cart');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0a0a0a]/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#C9BFB1] bg-[#FFFCF7] text-[#2E2B28] shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-[#C9BFB1] px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="font-['Playfair_Display'] text-2xl font-medium tracking-tight">Shopping Bag</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs uppercase tracking-[0.22em] text-[#71695F]">
                {items?.length ?? 0} item{(items?.length ?? 0) === 1 ? '' : 's'}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BFB1] text-[#2E2B28] transition-colors hover:bg-[#F5F1EB]">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <AnimatePresence initial={false}>
              {(items?.length ?? 0) > 0 ? (
                <motion.div layout className="flex flex-col gap-4">
                  {items?.map((item) => (
                    <motion.div
                      key={`${item?.productId ?? ''}-${item?.size ?? ''}-${item?.color ?? ''}`}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      className="flex gap-3 border-b border-[#C9BFB1] pb-4"
                    >
                      <img
                        src={item?.image ?? ''}
                        alt={item?.name ?? 'Cart item'}
                        crossOrigin="anonymous"
                        className="h-24 w-20 shrink-0 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-['Playfair_Display'] text-base font-medium">{item?.name ?? ''}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#71695F]">
                              {item?.size ? `Size ${item.size}` : 'One size'}
                              {item?.color ? ` · ${item.color}` : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[#C9BFB1] text-[#71695F] transition-colors hover:bg-[#F5F1EB] hover:text-[#2E2B28]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center border border-[#C9BFB1]">
                            <button
                              type="button"
                              onClick={() => handleQty(item, (item?.quantity ?? 1) - 1)}
                              className="inline-flex h-9 w-9 items-center justify-center text-[#2E2B28] transition-colors hover:bg-[#F5F1EB]"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-10 px-3 text-center text-sm font-medium">{item?.quantity ?? 1}</span>
                            <button
                              type="button"
                              onClick={() => handleQty(item, (item?.quantity ?? 1) + 1)}
                              className="inline-flex h-9 w-9 items-center justify-center text-[#2E2B28] transition-colors hover:bg-[#F5F1EB]"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold">{formatMoney((item?.price ?? 0) * (item?.quantity ?? 1))}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full min-h-[320px] flex-col items-center justify-center text-center"
                >
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center border border-[#C9BFB1]">
                    <ShoppingBag className="h-7 w-7 text-[#71695F]" />
                  </div>
                  <p className="font-['Playfair_Display'] text-2xl font-medium">Your bag is empty</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[#71695F]">
                    Discover the latest drop and add a few refined essentials to begin your edit.
                  </p>
                  <Dialog.Close asChild>
                    <Link
                      to="/shop"
                      className="mt-6 inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000]"
                    >
                      Explore Collection <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Dialog.Close>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-[#C9BFB1] px-5 py-4">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[#71695F]">
                <span>Free shipping</span>
                <span>{formatMoney(Math.max(0, shippingThreshold - subtotal))} left</span>
              </div>
              <div className="h-1.5 w-full bg-[#F5F1EB]">
                <div className="h-full bg-[#8B0000]" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#71695F]">Subtotal</span>
                <span className="font-medium">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71695F]">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'Free' : formatMoney(shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#C9BFB1] pt-2 text-base">
                <span className="font-medium">Total</span>
                <span className="font-semibold">{formatMoney(total)}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <Dialog.Close asChild>
                <Link
                  to="/checkout"
                  className={cn(
                    'inline-flex items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000]'
                  )}
                >
                  Checkout <ArrowRight className="h-4 w-4" />
                </Link>
              </Dialog.Close>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center border border-[#C9BFB1] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#2E2B28] transition-colors hover:bg-[#F5F1EB]"
                >
                  Continue Shopping
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CartDrawer;