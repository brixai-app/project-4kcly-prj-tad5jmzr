import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, Heart, Share2, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, Review } from '@/types';
import { cn } from '@/lib/utils';
import { ProductPurchasePanel } from '@/components/ProductDetailModal';

export function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [productsRes, reviewsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/reviews'),
        ]);
        const productsJson = await productsRes.json().catch(() => ({}));
        const reviewsJson = await reviewsRes.json().catch(() => ({}));
        const products: Product[] = productsJson?.data ?? productsJson ?? [];
        const allReviews: Review[] = reviewsJson?.data ?? reviewsJson ?? [];
        const matched = products.find((item) => item?.slug === slug) ?? null;
        if (!active) return;
        setProduct(matched);
        setReviews(allReviews.filter((review) => review?.productId === matched?.id));
      } catch {
        if (active) toast.error('Unable to load product details.');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (slug) load();
    return () => {
      active = false;
    };
  }, [slug]);

  const gallery = useMemo(() => product?.images?.slice(0, 4) ?? [], [product]);
  const rating = useMemo(() => product?.rating ?? 0, [product]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-[#6E655F]">Loading editorial product view...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="border border-[#C9BDB2] bg-white p-8">
          <p className="font-serif text-2xl text-[#2B2B2B]">Product not found</p>
          <Link to="/shop" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B11226]">
            <ArrowLeft size={14} />
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#C9BDB2] pb-4">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6E655F]">
          <ArrowLeft size={14} />
          Back to shop
        </Link>
        <div className="flex items-center gap-3 text-[#6E655F]">
          <button type="button" onClick={() => toast.message('Saved to wishlist')} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
            <Heart size={14} />
            Save
          </button>
          <button type="button" onClick={() => toast.message('Share link copied')} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {gallery.map((image, index) => (
              <div key={`${image?.url ?? index}`} className={cn('overflow-hidden border border-[#C9BDB2] bg-[#EFEAE5]', index === 0 ? 'sm:col-span-2 aspect-[4/5]' : 'aspect-[3/4]')}>
                <img
                  src={image?.url ?? ''}
                  alt={image?.alt ?? product?.name ?? 'Product image'}
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="space-y-6">
          <div className="border-b border-[#C9BDB2] pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6E655F]">{product.collection ?? product.category}</p>
            <h1 className="mt-3 font-serif text-4xl leading-none text-[#2B2B2B] sm:text-5xl">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#6E655F]">
              <span className="font-semibold text-[#2B2B2B]">₹{product.price.toLocaleString()}</span>
              <span className="inline-flex items-center gap-1">
                <Star size={14} className="fill-current" />
                {rating.toFixed(1)}
              </span>
              <span>{product.reviewCount ?? reviews.length} reviews</span>
            </div>
          </div>

          <ProductPurchasePanel product={product} className="border border-[#C9BDB2] bg-white p-5" />

          <div className="space-y-4 border-t border-[#C9BDB2] pt-5">
            <p className="text-sm leading-7 text-[#2B2B2B]">{product.description}</p>
            <div className="grid gap-3 text-sm text-[#6E655F] sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="mt-0.5 text-[#B11226]" />
                <span>{product.material ?? 'Refined fabrication details available on request'}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 text-[#B11226]" />
                <span>{product.inStock === false ? 'Currently unavailable' : 'Ready to ship from the atelier'}</span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <section className="mt-10 grid gap-6 border-t border-[#C9BDB2] pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6E655F]">Editorial notes</p>
          <h2 className="font-serif text-3xl text-[#2B2B2B]">Craft, silhouette, and finish</h2>
        </div>
        <div className="space-y-4 text-sm leading-7 text-[#2B2B2B]">
          <p>{product.material ?? 'A considered composition of texture and proportion, designed to sit between occasion and everyday ritual.'}</p>
          <p>{product.color ? `Rendered in ${product.color.toLowerCase()}, the piece carries a quiet tonal depth that reads distinctly in natural light.` : 'The palette is restrained, allowing the cut and surface to lead the composition.'}</p>
        </div>
      </section>

      <section className="mt-10 border-t border-[#C9BDB2] pt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6E655F]">Reviews</p>
            <h2 className="font-serif text-3xl text-[#2B2B2B]">Client impressions</h2>
          </div>
          <p className="text-xs uppercase tracking-widest text-[#6E655F]">{reviews.length} entries</p>
        </div>
        <div className="space-y-4">
          {reviews.length > 0 ? reviews.map((review) => (
            <article key={review.id} className="border border-[#C9BDB2] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#2B2B2B]">{review.userName}</p>
                  <p className="text-xs uppercase tracking-widest text-[#6E655F]">{review.title ?? 'Verified review'}</p>
                </div>
                <div className="flex items-center gap-1 text-[#B11226]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={14} className={index < review.rating ? 'fill-current' : ''} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#2B2B2B]">{review.body}</p>
            </article>
          )) : (
            <div className="border border-[#C9BDB2] bg-[#EFEAE5] p-5 text-sm text-[#6E655F]">No reviews yet. This piece is waiting for its first impression.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductPage;