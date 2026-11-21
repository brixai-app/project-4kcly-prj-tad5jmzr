import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Circle as ChevronLeft, ChevronRight, Check, ShoppingBag, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

export interface ProductDetailModalProps {
  product?: Product | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onQuickView?: (product: Product) => void;
}

export function ProductDetailModal({
  product = null,
  open = false,
  onOpenChange = () => {},
  onQuickView,
}: ProductDetailModalProps) {
  const { addItem } = useCart() as { addItem?: (payload: { productId: string; quantity?: number; size?: string; color?: string }) => void };
  const images = useMemo(() => {
    const list = product?.images?.length ? product.images : product?.image ? [product.image] : [];
    return list.filter(Boolean);
  }, [product]);
  const [index, setIndex] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    setIndex(0);
    setSize(product?.size?.[0] ?? '');
    setColor(product?.color ?? '');
  }, [product?.id, product?.size, product?.color]);

  const currentImage = images?.[index] ?? product?.image ?? '';
  const inStock = product?.inStock ?? true;
  const sizes = product?.size ?? [];
  const colors = product?.color ? [product.color] : [];

  const handleAdd = () => {
    if (!product?.id) return;
    addItem?.({ productId: product.id, quantity: 1, size: size || undefined, color: color || undefined });
    toast.success(`${product?.name ?? 'Item'} added to cart`);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-x-0 top-0 z-50 mx-auto flex h-full w-full max-w-6xl items-center justify-center p-3 sm:p-6"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <div className="grid max-h-[92vh] w-full overflow-hidden rounded-none border border-[#CFC6BA] bg-[#FFFDF9] shadow-2xl md:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative min-h-[42vh] overflow-hidden bg-[#F5F1EB]">
                    <img
                      src={currentImage || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'}
                      alt={product?.name ?? 'Product image'}
                      crossOrigin="anonymous"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIndex((v) => Math.max(0, v - 1))}
                        disabled={index <= 0}
                        className="inline-flex h-9 w-9 items-center justify-center border border-[#CFC6BA] bg-[#FFFDF9]/90 text-[#2B2B2B] transition hover:bg-white disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIndex((v) => Math.min(images.length - 1, v + 1))}
                        disabled={index >= images.length - 1}
                        className="inline-flex h-9 w-9 items-center justify-center border border-[#CFC6BA] bg-[#FFFDF9]/90 text-[#2B2B2B] transition hover:bg-white disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto">
                      {images.map((img, i) => (
                        <button
                          key={`${img}-${i}`}
                          type="button"
                          onClick={() => setIndex(i)}
                          className={cn(
                            'h-16 w-12 shrink-0 overflow-hidden border transition',
                            i === index ? 'border-[#8B0000]' : 'border-[#CFC6BA]'
                          )}
                        >
                          <img src={img} alt="" crossOrigin="anonymous" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-col border-t border-[#CFC6BA] md:border-l md:border-t-0">
                    <div className="flex items-start justify-between gap-4 border-b border-[#CFC6BA] p-5">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#716A63]">
                          {product?.collection ?? product?.category ?? 'Collection'}
                        </p>
                        <Dialog.Title className="mt-2 font-['Playfair_Display'] text-3xl font-light tracking-tight text-[#2B2B2B]">
                          {product?.name ?? 'Untitled Product'}
                        </Dialog.Title>
                      </div>
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC6BA] text-[#2B2B2B] transition hover:bg-[#F5F1EB]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Dialog.Close>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#2B2B2B]">₹{product?.price?.toLocaleString?.('en-IN') ?? '0'}</p>
                          {product?.compareAtPrice ? (
                            <p className="text-xs text-[#716A63] line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</p>
                          ) : null}
                        </div>
                        <div className={cn('inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]', inStock ? 'text-[#2B2B2B]' : 'text-[#8B0000]')}>
                          <span className={cn('h-2 w-2 rounded-full', inStock ? 'bg-[#2B2B2B]' : 'bg-[#8B0000]')} />
                          {inStock ? 'In stock' : 'Sold out'}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-[#716A63]">{product?.description ?? 'A refined piece from the NDDN Store collection, designed with a precise silhouette and elevated finish.'}</p>

                      <div className="mt-6 space-y-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#716A63]">Size</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(sizes.length ? sizes : ['S', 'M', 'L']).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setSize(s)}
                                className={cn(
                                  'min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition',
                                  size === s ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#CFC6BA] bg-white text-[#2B2B2B] hover:bg-[#F5F1EB]'
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#716A63]">Color</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(colors.length ? colors : ['Ivory']).map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={cn(
                                  'inline-flex items-center gap-2 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition',
                                  color === c ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#CFC6BA] bg-white text-[#2B2B2B] hover:bg-[#F5F1EB]'
                                )}
                              >
                                <span className={cn('h-2.5 w-2.5 rounded-full border', color === c ? 'border-white bg-white' : 'border-[#2B2B2B] bg-[#CFC6BA]')} />
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 border-t border-[#CFC6BA] pt-4">
                        <div className="flex items-center gap-2 text-sm text-[#2B2B2B]">
                          <Check className="h-4 w-4 text-[#8B0000]" />
                          <span>{inStock ? 'Ready to ship within 24 hours' : 'Notify me when available'}</span>
                        </div>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!product?.id || !inStock}
                            className="inline-flex flex-1 items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Add to Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => (product && onQuickView ? onQuickView(product) : undefined)}
                            className="inline-flex items-center justify-center gap-2 border border-[#CFC6BA] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#2B2B2B] transition hover:bg-[#F5F1EB]"
                          >
                            <Heart className="h-4 w-4" />
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default ProductDetailModal;