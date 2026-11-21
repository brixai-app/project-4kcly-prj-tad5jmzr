import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { ApiResponse, Product, Review } from '@/types';
import { cn } from '@/lib/utils';

export function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { addItem } = useCart?.() ?? {};
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, reviewRes] = await Promise.all([
          fetch(`/api/products/${encodeURIComponent(slug)}`),
          fetch(`/api/products/${encodeURIComponent(slug)}/reviews`),
        ]);
        const productJson = (await productRes.json().catch(() => null)) as ApiResponse<Product> | null;
        const reviewJson = (await reviewRes.json().catch(() => null)) as ApiResponse<Review[]> | null;
        if (!active) return;
        setProduct(productJson?.data ?? null);
        setReviews(reviewJson?.data ?? []);
      } catch {
        if (active) {
          setProduct(null);
          setReviews([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    if (slug) load();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    setSelectedSize(product?.size?.[0] ?? '');
    setSelectedColor(product?.color ?? '');
  }, [product]);

  const gallery = useMemo(() => {
    const images = product?.images?.length ? product.images : product?.image ? [product.image] : [];
    return images.slice(0, 5);
  }, [product]);

  const handleAdd = () => {
    if (!product || !addItem) return;
    setAdding(true);
    addItem({
      productId: product.id,
      quantity: 1,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    window.setTimeout(() => setAdding(false), 450);
  };

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-[#716A63]">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2B2B2B]">
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>
        <div className="mt-10 border border-[#CFC6BA] bg-[#FFFDF9] p-8 text-[#716A63]">Product not found.</div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F1EB] text-[#2B2B2B]">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2B2B2B]">
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-14 lg:grid-cols-[1.35fr_0.85fr]">
        <section className="grid gap-3 sm:grid-cols-[1fr_92px]">
          <motion.div layout className="overflow-hidden border border-[#CFC6BA] bg-[#FFFDF9]">
            <img
              src={gallery[0] ?? product.image}
              alt={product.name}
              crossOrigin="anonymous"
              className="h-[72vh] w-full object-cover"
            />
          </motion.div>
          <div className="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
            {gallery.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                className={cn(
                  'group relative aspect-[3/4] min-w-[92px] overflow-hidden border border-[#CFC6BA] bg-[#FFFDF9] transition hover:border-[#8B0000]',
                  index === 0 && 'ring-1 ring-[#8B0000]'
                )}
              >
                <img
                  src={src}
                  alt={`${product.name} ${index + 1}`}
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6 border border-[#CFC6BA] bg-[#FFFDF9] p-5 sm:p-7">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#716A63]">{product.collection ?? product.category}</p>
            <h1 className="font-['Playfair_Display'] text-4xl font-light tracking-tight sm:text-5xl">{product.name}</h1>
            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold">₹{product.price.toLocaleString()}</p>
              {product.compareAtPrice ? (
                <p className="text-sm text-[#716A63] line-through">₹{product.compareAtPrice.toLocaleString()}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#716A63]">
              <Star className="h-4 w-4 fill-current text-[#8B0000]" />
              <span>{product.rating?.toFixed(1) ?? '4.8'}</span>
              <span>•</span>
              <span>{product.reviewCount ?? reviews.length} reviews</span>
            </div>
          </div>

          <p className="max-w-xl text-sm leading-6 text-[#716A63]">{product.description ?? 'An elevated wardrobe essential crafted with precision and restraint.'}</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2B2B2B]">Size</h2>
              <span className="text-xs text-[#716A63]">{product.inStock ? 'In stock' : 'Sold out'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(product.size?.length ? product.size : ['XS', 'S', 'M', 'L', 'XL']).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition',
                    selectedSize === size
                      ? 'border-[#8B0000] bg-[#8B0000] text-white'
                      : 'border-[#CFC6BA] bg-[#FFFDF9] text-[#2B2B2B] hover:border-[#8B0000]'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2B2B2B]">Color</h2>
            <div className="flex flex-wrap gap-2">
              {(product.color ? [product.color] : ['Ivory', 'Charcoal', 'Crimson']).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition',
                    selectedColor === color
                      ? 'border-[#8B0000] bg-[#8B0000] text-white'
                      : 'border-[#CFC6BA] bg-[#FFFDF9] text-[#2B2B2B] hover:border-[#8B0000]'
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.inStock || adding}
              className="inline-flex items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {adding ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {adding ? 'Added' : 'Add to cart'}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 border border-[#CFC6BA] bg-[#FFFDF9] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#2B2B2B] transition hover:border-[#8B0000]"
            >
              <Heart className="h-4 w-4" />
              Save
            </button>
          </div>

          <div className="border-t border-[#CFC6BA] pt-5">
            <div className="grid gap-3 text-sm text-[#716A63] sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2B2B2B]">Material</p>
                <p className="mt-1">{product.material ?? 'Premium blended fabrication'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2B2B2B]">Category</p>
                <p className="mt-1">{product.category}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-['Playfair_Display'] text-2xl font-light tracking-tight">Reviews</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#716A63]">{reviews.length} entries</p>
        </div>
        <div className="grid gap-3">
          {reviews.length ? reviews.map((review) => (
            <article key={review.id} className="border border-[#CFC6BA] bg-[#FFFDF9] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{review.userName ?? 'Verified customer'}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#716A63]">{review.title ?? 'Review'}</p>
                </div>
                <div className="flex items-center gap-1 text-[#8B0000]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-4 w-4', i < review.rating ? 'fill-current' : 'opacity-20')} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#716A63]">{review.body}</p>
            </article>
          )) : (
            <div className="border border-[#CFC6BA] bg-[#FFFDF9] p-6 text-sm text-[#716A63]">No reviews yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;