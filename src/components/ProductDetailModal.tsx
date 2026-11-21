import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Circle as ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';

export interface ProductPurchasePanelProps {
  product?: Product | null;
  className?: string;
  onClose?: () => void;
}
export function ProductPurchasePanel({ product = null, className = '', onClose }: ProductPurchasePanelProps) {
  const { addItem } = useCart?.() ?? { addItem: () => {} };
  const sizes = product?.sizes?.length ? product.sizes : ['XS', 'S', 'M', 'L'];
  const colors = product?.color ? [product.color] : ['Ivory', 'Crimson', 'Charcoal'];
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState(sizes?.[0] ?? '');
  const [color, setColor] = useState(colors?.[0] ?? '');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setImageIndex(0);
    setSize(sizes?.[0] ?? '');
    setColor(colors?.[0] ?? '');
    setQty(1);
  }, [product?.id]);

  const currentImage = product?.images?.[imageIndex]?.url ?? product?.images?.[0]?.url ?? '';
  const canAdd = Boolean(product?.id && product?.inStock !== false && size && color);

  const handleAdd = () => {
    if (!product?.id) return;
    if (!canAdd) {
      toast.error('Select a size and color to continue.');
      return;
    }
    addItem?.(product, qty, size, color);
    toast.success(`${product?.name ?? 'Item'} added to cart.`);
    onClose?.();
  };

  return (
    <div className={cn('grid gap-6 lg:grid-cols-[1.1fr_0.9fr]', className)}>
      <div className="space-y-3">
        <div className="overflow-hidden border border-[#C9BDB2] bg-[#EFEAE5]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={currentImage || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'}
              alt={product?.images?.[imageIndex]?.alt ?? product?.name ?? 'Product image'}
              crossOrigin="anonymous"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="h-[62vh] w-full object-cover"
            />
          </AnimatePresence>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(product?.images ?? []).map((img, idx) => (
            <button
              key={`${img?.url ?? idx}`}
              type="button"
              onClick={() => setImageIndex(idx)}
              className={cn('h-20 w-16 shrink-0 overflow-hidden border transition', idx === imageIndex ? 'border-[#B11226]' : 'border-[#C9BDB2]')}
            >
              <img src={img?.url ?? ''} alt={img?.alt ?? product?.name ?? 'Thumbnail'} crossOrigin="anonymous" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className={cn('flex min-w-0 flex-col gap-5 border border-[#C9BDB2] bg-[#F9F7F6] p-5', className)}>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6E655F]">{product?.collection ?? product?.category ?? 'Collection'}</p>
          <h2 className="font-['Playfair_Display',serif] text-3xl font-normal tracking-tight text-[#2B2B2B]">{product?.name ?? 'Untitled Piece'}</h2>
          <p className="max-w-prose text-sm leading-7 text-[#6E655F]">{product?.description ?? 'No description available.'}</p>
        </div>

        <div className="grid gap-4 border-y border-[#C9BDB2] py-4 text-sm text-[#2B2B2B]">
          <div className="flex items-center justify-between gap-4">
            <span className="uppercase tracking-[0.22em] text-[#6E655F]">Price</span>
            <span className="font-semibold">{`${product?.currency ?? '₹'}${Number(product?.price ?? 0).toLocaleString('en-IN')}`}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="uppercase tracking-[0.22em] text-[#6E655F]">Stock</span>
            <span className={cn('inline-flex items-center gap-2 font-semibold', product?.inStock === false ? 'text-[#8F0E1F]' : 'text-[#2B2B2B]')}>
              {product?.inStock === false ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              {product?.inStock === false ? 'Sold out' : 'Available'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6E655F]">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button key={s} type="button" onClick={() => setSize(s)} className={cn('min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition', size === s ? 'border-[#B11226] bg-[#B11226] text-white' : 'border-[#C9BDB2] text-[#2B2B2B]')}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6E655F]">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={cn('min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition', color === c ? 'border-[#B11226] bg-[#B11226] text-white' : 'border-[#C9BDB2] text-[#2B2B2B]')}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6E655F]">Quantity</span>
            <div className="flex items-center border border-[#C9BDB2]">
              <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))} className="px-3 py-2 text-[#2B2B2B]"><Minus className="h-4 w-4" /></button>
              <span className="min-w-10 px-3 py-2 text-center text-sm font-semibold">{qty}</span>
              <button type="button" onClick={() => setQty((v) => v + 1)} className="px-3 py-2 text-[#2B2B2B]"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="mt-auto flex gap-3">
          <button type="button" onClick={handleAdd} disabled={!canAdd} className="flex-1 bg-[#B11226] px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-[#8F0E1F] disabled:cursor-not-allowed disabled:opacity-50">
            Add to Cart
          </button>
          <button type="button" onClick={onClose} className="border border-[#C9BDB2] px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#2B2B2B]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
export function ProductDetailModal({ product = null, open = false, onOpenChange }: { product?: Product | null; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(96vw,1100px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-[#C9BDB2] bg-[#F9F7F6] p-4 shadow-2xl outline-none">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#C9BDB2] pb-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6E655F]">
              <ChevronLeft className="h-4 w-4" />
              Product Detail
            </div>
            <Dialog.Close asChild>
              <button type="button" className="inline-flex h-9 w-9 items-center justify-center border border-[#C9BDB2] text-[#2B2B2B]">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <ProductPurchasePanel product={product} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export default ProductDetailModal;