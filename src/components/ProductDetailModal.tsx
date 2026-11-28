import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Heart, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import type { Product, Review } from '@/types';

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  product?: Product;
};

const fallbackImages = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85',
];

export function ProductDetailModal({ open = false, onOpenChange = () => {}, product }: Props) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart() as any;
  const [liveProduct, setLiveProduct] = useState<Product | null>(product ?? null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const id = params?.id ?? product?.id ?? '';
  const isRoute = location?.pathname?.includes('/products/') ?? false;
  const current = liveProduct ?? product ?? null;
  const images = useMemo(() => (current?.images?.length ? current.images : [{ url: current?.image ?? fallbackImages[0], alt: current?.name ?? 'Product image' }, { url: fallbackImages[1], alt: current?.name ?? 'Alternate view' }, { url: fallbackImages[2], alt: current?.name ?? 'Detail view' }]), [current]);

  useEffect(() => {
    const controller = new AbortController();
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/products/${id}`, { signal: controller.signal }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch(`/api/products/${id}/reviews`, { signal: controller.signal }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([p, rev]) => {
      setLiveProduct((p?.data ?? p ?? product ?? null) as Product | null);
      setReviews((rev?.data ?? rev ?? []) as Review[]);
    }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [id, product]);

  useEffect(() => {
    setActiveImage(0);
    setQty(1);
    setSize(current?.sizes?.[0] ?? '');
    setColor(current?.color ?? '');
  }, [current?.id]);

  const handleAdd = () => {
    if (!current) return;
    addItem?.({ productId: current.id, name: current.name ?? 'Item', price: current.price ?? 0, quantity: qty, image: images?.[0]?.url ?? current.image, size: size || undefined, color: color || undefined, product: current });
    toast.success('Added to cart');
    if (isRoute) navigate('/shop');
  };

  const content = (
    <div className="mx-auto w-full max-w-6xl overflow-hidden border border-[#C9BDB2] bg-[#F9F7F6] text-[#2E2E2E] shadow-2xl">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border-b border-[#C9BDB2] lg:border-b-0 lg:border-r">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#EEE8E2]">
            <AnimatePresence mode="wait">
              <motion.img key={images?.[activeImage]?.url ?? 'img'} src={images?.[activeImage]?.url ?? fallbackImages[0]} alt={images?.[activeImage]?.alt ?? current?.name ?? 'Product'} crossOrigin="anonymous" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="h-full w-full object-cover" />
            </AnimatePresence>
            <div className="absolute left-4 top-4 flex items-center gap-2 bg-[#F9F7F6]/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6E655E]">
              <span>{current?.collection ?? 'Collection'}</span>
              <span className="h-1 w-1 rounded-full bg-[#8B0000]" />
              <span>{loading ? 'Loading' : 'Live'}</span>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto border-t border-[#C9BDB2] p-3">
            {images?.map((img, index) => (
              <button key={`${img?.url ?? index}`} type="button" onClick={() => setActiveImage(index)} className={cn('h-20 w-16 shrink-0 overflow-hidden border border-[#C9BDB2] bg-white transition', activeImage === index ? 'ring-1 ring-[#8B0000]' : 'opacity-70')}>
                <img src={img?.url ?? fallbackImages[index % fallbackImages.length]} alt={img?.alt ?? current?.name ?? 'Thumbnail'} crossOrigin="anonymous" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-5 p-5 lg:p-7">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6E655E]">{current?.category ?? 'Editorial Piece'}</p>
            <h2 className="font-['Playfair_Display'] text-3xl font-light tracking-tight text-[#2E2E2E] sm:text-4xl">{current?.name ?? 'Untitled Product'}</h2>
            <div className="flex items-end gap-3">
              <p className="text-2xl font-semibold text-[#8B0000]">₹{Number(current?.price ?? 0).toLocaleString('en-IN')}</p>
              {current?.compareAtPrice ? <p className="text-sm text-[#6E655E] line-through">₹{Number(current.compareAtPrice).toLocaleString('en-IN')}</p> : null}
            </div>
            <p className="max-w-prose text-sm leading-7 text-[#6E655E]">{current?.description ?? 'A refined silhouette with tactile finish and editorial presence.'}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#6E655E]">
              Size
              <select value={size} onChange={(e) => setSize(e.target.value)} className="border border-[#C9BDB2] bg-white px-3 py-3 text-sm text-[#2E2E2E] outline-none">
                {(current?.sizes?.length ? current.sizes : ['S', 'M', 'L']).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#6E655E]">
              Color
              <input value={color} onChange={(e) => setColor(e.target.value)} className="border border-[#C9BDB2] bg-white px-3 py-3 text-sm text-[#2E2E2E] outline-none" placeholder={current?.color ?? 'Stone'} />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-[#C9BDB2]">
              <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))} className="px-3 py-3 text-[#2E2E2E]"><Minus className="h-4 w-4" /></button>
              <span className="min-w-12 px-4 text-center text-sm font-semibold">{qty}</span>
              <button type="button" onClick={() => setQty((v) => v + 1)} className="px-3 py-3 text-[#2E2E2E]"><Plus className="h-4 w-4" /></button>
            </div>
            <button type="button" onClick={handleAdd} className="inline-flex flex-1 items-center justify-center gap-2 bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-[#650000]">
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
          </div>
          <div className="grid gap-3 border-t border-[#C9BDB2] pt-5">
            <div className="flex items-center justify-between text-sm"><span className="text-[#6E655E]">Material</span><span className="font-medium">{current?.material ?? 'Fine weave'}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-[#6E655E]">Availability</span><span className="inline-flex items-center gap-2 font-medium">{current?.inStock ?? true ? <Check className="h-4 w-4 text-[#8B0000]" /> : <X className="h-4 w-4 text-[#6E655E]" />}{current?.inStock ?? true ? 'In stock' : 'Sold out'}</span></div>
          </div>
          <div className="border-t border-[#C9BDB2] pt-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#6E655E]">Reviews</h3>
            <div className="space-y-3">
              {(reviews?.length ? reviews : [{ id: '1', productId: current?.id ?? '0', userName: 'Editorial Client', rating: 5, title: 'Beautiful drape', body: 'The finish feels luxurious and the fit is precise.' }]).slice(0, 2).map((review) => (
                <div key={review?.id} className="border border-[#C9BDB2] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{review?.userName ?? 'Guest'}</p>
                    <p className="text-xs text-[#6E655E]">{'★'.repeat(Math.max(1, Math.min(5, review?.rating ?? 5)))}</p>
                  </div>
                  <p className="mt-1 text-sm font-medium">{review?.title ?? 'Review'}</p>
                  <p className="mt-1 text-sm leading-6 text-[#6E655E]">{review?.body ?? 'A considered piece with strong editorial presence.'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isRoute) return <div className="min-h-screen bg-[#F9F7F6] px-4 py-6 sm:px-6 lg:px-8">{content}</div>;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} transition={{ duration: 0.25 }} className="w-full">
            <Dialog.Title className="sr-only">{current?.name ?? 'Product detail'}</Dialog.Title>
            {content}
          </motion.div>
          <Dialog.Close className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] bg-[#F9F7F6] text-[#2E2E2E]">
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ProductDetailModal;