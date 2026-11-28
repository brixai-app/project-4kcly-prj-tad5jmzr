import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import React from 'react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export function CartDrawer({ open = false, onOpenChange = () => {} }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { items = [], updateQuantity, removeItem, subtotal = 0, shipping = 0 } = useCart() as any;
  const total = subtotal + shipping;
  const count = items.reduce((sum: number, item: any) => sum + (item?.quantity ?? 0), 0);

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
    toast.message('Proceeding to checkout');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-[#C9BDB2] bg-[#F9F7F6] text-[#2E2E2E] shadow-2xl outline-none">
          <motion.div initial={{ x: 48, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 48, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }} className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-[#C9BDB2] px-5 py-4">
              <div className="min-w-0">
                <Dialog.Title className="font-['Playfair_Display'] text-2xl font-medium tracking-tight">Shopping Bag</Dialog.Title>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#6E655E]">{count} item{count === 1 ? '' : 's'}</p>
              </div>
              <Dialog.Close className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] text-[#2E2E2E] transition-colors hover:bg-[#EEE8E2]">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-start justify-center gap-4 py-10">
                  <div className="flex h-14 w-14 items-center justify-center border border-[#C9BDB2] bg-[#EEE8E2]">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div className="max-w-xs">
                    <h3 className="font-['Playfair_Display'] text-2xl font-medium">Your bag is empty</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6E655E]">Discover the latest drop and add pieces to build your edit.</p>
                  </div>
                  <Dialog.Close asChild>
                    <button onClick={() => navigate('/shop')} className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#650000]">
                      Explore Collection <ArrowRight className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item: any) => (
                      <motion.div key={item?.id ?? item?.productId ?? `${item?.name ?? 'item'}-${item?.size ?? ''}`} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 24 }} className="flex gap-3 border border-[#C9BDB2] bg-white p-3">
                        <img src={item?.image ?? item?.product?.image ?? item?.product?.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85'} alt={item?.name ?? 'Cart item'} crossOrigin="anonymous" className="h-24 w-20 shrink-0 object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{item?.name ?? 'Untitled piece'}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6E655E]">{item?.size ? `Size ${item.size}` : item?.color ?? item?.product?.category ?? 'Selected piece'}</p>
                            </div>
                            <button onClick={() => removeItem?.(item?.id)} className="inline-flex h-8 w-8 items-center justify-center border border-[#C9BDB2] text-[#6E655E] transition-colors hover:bg-[#EEE8E2] hover:text-[#2E2E2E]">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center border border-[#C9BDB2]">
                              <button onClick={() => updateQuantity?.(item?.id, Math.max(1, (item?.quantity ?? 1) - 1))} className="inline-flex h-8 w-8 items-center justify-center text-[#2E2E2E] transition-colors hover:bg-[#EEE8E2]">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-8 px-2 text-center text-sm">{item?.quantity ?? 1}</span>
                              <button onClick={() => updateQuantity?.(item?.id, (item?.quantity ?? 1) + 1)} className="inline-flex h-8 w-8 items-center justify-center text-[#2E2E2E] transition-colors hover:bg-[#EEE8E2]">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-sm font-semibold">₹{Number(item?.price ?? 0).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="border-t border-[#C9BDB2] bg-[#EEE8E2] px-5 py-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-[#6E655E]">Subtotal</span><span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex items-center justify-between"><span className="text-[#6E655E]">Shipping</span><span className="font-semibold">{shipping > 0 ? `₹${shipping.toLocaleString('en-IN')}` : 'Calculated at checkout'}</span></div>
                <div className="flex items-center justify-between border-t border-[#C9BDB2] pt-2 text-base"><span className="font-medium">Total</span><span className="font-semibold">₹{total.toLocaleString('en-IN')}</span></div>
              </div>
              <div className="mt-4 flex gap-3">
                <Dialog.Close asChild>
                  <button onClick={() => navigate('/shop')} className="flex-1 border border-[#C9BDB2] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-[#F9F7F6]">Continue Shopping</button>
                </Dialog.Close>
                <button onClick={handleCheckout} disabled={items.length === 0} className={cn('flex-1 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#650000]', items.length === 0 && 'cursor-not-allowed opacity-50')}>
                  Checkout
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CartDrawer;