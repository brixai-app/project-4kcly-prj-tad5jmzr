import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export function CartPage() {
  const { items = [], updateQuantity = () => {}, removeItem = () => {}, subtotal = 0 } = useCart() as any;
  const shipping = subtotal > 0 ? (subtotal >= 15000 ? 0 : 499) : 0;
  const total = subtotal + shipping;
  const progress = Math.min(100, (subtotal / 15000) * 100);

  const handleRemove = (id: string, name?: string) => {
    removeItem?.(id);
    toast?.message?.(`${name ?? 'Item'} removed from cart`);
  };

  const handleQty = (id: string, next: number) => {
    if (next < 1) return;
    updateQuantity?.(id, next);
  };

  return (
    <main className="bg-[#F9F7F6] text-[#2E2E2E]">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#C9BDB2] pb-5">
          <div className="min-w-0">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.28em] text-[#6E655E]">Cart</p>
            <h1 className="font-serif text-4xl font-light tracking-tight sm:text-5xl">Your selected pieces</h1>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 border border-[#C9BDB2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#2E2E2E] transition hover:border-[#8B0000] hover:text-[#8B0000]"
          >
            Continue shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
          <div className="space-y-4">
            {items.length > 0 ? (
              items.map((item: any, index: number) => (
                <motion.article
                  key={item?.id ?? `${item?.productId ?? 'item'}-${index}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="grid gap-4 border border-[#C9BDB2] bg-white p-4 sm:grid-cols-[120px_minmax(0,1fr)]"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#EEE8E2]">
                    <img
                      src={item?.image ?? 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'}
                      alt={item?.name ?? 'Cart item'}
                      crossOrigin="anonymous"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6E655E]">
                        {item?.size ?? 'One size'} {item?.color ? `· ${item.color}` : ''}
                      </p>
                      <h2 className="mt-1 truncate font-serif text-2xl font-light">{item?.name ?? 'Untitled piece'}</h2>
                      <p className="mt-2 text-sm text-[#6E655E]">
                        ₹{Number(item?.price ?? 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center border border-[#C9BDB2]">
                        <button
                          type="button"
                          onClick={() => handleQty(item?.id ?? '', Math.max(1, Number(item?.quantity ?? 1) - 1))}
                          className="px-3 py-2 text-[#2E2E2E] transition hover:bg-[#EEE8E2]"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 px-4 py-2 text-center text-sm font-semibold">{item?.quantity ?? 1}</span>
                        <button
                          type="button"
                          onClick={() => handleQty(item?.id ?? '', Number(item?.quantity ?? 1) + 1)}
                          className="px-3 py-2 text-[#2E2E2E] transition hover:bg-[#EEE8E2]"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item?.id ?? '', item?.name)}
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8B0000] transition hover:text-[#650000]"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="border border-[#C9BDB2] bg-white p-10 text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-[#6E655E]" />
                <h2 className="mt-4 font-serif text-3xl font-light">Your cart is empty</h2>
                <p className="mt-2 text-sm text-[#6E655E]">Discover the latest collection and add a few refined essentials.</p>
                <Link
                  to="/shop"
                  className="mt-6 inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#650000]"
                >
                  Explore collection <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <aside className="space-y-4 border border-[#C9BDB2] bg-[#EEE8E2] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6E655E]">Shipping progress</p>
              <div className="mt-3 h-2 w-full overflow-hidden bg-white">
                <div className="h-full bg-[#8B0000]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-sm text-[#6E655E]">
                {subtotal >= 15000 ? 'You qualify for complimentary shipping.' : `Add ₹${Math.max(0, 15000 - subtotal).toLocaleString('en-IN')} more for complimentary shipping.`}
              </p>
            </div>

            <div className="space-y-3 border-t border-[#C9BDB2] pt-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[#6E655E]">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[#6E655E]">Shipping</span>
                <span className="font-semibold">{shipping === 0 ? 'Complimentary' : `₹${shipping.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#C9BDB2] pt-3 text-base">
                <span className="font-semibold uppercase tracking-[0.18em]">Total</span>
                <span className="font-serif text-2xl font-light">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 bg-[#8B0000] px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#650000]',
                items.length === 0 && 'pointer-events-none opacity-50'
              )}
            >
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default CartPage;