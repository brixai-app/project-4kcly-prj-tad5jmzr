import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Leaf, Star, Truck, Shield, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import type { Product, Review } from '@/types';

const images = [
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
];

const sampleProducts: Product[] = [
  { id: '1', slug: 'silk-veil-trench', name: 'Silk Veil Trench', category: 'Outerwear', price: 18900, image: images[0], featured: true, rating: 4.9, reviewCount: 28, sizes: ['XS', 'S', 'M'], colors: ['Ivory', 'Stone'] },
  { id: '2', slug: 'atelier-drape-dress', name: 'Atelier Drape Dress', category: 'Dresses', price: 14900, image: images[1], featured: true, rating: 4.8, reviewCount: 19, sizes: ['S', 'M', 'L'], colors: ['Black', 'Wine'] },
  { id: '3', slug: 'tailored-pleat-trouser', name: 'Tailored Pleat Trouser', category: 'Trousers', price: 9900, image: images[2], featured: true, rating: 4.7, reviewCount: 14, sizes: ['28', '30', '32'], colors: ['Charcoal', 'Sand'] },
  { id: '4', slug: 'cashmere-rib-knit', name: 'Cashmere Rib Knit', category: 'Knitwear', price: 12900, image: images[3], featured: false, rating: 4.9, reviewCount: 31, sizes: ['S', 'M', 'L'], colors: ['Oat', 'Cocoa'] },
  { id: '5', slug: 'signature-leather-bag', name: 'Signature Leather Bag', category: 'Accessories', price: 16900, image: images[4], featured: false, rating: 4.8, reviewCount: 22, sizes: ['One Size'], colors: ['Black', 'Bordeaux'] },
  { id: '6', slug: 'minimal-shift-shirt', name: 'Minimal Shift Shirt', category: 'Shirts', price: 7900, image: images[5], featured: false, rating: 4.6, reviewCount: 11, sizes: ['S', 'M', 'L'], colors: ['White', 'Ecru'] },
];

const sampleReviews: Review[] = [
  { id: 'r1', productId: '1', userName: 'Aanya', rating: 5, title: 'Quietly impeccable', body: 'The drape is exacting and the fabric feels rare.', createdAt: new Date().toISOString() },
  { id: 'r2', productId: '2', userName: 'Mira', rating: 5, title: 'Editorial in motion', body: 'It moves beautifully and photographs even better.', createdAt: new Date().toISOString() },
  { id: 'r3', productId: '3', userName: 'Ishaan', rating: 4, title: 'Sharp and fluid', body: 'A precise cut with enough ease for daily wear.', createdAt: new Date().toISOString() },
];

export function HeroBanner({ className = '' }: { className?: string }) {
  return (
    <section className={cn('relative overflow-hidden border-b border-[#C9BEB4] bg-[#F9F7F6]', className)}>
      <div className="mx-auto grid min-h-[88vh] max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="relative min-h-[56vh] lg:min-h-[88vh]">
          <img src={images[0]} alt="Editorial campaign" crossOrigin="anonymous" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/35 via-transparent to-transparent" />
        </div>
        <div className="relative flex items-end bg-[#F1ECE7] px-6 py-10 sm:px-10 lg:px-12">
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#6F665F]">Collection 01</p>
            <h1 className="font-['Playfair_Display'] text-5xl font-light tracking-tight text-[#2E2E2E] sm:text-6xl lg:text-7xl">
              NDDN Store
            </h1>
            <p className="mt-5 max-w-lg font-['Lora'] text-base leading-7 text-[#6F665F]">
              Warm neutrals, deep-crimson actions, and precise silhouettes shaped for a modern wardrobe with editorial restraint.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000]">
                Explore Collection <ArrowRight size={16} />
              </Link>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6F665F]">Luxury fashion storefront</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MasonryLookbook({ products = sampleProducts, className = '' }: { products?: Product[]; className?: string }) {
  const items = products?.length ? products : sampleProducts;
  return (
    <section className={cn('mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8', className)}>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6F665F]">Lookbook</p>
          <h2 className="mt-2 font-['Playfair_Display'] text-3xl font-light text-[#2E2E2E] sm:text-4xl">Asymmetric compositions</h2>
        </div>
        <Link to="/shop" className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#8B0000] sm:inline-flex">
          Shop latest <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-12">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-7">
          <img src={images[1]} alt="Lookbook frame one" crossOrigin="anonymous" className="h-[34rem] w-full object-cover" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-5">
          <img src={images[2]} alt="Lookbook frame two" crossOrigin="anonymous" className="h-[18rem] w-full object-cover" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <img src={images[3]} alt="Lookbook frame three" crossOrigin="anonymous" className="h-[16rem] w-full object-cover" />
            <img src={images[4]} alt="Lookbook frame four" crossOrigin="anonymous" className="h-[16rem] w-full object-cover" />
          </div>
        </motion.div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

export function ProductGallery({ products = sampleProducts, className = '' }: { products?: Product[]; className?: string }) {
  return (
    <section className={cn('mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8', className)}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-['Playfair_Display'] text-3xl font-light text-[#2E2E2E]">Featured edit</h2>
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#8B0000]">
          View all <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products?.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

export function SizeColorSelector({ sizes = ['S', 'M', 'L'], colors = ['Ivory', 'Black'], className = '' }: { sizes?: string[]; colors?: string[]; className?: string }) {
  return (
    <div className={cn('space-y-5 border border-[#C9BEB4] bg-white p-4', className)}>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#6F665F]">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => <button key={size} className="min-w-0 border border-[#C9BEB4] px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#2E2E2E] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]">{size}</button>)}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#6F665F]">Color</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => <button key={color} className="min-w-0 border border-[#C9BEB4] px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#2E2E2E] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]">{color}</button>)}
        </div>
      </div>
    </div>
  );
}

export function ReviewList({ reviews = sampleReviews, className = '' }: { reviews?: Review[]; className?: string }) {
  return (
    <section className={cn('mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8', className)}>
      <h2 className="mb-6 font-['Playfair_Display'] text-3xl font-light text-[#2E2E2E]">Reviews</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.id} className="border border-[#C9BEB4] bg-white p-5">
            <div className="flex items-center gap-1 text-[#8B0000]">{Array.from({ length: review.rating ?? 0 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
            <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#2E2E2E]">{review.title ?? review.userName}</h3>
            <p className="mt-2 text-sm leading-6 text-[#6F665F]">{review.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ManifestoSection({ className = '' }: { className?: string }) {
  return (
    <section className={cn('mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8', className)}>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <img src={images[5]} alt="Craft manifesto" crossOrigin="anonymous" className="h-[28rem] w-full object-cover" />
        </div>
        <div className="flex items-end border border-[#C9BEB4] bg-[#F1ECE7] p-8 lg:col-span-7">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#6F665F]">Manifesto</p>
            <h2 className="font-['Playfair_Display'] text-4xl font-light text-[#2E2E2E] sm:text-5xl">Precision, warmth, and quiet confidence.</h2>
            <p className="mt-4 max-w-xl font-['Lora'] text-base leading-7 text-[#6F665F]">
              Every piece is framed with restraint: fine rules, tactile surfaces, and silhouettes that feel composed from first glance to final wear.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#2E2E2E]">
              <span className="inline-flex items-center gap-2 border border-[#C9BEB4] px-3 py-2"><Leaf size={14} /> Natural fibers</span>
              <span className="inline-flex items-center gap-2 border border-[#C9BEB4] px-3 py-2"><Shield size={14} /> Secure checkout</span>
              <span className="inline-flex items-center gap-2 border border-[#C9BEB4] px-3 py-2"><Truck size={14} /> Fast delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewsletterPanel({ className = '' }: { className?: string }) {
  return (
    <section className={cn('mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8', className)}>
      <div className="grid gap-4 border border-[#C9BEB4] bg-white p-6 lg:grid-cols-12 lg:p-8">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6F665F]">Newsletter</p>
          <h2 className="mt-2 font-['Playfair_Display'] text-3xl font-light text-[#2E2E2E] sm:text-4xl">Receive the next drop first.</h2>
        </div>
        <form className="flex flex-col gap-3 lg:col-span-5 lg:justify-end">
          <input type="email" placeholder="Email address" className="border border-[#C9BEB4] bg-[#F9F7F6] px-4 py-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#6F665F]" />
          <button type="button" className="inline-flex items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000]">
            Subscribe <Sparkles size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}

export default MasonryLookbook;