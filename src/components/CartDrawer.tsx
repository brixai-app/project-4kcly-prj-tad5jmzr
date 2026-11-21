import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export interface CartDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartDrawer({ open = false, onOpenChange = () => {} }: CartDrawerProps) {
  const navigate = useNavigate();
  const { items = [], updateQuantity, removeItem, clearCart, subtotal = 0 } = useCart() as any;
  const [submitting, setSubmitting] = useState(false);
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  const itemCount = useMemo(() => items.reduce((sum: number, item: any) => sum + (item?.quantity ?? 0), 0), [items]);

  const handleCheckout = async () => {
    if (!items?.length) {
      toast.info('Your cart is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, subtotal, shipping, total }),
      });
      if (!res.ok) throw new Error('Checkout failed');
      toast.success('Order ready for checkout.');
      clearCart?.();
      onOpenChange(false);
      navigate('/checkout');
    } catch {
      toast.error('Unable to start checkout right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-[#CFC6BA] bg-[#FFFDF9] shadow-2xl outline-none">
          <motion.div initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }} className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-[#CFC6BA] px-5 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#716A63]">Cart</p>
                <h2 className="truncate font-['Playfair_Display'] text-2xl font-light text-[#2B2B2B]">Selected Pieces</h2>
              </div>
              <Dialog.Close asChild>
                <button type="button" className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC6BA] text-[#2B2B2B] transition-colors hover:bg-[#F5F1EB]">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <AnimatePresence initial={false}>
                {items?.length ? (
                  <div className="space-y-4">
                    {items.map((item: any) => (
                      <motion.div key={item?.id ?? item?.productId} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className="flex gap-3 border-b border-[#CFC6BA] pb-4">
                        <img src={item?.image ?? 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80'} alt={item?.name ?? 'Cart item'} crossOrigin="anonymous" className="h-28 w-20 shrink-0 object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#2B2B2B]">{item?.name ?? 'Untitled piece'}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#716A63]">{item?.size ? `Size ${item.size}` : 'One size'}</p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-[#2B2B2B]">₹{Number(item?.price ?? 0).toLocaleString('en-IN')}</p>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center border border-[#CFC6BA]">
                              <button type="button" onClick={() => updateQuantity?.(item?.id, Math.max(1, (item?.quantity ?? 1) - 1))} className="flex h-9 w-9 items-center justify-center text-[#2B2B2B] transition-colors hover:bg-[#F5F1EB]">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="flex h-9 w-10 items-center justify-center text-xs font-semibold text-[#2B2B2B]">{item?.quantity ?? 1}</span>
                              <button type="button" onClick={() => updateQuantity?.(item?.id, (item?.quantity ?? 1) + 1)} className="flex h-9 w-9 items-center justify-center text-[#2B2B2B] transition-colors hover:bg-[#F5F1EB]">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button type="button" onClick={() => removeItem?.(item?.id)} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#716A63] transition-colors hover:text-[#8B0000]">
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                    <ShoppingBag className="h-10 w-10 text-[#716A63]" />
                    <p className="mt-4 font-['Playfair_Display'] text-2xl font-light text-[#2B2B2B]">Your cart is empty</p>
                    <p className="mt-2 max-w-xs text-sm text-[#716A63]">Add a few tailored essentials and return here to review your selection.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-[#CFC6BA] bg-[#F5F1EB] px-5 py-4">
              <div className="space-y-2 text-sm text-[#2B2B2B]">
                <div className="flex items-center justify-between">
                  <span className="text-[#716A63]">Items</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#716A63]">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#716A63]">Shipping</span>
                  <span>{shipping === 0 ? 'Complimentary' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#CFC6BA] pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button type="button" onClick={handleCheckout} disabled={submitting || !items?.length} className={cn('mt-4 inline-flex w-full items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60')}>
                {submitting ? 'Processing' : 'Checkout'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CartDrawer;