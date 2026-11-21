import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Heart, ShoppingCart, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import type { Product, Review } from '@/types';

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  productId?: string;
  product?: Product | null;
};

const fallbackImages = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85',
];

export function ProductDetailExperience({ productId = '', product = null, open = false, onOpenChange = () => {} }: Props = {}) {
  const cart = useCart?.() ?? ({} as ReturnType<typeof useCart>);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const images = useMemo(() => (product?.images?.length ? product.images : fallbackImages.map((src, i) => ({ src, alt: `${product?.name ?? 'Product'} look ${i + 1}` }))), [product]);
  const variants = product?.variants ?? [];
  const stock = product?.stock ?? 0;
  const selectedVariant = variants.find((v) => v.label === size) ?? variants[0];
  const available = selectedVariant?.stock ?? stock;
  const canSubmit = title.trim().length > 2 && body.trim().length > 10 && rating >= 1;

  useEffect(() => {
    if (!open || !product?.id) return;
    setLoading(true);
    fetch(`/api/products/${encodeURIComponent(product.id)}/reviews`)
      .then((r) => r.json())
      .then((json) => setReviews((json?.data ?? []) as Review[]))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [open, product?.id]);

  useEffect(() => {
    setActive(0);
    setSize(variants?.[0]?.label ?? '');
  }, [product?.id]);

  const addToCart = () => {
    if (!product) return;
    if (available <= 0) return toast.error('Selected size is out of stock.');
    cart?.addItem?.({
      id: `${product.id}-${size || 'default'}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency ?? 'INR',
      quantity: 1,
      image: images?.[active]?.src ?? images?.[0]?.src ?? '',
      size: size || undefined,
      color: selectedVariant?.color,
      stock: available,
    });
    toast.success('Added to cart.');
  };

  const submitReview = async () => {
    if (!product || !canSubmit) return;
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Unable to submit review');
      setReviews((prev) => [json?.data ?? { id: crypto.randomUUID(), productId: product.id, author: { name: 'You' }, rating, title, body, createdAt: new Date().toISOString() }, ...prev]);
      setTitle('');
      setBody('');
      setRating(5);
      toast.success('Review submitted.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to submit review');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-full bg-[#F5F1EB] text-[#2E2B28]">
            <div className="mx-auto grid min-h-screen max-w-7xl gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative border-b border-[#C9BFB1] lg:border-b-0 lg:border-r">
                <div className="sticky top-0 flex items-center justify-between border-b border-[#C9BFB1] bg-[#FFFCF7]/90 px-4 py-3 backdrop-blur">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#71695F]">Quick View</div>
                  <Dialog.Close className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BFB1] text-[#2E2B28] transition hover:bg-[#8B0000] hover:text-white">
                    <X className="h-4 w-4" />
                  </Dialog.Close>
                </div>
                <div className="grid gap-3 p-4 lg:grid-cols-[88px_1fr] lg:p-6">
                  <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                    {images.map((img, i) => (
                      <button key={`${img.src}-${i}`} onClick={() => setActive(i)} className={cn('group relative aspect-[3/4] w-20 shrink-0 overflow-hidden border transition', active === i ? 'border-[#8B0000]' : 'border-[#C9BFB1]')}>
                        <img src={img.src} alt={img.alt ?? product?.name ?? 'Product image'} crossOrigin="anonymous" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      </button>
                    ))}
                  </div>
                  <div className="relative overflow-hidden border border-[#C9BFB1] bg-white">
                    <AnimatePresence mode="wait">
                      <motion.img key={images?.[active]?.src ?? active} src={images?.[active]?.src ?? ''} alt={images?.[active]?.alt ?? product?.name ?? 'Product image'} crossOrigin="anonymous" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="aspect-[4/5] w-full object-cover" />
                    </AnimatePresence>
                    <div className="absolute left-4 top-4 flex items-center gap-2 bg-[#FFFCF7]/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#71695F]">
                      <Star className="h-3 w-3 fill-[#8B0000] text-[#8B0000]" />
                      {product?.rating?.toFixed?.(1) ?? '4.8'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="border-b border-[#C9BFB1] px-4 py-6 lg:px-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#71695F]">{product?.collection ?? product?.category ?? 'Collection'}</div>
                  <h2 className="mt-3 font-['Playfair_Display'] text-4xl font-light tracking-tight text-[#2E2B28]">{product?.name ?? 'Untitled Piece'}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#71695F]">{product?.description ?? 'An editorial silhouette with precise tailoring, tactile depth, and a restrained finish.'}</p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#71695F]">Price</div>
                      <div className="mt-1 font-['Playfair_Display'] text-3xl text-[#2E2B28]">₹{product?.price?.toLocaleString?.('en-IN') ?? '0'}</div>
                    </div>
                    <div className="text-right text-xs font-semibold uppercase tracking-[0.3em] text-[#71695F]">{available > 0 ? `${available} in stock` : 'Sold out'}</div>
                  </div>
                </div>
                <div className="grid gap-6 px-4 py-6 lg:px-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-[#71695F]">
                      <span>Size</span>
                      <span>{size || 'Select'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants.length ? variants.map((v) => (
                        <button key={v.id} onClick={() => setSize(v.label)} className={cn('min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition', size === v.label ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BFB1] bg-white text-[#2E2B28]')}>
                          {v.label}
                        </button>
                      )) : <div className="text-sm text-[#71695F]">One size available.</div>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={addToCart} disabled={available <= 0} className="inline-flex flex-1 items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-50">
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <button className="inline-flex h-12 w-12 items-center justify-center border border-[#C9BFB1] bg-white text-[#2E2B28] transition hover:border-[#8B0000] hover:text-[#8B0000]">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="border-t border-[#C9BFB1] pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-['Playfair_Display'] text-2xl font-light">Reviews</h3>
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#71695F]">{reviews.length} notes</div>
                    </div>
                    <div className="mt-4 space-y-4">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border border-[#C9BFB1] bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">{review.author?.name ?? 'Guest'}</div>
                              <div className="text-xs text-[#71695F]">{new Date(review.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="flex items-center gap-1 text-[#8B0000]">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</div>
                          </div>
                          <div className="mt-3 text-sm leading-6 text-[#2E2B28]">{review.body}</div>
                        </div>
                      ))}
                      {!reviews.length && !loading && <div className="text-sm text-[#71695F]">No reviews yet. Be the first to leave a note.</div>}
                    </div>
                  </div>
                  <div className="border-t border-[#C9BFB1] pt-6">
                    <h3 className="font-['Playfair_Display'] text-2xl font-light">Write a review</h3>
                    <div className="mt-4 grid gap-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setRating((r) => Math.max(1, r - 1))} className="border border-[#C9BFB1] p-2"><ChevronDown className="h-4 w-4" /></button>
                        <div className="min-w-12 text-center text-sm font-semibold">{rating}/5</div>
                        <button onClick={() => setRating((r) => Math.min(5, r + 1))} className="border border-[#C9BFB1] p-2"><ChevronUp className="h-4 w-4" /></button>
                      </div>
                      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title" className="border border-[#C9BFB1] bg-white px-3 py-3 text-sm outline-none placeholder:text-[#71695F]" />
                      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share fit, fabric, and finish." rows={4} className="border border-[#C9BFB1] bg-white px-3 py-3 text-sm outline-none placeholder:text-[#71695F]" />
                      <button onClick={submitReview} disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-50">
                        <Check className="h-4 w-4" />
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ProductDetailModal(props: Props = {}) {
  return <ProductDetailExperience {...props} />;
}

export default ProductDetailModal;