import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/types';
import { cn } from '@/lib/utils';

type CartItemRowProps = {
  item?: CartItem | null;
  onIncrease?: (productId: string) => void;
  onDecrease?: (productId: string) => void;
  onRemove?: (productId: string) => void;
  className?: string;
};

type CartPageContentProps = {
  className?: string;
  onCheckout?: () => void;
};

export function CartItemRow({ item = null, onIncrease = () => {}, onDecrease = () => {}, onRemove = () => {}, className = '' }: CartItemRowProps) {
  const product = item?.product ?? null;
  const image = product?.image ?? 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85';
  const name = product?.name ?? 'Selected piece';
  const category = product?.category ?? 'Collection';
  const price = product?.price ?? 0;
  const currency = product?.currency ?? '₹';
  const quantity = item?.quantity ?? 1;
  const size = item?.size ?? null;
  const color = item?.color ?? null;

  return (
    <div className={cn('flex gap-3 border-b border-[#C9BEB4] py-4 last:border-b-0', className)}>
      <img src={image} alt={name} crossOrigin="anonymous" className="h-24 w-20 shrink-0 object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-serif text-sm text-[#2E2E2E]">{name}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.2em] text-[#6F665F]">{category}</p>
          </div>
          <button type="button" onClick={() => onRemove(product?.id ?? item?.productId ?? '')} className="inline-flex h-8 w-8 items-center justify-center border border-[#C9BEB4] text-[#6F665F] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-[#6F665F]">
          {size ? <span className="border border-[#C9BEB4] px-2 py-1">Size {size}</span> : null}
          {color ? <span className="border border-[#C9BEB4] px-2 py-1">Color {color}</span> : null}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center border border-[#C9BEB4]">
            <button type="button" onClick={() => onDecrease(product?.id ?? item?.productId ?? '')} className="inline-flex h-8 w-8 items-center justify-center text-[#2E2E2E] transition-colors hover:bg-[#F1ECE7]">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-8 px-2 text-center text-sm text-[#2E2E2E]">{quantity}</span>
            <button type="button" onClick={() => onIncrease(product?.id ?? item?.productId ?? '')} className="inline-flex h-8 w-8 items-center justify-center text-[#2E2E2E] transition-colors hover:bg-[#F1ECE7]">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm font-semibold text-[#2E2E2E]">{currency}{(price * quantity).toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
}

export function CartPageContent({ className = '', onCheckout = () => {} }: CartPageContentProps) {
  const navigate = useNavigate();
  const { items = [], subtotal = 0, shipping = 0, removeItem = () => {}, increaseQuantity = () => {}, decreaseQuantity = () => {}, clearCart = () => {} } = useCart();
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum: number, item: CartItem) => sum + (item?.quantity ?? 0), 0);

  return (
    <div className={cn('grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]', className)}>
      <section className="border border-[#C9BEB4] bg-white p-5">
        <div className="flex items-end justify-between gap-4 border-b border-[#C9BEB4] pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#6F665F]">Cart</p>
            <h1 className="mt-2 font-serif text-3xl text-[#2E2E2E]">Your selected pieces</h1>
          </div>
          <p className="text-sm text-[#6F665F]">{itemCount} item{itemCount === 1 ? '' : 's'}</p>
        </div>
        <div className="divide-y divide-[#C9BEB4]">
          <AnimatePresence initial={false}>
            {items.length > 0 ? items.map((item) => <motion.div key={`${item?.productId ?? ''}-${item?.size ?? ''}-${item?.color ?? ''}`} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}><CartItemRow item={item} onIncrease={increaseQuantity} onDecrease={decreaseQuantity} onRemove={removeItem} /></motion.div>) : <div className="py-16 text-center"><ShoppingBag className="mx-auto h-10 w-10 text-[#6F665F]" /><p className="mt-4 font-serif text-xl text-[#2E2E2E]">Your cart is empty.</p><p className="mt-2 text-sm text-[#6F665F]">Continue browsing the collection to build your look.</p><button type="button" onClick={() => navigate('/shop')} className="mt-6 inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000]"><span>Explore collection</span><ArrowRight className="h-4 w-4" /></button></div>}
          </AnimatePresence>
        </div>
      </section>
      <aside className="border border-[#C9BEB4] bg-[#F1ECE7] p-5">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#6F665F]">Summary</p>
        <div className="mt-4 space-y-3 text-sm text-[#2E2E2E]">
          <div className="flex items-center justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex items-center justify-between"><span>Shipping</span><span>{shipping > 0 ? `₹${shipping.toLocaleString('en-IN')}` : 'Complimentary'}</span></div>
          <div className="flex items-center justify-between border-t border-[#C9BEB4] pt-3 font-semibold"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
        </div>
        <div className="mt-6 border border-[#C9BEB4] bg-white p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#6F665F]"><Check className="h-4 w-4 text-[#8B0000]" />Shipping tracker</div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 bg-[#8B0000]" /><div className="min-w-0"><p className="text-sm text-[#2E2E2E]">Order prepared</p><p className="text-xs text-[#6F665F]">Items reserved for checkout.</p></div></div>
            <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 bg-[#C9BEB4]" /><div className="min-w-0"><p className="text-sm text-[#2E2E2E]">Dispatch</p><p className="text-xs text-[#6F665F]">Usually within 24 hours.</p></div></div>
            <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 bg-[#C9BEB4]" /><div className="min-w-0"><p className="text-sm text-[#2E2E2E]">Delivery</p><p className="text-xs text-[#6F665F]">Tracked to your address.</p></div></div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={onCheckout} className="inline-flex items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000]">Proceed to checkout <ArrowRight className="h-4 w-4" /></button>
          <button type="button" onClick={() => clearCart()} className="inline-flex items-center justify-center border border-[#C9BEB4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#2E2E2E] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]">Clear cart</button>
        </div>
      </aside>
    </div>
  );
}

export function CartDrawer() {
  const navigate = useNavigate();
  const { isOpen = false, setIsOpen = () => {}, items = [], subtotal = 0, shipping = 0, removeItem = () => {}, increaseQuantity = () => {}, decreaseQuantity = () => {}, clearCart = () => {} } = useCart();
  const total = subtotal + shipping;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[460px] flex-col border-l border-[#C9BEB4] bg-[#F9F7F6] shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-[#C9BEB4] px-5 py-4">
            <div>
              <Dialog.Title className="font-serif text-2xl text-[#2E2E2E]">Cart</Dialog.Title>
              <Dialog.Description className="text-xs uppercase tracking-[0.22em] text-[#6F665F]">{items.length} item{items.length === 1 ? '' : 's'} · ₹{total.toLocaleString('en-IN')}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BEB4] text-[#2E2E2E] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"><X className="h-4 w-4" /></button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5">
            <AnimatePresence initial={false}>
              {items.length > 0 ? items.map((item) => <motion.div key={`${item?.productId ?? ''}-${item?.size ?? ''}-${item?.color ?? ''}`} layout initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}><CartItemRow item={item} onIncrease={increaseQuantity} onDecrease={decreaseQuantity} onRemove={removeItem} /></motion.div>) : <div className="flex h-full flex-col items-center justify-center text-center"><ShoppingBag className="h-12 w-12 text-[#6F665F]" /><p className="mt-4 font-serif text-2xl text-[#2E2E2E]">Your cart is empty.</p><p className="mt-2 max-w-xs text-sm text-[#6F665F]">Discover the latest drop and add a few considered pieces to continue.</p></div>}
            </AnimatePresence>
          </div>
          <div className="border-t border-[#C9BEB4] bg-white px-5 py-4">
            <div className="space-y-2 text-sm text-[#2E2E2E]">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex items-center justify-between"><span>Shipping</span><span>{shipping > 0 ? `₹${shipping.toLocaleString('en-IN')}` : 'Complimentary'}</span></div>
              <div className="flex items-center justify-between border-t border-[#C9BEB4] pt-2 font-semibold"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
            <div className="mt-4 grid gap-3">
              <button type="button" onClick={() => { setIsOpen(false); navigate('/checkout'); }} className="inline-flex items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000]">Checkout <ArrowRight className="h-4 w-4" /></button>
              <button type="button" onClick={() => { clearCart(); }} className="inline-flex items-center justify-center border border-[#C9BEB4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#2E2E2E] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]">Clear cart</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CartDrawer;