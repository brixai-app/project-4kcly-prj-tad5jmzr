import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, Heart, ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import type { Product, Review } from '@/types';

type Props = { open?: boolean; onOpenChange?: (open: boolean) => void; className?: string };
type AuthClient = { getSession?: () => Promise<{ data?: { user?: { id?: string; email?: string; name?: string } | null } }>; signIn?: (p: { email: string; password: string }) => Promise<unknown> };
const authClient = (globalThis as { authClient?: AuthClient }).authClient;

const fallbackProduct: Product = {
  id: 'fallback',
  slug: 'signature-tailored-coat',
  name: 'Signature Tailored Coat',
  category: 'Outerwear',
  price: 18900,
  currency: '₹',
  description: 'A sculpted coat in a warm neutral wool blend with a clean shoulder and fluid drape.',
  image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
  gallery: [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
  ],
  sizes: ['XS', 'S', 'M', 'L'],
  colors: ['Oat', 'Espresso', 'Crimson'],
  material: 'Wool blend',
  inStock: true,
  rating: 4.8,
  reviewCount: 18,
};

function ProductGallery({ images = [], name = '' }: { images?: string[]; name?: string }) {
  const list = images.length ? images : [fallbackProduct.image, ...(fallbackProduct.gallery ?? [])];
  return (
    <div className="grid grid-cols-2 gap-2">
      {list.slice(0, 4).map((src, i) => (
        <motion.div key={`${src}-${i}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: i * 0.05 }} className={cn('overflow-hidden border border-[#C9BEB4] bg-white', i === 0 ? 'col-span-2 aspect-[4/5]' : 'aspect-[3/4]')}>
          <img src={src} alt={`${name} ${i + 1}`} crossOrigin="anonymous" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        </motion.div>
      ))}
    </div>
  );
}

function ProductDetailView({ className = '' }: { className?: string }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart() as { addItem?: (product: Product, quantity?: number, size?: string, color?: string) => void };
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<{ id?: string; email?: string; name?: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [pRes, rRes, session] = await Promise.all([
          fetch(`/api/products/${id ?? ''}`),
          fetch(`/api/reviews?productId=${encodeURIComponent(id ?? '')}`),
          authClient?.getSession?.().catch(() => null) ?? Promise.resolve(null),
        ]);
        const pJson = (await pRes.json().catch(() => ({}))) as { data?: Product };
        const rJson = (await rRes.json().catch(() => ({}))) as { data?: Review[] };
        if (!active) return;
        setProduct(pJson?.data ?? fallbackProduct);
        setReviews(rJson?.data ?? []);
        setUser(session?.data?.user ?? null);
        setSize((pJson?.data?.sizes?.[0] ?? fallbackProduct.sizes?.[0] ?? 'M') as string);
        setColor((pJson?.data?.colors?.[0] ?? fallbackProduct.colors?.[0] ?? 'Oat') as string);
      } catch {
        if (active) {
          setProduct(fallbackProduct);
          setReviews([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const images = useMemo(() => [product?.image ?? fallbackProduct.image, ...(product?.gallery ?? fallbackProduct.gallery ?? [])], [product]);
  const handleAdd = () => {
    if (!product) return;
    if (!product.inStock) return toast.error('This piece is currently unavailable.');
    addItem?.(product, 1, size || product.sizes?.[0] || '', color || product.colors?.[0] || '');
    toast.success('Added to cart');
  };

  const submitReview = async () => {
    if (!user?.email) return toast.error('Please sign in to leave a review.');
    if (!reviewBody.trim()) return toast.error('Write a review first.');
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product?.id ?? id, userName: user?.name ?? user?.email ?? 'Guest', rating, title: reviewTitle, body: reviewBody }),
      });
      const json = (await res.json().catch(() => ({}))) as { data?: Review; error?: string };
      if (!res.ok) throw new Error(json?.error ?? 'Unable to submit review');
      setReviews((prev) => [json?.data ?? { id: crypto.randomUUID(), productId: product?.id ?? id ?? '', userName: user?.name ?? user?.email ?? 'Guest', rating, title: reviewTitle, body: reviewBody, createdAt: new Date().toISOString() }, ...prev]);
      setReviewBody('');
      setReviewTitle('');
      setRating(5);
      toast.success('Review published');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <div className={cn('mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8', className)}>
      <div className="mb-4 flex items-center justify-between border-b border-[#C9BEB4] pb-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F] transition hover:text-[#2E2E2E]">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">
          <span>{product?.category ?? fallbackProduct.category}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{product?.name ?? fallbackProduct.name}</span>
        </div>
      </div>
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="aspect-[4/5] animate-pulse bg-[#F1ECE7]" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse bg-[#F1ECE7]" />
            <div className="h-4 w-full animate-pulse bg-[#F1ECE7]" />
            <div className="h-4 w-5/6 animate-pulse bg-[#F1ECE7]" />
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <ProductGallery images={images} name={product?.name ?? fallbackProduct.name} />
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">{product?.category ?? fallbackProduct.category}</p>
            <h1 className="font-['Playfair_Display'] text-4xl font-light tracking-tight text-[#2E2E2E] md:text-6xl">{product?.name ?? fallbackProduct.name}</h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-[#6F665F]">
              <span className="font-semibold text-[#2E2E2E]">{product?.currency ?? '₹'}{(product?.price ?? fallbackProduct.price).toLocaleString()}</span>
              <span className="h-1 w-1 rounded-full bg-[#C9BEB4]" />
              <span>{product?.rating ?? fallbackProduct.rating} rating</span>
              <span className="h-1 w-1 rounded-full bg-[#C9BEB4]" />
              <span>{product?.reviewCount ?? reviews.length} reviews</span>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#6F665F]">{product?.description ?? fallbackProduct.description}</p>
            <div className="mt-6 space-y-5 border-t border-[#C9BEB4] pt-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Size</p>
                <div className="flex flex-wrap gap-2">
                  {(product?.sizes ?? fallbackProduct.sizes ?? []).map((s) => (
                    <button key={s} onClick={() => setSize(s)} className={cn('min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition', size === s ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BEB4] bg-white text-[#2E2E2E]')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Color</p>
                <div className="flex flex-wrap gap-2">
                  {(product?.colors ?? fallbackProduct.colors ?? []).map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={cn('min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition', color === c ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BEB4] bg-white text-[#2E2E2E]')}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#650000]">
                  <ShoppingCart className="h-4 w-4" /> Add to cart
                </button>
                <button className="inline-flex items-center gap-2 border border-[#C9BEB4] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#2E2E2E] transition hover:border-[#8B0000] hover:text-[#8B0000]">
                  <Heart className="h-4 w-4" /> Save
                </button>
              </div>
            </div>
            <div className="mt-8 border-t border-[#C9BEB4] pt-6">
              <h2 className="font-['Playfair_Display'] text-2xl font-light text-[#2E2E2E]">Reviews</h2>
              <div className="mt-4 space-y-4">
                {reviews.slice(0, 4).map((review) => (
                  <div key={review.id} className="border border-[#C9BEB4] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#2E2E2E]">{review.userName}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]"><Check className="h-3.5 w-3.5" /> {review.rating}/5</span>
                    </div>
                    <p className="mt-2 text-sm text-[#6F665F]">{review.title ?? 'Review'}</p>
                    <p className="mt-1 text-sm leading-6 text-[#2E2E2E]">{review.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 border border-[#C9BEB4] bg-[#F1ECE7] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Write a review</p>
                <div className="mt-3 grid gap-3">
                  <input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Title" className="w-full border border-[#C9BEB4] bg-white px-3 py-2 text-sm text-[#2E2E2E] outline-none" />
                  <textarea value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} placeholder="Your thoughts" rows={4} className="w-full border border-[#C9BEB4] bg-white px-3 py-2 text-sm text-[#2E2E2E] outline-none" />
                  <div className="flex items-center gap-2">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <button key={n} onClick={() => setRating(n)} className={cn('text-xs font-semibold uppercase tracking-[0.2em]', rating === n ? 'text-[#8B0000]' : 'text-[#6F665F]')}>
                        {n}
                      </button>
                    ))}
                    <button onClick={submitReview} disabled={submitting} className="ml-auto inline-flex items-center gap-2 bg-[#8B0000] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60">
                      {submitting ? 'Publishing' : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return content;
}

export function ProductDetailModal({ open = false, onOpenChange = () => {}, className = '' }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className={cn('fixed inset-0 z-50 overflow-y-auto bg-[#F9F7F6] outline-none', className)}>
          <div className="sticky top-0 z-10 border-b border-[#C9BEB4] bg-[#F9F7F6]/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
              <Dialog.Title className="font-['Playfair_Display'] text-lg font-light tracking-tight text-[#2E2E2E]">Product Detail</Dialog.Title>
              <Dialog.Close asChild>
                <button className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BEB4] bg-white text-[#2E2E2E] transition hover:border-[#8B0000] hover:text-[#8B0000]">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          <ProductDetailView className={className} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ProductDetailModal;