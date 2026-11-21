import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight, Truck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/types';

export interface CartContentsProps {
  className?: string;
  onCheckout?: () => void;
}

export function CartContents({ className = '', onCheckout }: CartContentsProps) {
  const navigate = useNavigate();
  const { items = [], updateQuantity, removeItem, subtotal = 0, shippingFee = 0, tax = 0, total = 0 } = useCart() as {
    items?: CartItem[];
    updateQuantity?: (id: string, quantity: number) => void;
    removeItem?: (id: string) => void;
    subtotal?: number;
    shippingFee?: number;
    tax?: number;
    total?: number;
  };

  const handleCheckout = () => {
    onCheckout?.();
    navigate('/checkout');
  };

  return (
    <div className={cn('flex h-full flex-col bg-[#F9F7F6] text-[#2B2B2B]', className)}>
      <div className="border-b border-[#C9BDB2] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-serif text-2xl tracking-tight">Cart</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#6E655F]">{items.length} item{items.length === 1 ? '' : 's'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[320px] flex-col items-start justify-center gap-4">
            <ShoppingBag className="h-10 w-10 text-[#6E655F]" />
            <div className="max-w-xs">
              <p className="font-serif text-2xl">Your cart is empty.</p>
              <p className="mt-2 text-sm leading-6 text-[#6E655F]">Continue browsing the collection and add pieces to your cart for a refined checkout later.</p>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 border border-[#B11226] bg-[#B11226] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#8F0E1F]">
              Explore Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const product = item?.product;
              const image = product?.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80';
              const alt = product?.images?.[0]?.alt ?? product?.name ?? 'Product image';
              return (
                <div key={item.id} className="border border-[#C9BDB2] bg-white p-3">
                  <div className="flex gap-3">
                    <img src={image} alt={alt} crossOrigin="anonymous" className="h-24 w-20 shrink-0 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-serif text-lg">{product?.name ?? 'Untitled item'}</p>
                          <p className="mt-1 truncate text-xs uppercase tracking-[0.2em] text-[#6E655F]">{product?.collection ?? product?.category ?? 'Collection'}</p>
                          <p className="mt-2 text-sm text-[#6E655F]">
                            {item.size ? `Size ${item.size}` : 'One size'}{item.color ? ` · ${item.color}` : ''}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold">₹{Number(item.price ?? 0).toLocaleString('en-IN')}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center border border-[#C9BDB2]">
                          <button type="button" onClick={() => updateQuantity?.(item.id, Math.max(1, (item.quantity ?? 1) - 1))} className="flex h-9 w-9 items-center justify-center border-r border-[#C9BDB2] text-[#2B2B2B] transition-colors hover:bg-[#EFEAE5]">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="flex h-9 min-w-10 items-center justify-center px-3 text-sm">{item.quantity ?? 1}</span>
                          <button type="button" onClick={() => updateQuantity?.(item.id, (item.quantity ?? 1) + 1)} className="flex h-9 w-9 items-center justify-center border-l border-[#C9BDB2] text-[#2B2B2B] transition-colors hover:bg-[#EFEAE5]">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button type="button" onClick={() => { removeItem?.(item.id); toast.success('Removed from cart'); }} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6E655F] transition-colors hover:text-[#B11226]">
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-[#C9BDB2] bg-[#EFEAE5] px-5 py-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between"><span className="text-[#6E655F]">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex items-center justify-between"><span className="text-[#6E655F]">Shipping</span><span>{shippingFee > 0 ? `₹${shippingFee.toLocaleString('en-IN')}` : 'Complimentary'}</span></div>
          <div className="flex items-center justify-between"><span className="text-[#6E655F]">Tax</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
          <div className="mt-3 flex items-center justify-between border-t border-[#C9BDB2] pt-3 text-base font-semibold"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#6E655F]">
            <Truck className="h-4 w-4" />
            <span>Shipping tracker</span>
          </div>
          <div className="h-1 w-full overflow-hidden bg-white">
            <div className="h-full w-2/3 bg-[#B11226]" />
          </div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[#6E655F]">
            <span>Cart</span>
            <span>Checkout</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button type="button" onClick={handleCheckout} className="inline-flex flex-1 items-center justify-center gap-2 bg-[#B11226] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#8F0E1F]">
            <CreditCard className="h-4 w-4" />
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export interface CartDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartDrawer({ open = false, onOpenChange }: CartDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#C9BDB2] bg-[#F9F7F6] shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-[#C9BDB2] px-5 py-4">
            <Dialog.Title className="font-serif text-2xl tracking-tight">Shopping Bag</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] text-[#2B2B2B] transition-colors hover:bg-[#EFEAE5]">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <CartContents />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CartDrawer;