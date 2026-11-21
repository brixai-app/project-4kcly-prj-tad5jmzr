import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Tag, Leaf, Shirt, Watch, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';

const heroImage = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85';
const craftImage = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85';
const atelierImage = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85';

type SectionsProps = { products?: Product[]; className?: string };

export function HeroBanner({ className = '' }: { className?: string } = {}) {
  return (
    <section className={cn('relative overflow-hidden bg-[#F5F1EB] text-[#2E2B28]', className)}>
      <div className="absolute inset-0">
        <img src={heroImage} alt="Editorial fashion campaign" crossOrigin="anonymous" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/35 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F5F1EB] via-transparent to-transparent opacity-70" />
      </div>
      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl items-end px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#71695F]">Issue 01 · NDDN Store</p>
            <h1 className="font-['Playfair_Display'] text-5xl font-light tracking-tight text-[#2E2B28] sm:text-6xl lg:text-7xl">
              Ivory tailoring, crimson intent, and a quieter kind of luxury.
            </h1>
          </div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="border border-[#C9BFB1] bg-[#FFFCF7]/95 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-[#8B0000]" />
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#71695F]">Seasonal edit</span>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#71695F]">
              A full-bleed lookbook of verified photography, sculpted silhouettes, and restrained gold details designed for the modern wardrobe.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-[#650000]">
                Explore Collection <ArrowRight size={16} />
              </Link>
              <span className="text-xs uppercase tracking-[0.3em] text-[#71695F]">Verified imagery only</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function TrendingDrop({ products = [] }: { products?: Product[] } = {}) {
  const featured = useMemo(() => products.filter((p) => p?.featured).slice(0, 4), [products]);
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#71695F]">Trending drop</p>
          <h2 className="mt-2 font-['Playfair_Display'] text-3xl font-light text-[#2E2B28]">Selected pieces from the live floor</h2>
        </div>
        <Link to="/shop" className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#8B0000] sm:inline-flex">
          View all <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {featured.map((product) => (
          <ProductCard key={product?.id ?? product?.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

export function CategoryShowcase({ className = '' }: { className?: string } = {}) {
  const categories = [
    { label: 'Tailoring', icon: Shirt, href: '/shop?category=Tailoring' },
    { label: 'Accessories', icon: Watch, href: '/shop?category=Accessories' },
    { label: 'Outerwear', icon: Leaf, href: '/shop?category=Outerwear' },
    { label: 'New Arrivals', icon: Sparkles, href: '/shop?sort=newest' },
  ];
  return (
    <section className={cn('mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8', className)}>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-[#C9BFB1] bg-[#FFFCF7] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#71695F]">Category index</p>
          <h3 className="mt-3 font-['Playfair_Display'] text-2xl font-light text-[#2E2B28]">A concise wardrobe map</h3>
          <div className="mt-6 flex flex-col gap-2.5">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} to={item.href} className="flex min-w-0 items-center justify-between border border-[#C9BFB1] px-4 py-3 text-sm text-[#2E2B28] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]">
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon size={16} className="shrink-0" />
                    <span className="min-w-0 truncate">{item.label}</span>
                  </span>
                  <ArrowRight size={16} className="shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[craftImage, atelierImage].map((src, index) => (
            <div key={src} className="group relative overflow-hidden border border-[#C9BFB1] bg-[#FFFCF7]">
              <img src={src} alt={`Editorial craft ${index + 1}`} crossOrigin="anonymous" className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a0a]/70 to-transparent p-5 text-white">
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">{index === 0 ? 'Craft' : 'Atelier'}</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-white/90">
                  {index === 0 ? 'Textural layers and disciplined silhouettes.' : 'Quiet luxury shaped by hand and proportion.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedLookbookGrid({ products = [] }: { products?: Product[] } = {}) {
  const selection = useMemo(() => products.slice(0, 6), [products]);
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#71695F]">Lookbook grid</p>
          <h2 className="mt-2 font-['Playfair_Display'] text-3xl font-light text-[#2E2B28]">Asymmetric product stories</h2>
        </div>
        <Tag size={18} className="text-[#8B0000]" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        {selection.map((product, index) => (
          <div key={product?.id ?? product?.slug} className={cn('lg:col-span-4', index % 3 === 0 && 'lg:col-span-5', index % 3 === 1 && 'lg:col-span-3', index % 3 === 2 && 'lg:col-span-4')}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function BrandStorySection({ className = '' }: { className?: string } = {}) {
  return (
    <section className={cn('mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8', className)}>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-stretch">
        <div className="border border-[#C9BFB1] bg-[#FFFCF7] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#71695F]">Brand story</p>
          <h2 className="mt-3 font-['Playfair_Display'] text-3xl font-light text-[#2E2B28]">Designed like an editorial, built like a boutique.</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#71695F]">
            NDDN Store pairs live product data with a refined visual language: ivory surfaces, charcoal type, deep-crimson actions, and measured gold accents. Every section is tuned for clarity, motion, and a luxury retail cadence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#2E2B28]">
            <span className="border border-[#C9BFB1] px-3 py-2">Verified photography</span>
            <span className="border border-[#C9BFB1] px-3 py-2">Live catalog</span>
            <span className="border border-[#C9BFB1] px-3 py-2">Accessible commerce</span>
          </div>
        </div>
        <div className="relative overflow-hidden border border-[#C9BFB1]">
          <img src={craftImage} alt="Craft and textile detail" crossOrigin="anonymous" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/55 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Craft manifesto</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/90">A restrained composition of texture, proportion, and movement.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewsletterSection({ className = '' }: { className?: string } = {}) {
  return (
    <section className={cn('bg-[#2E2B28] text-[#FFFCF7]', className)}>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#C9BFB1]">Newsletter</p>
          <h2 className="mt-3 font-['Playfair_Display'] text-3xl font-light">Receive the next drop before it lands.</h2>
        </div>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-[#650000]">
          Shop latest <ShoppingBag size={16} />
        </Link>
      </div>
    </section>
  );
}

export function HomeSections({ products = [], className = '' }: SectionsProps = {}) {
  return (
    <div className={cn('bg-[#F5F1EB]', className)}>
      <HeroBanner />
      <TrendingDrop products={products} />
      <CategoryShowcase />
      <FeaturedLookbookGrid products={products} />
      <BrandStorySection />
      <NewsletterSection />
    </div>
  );
}

export default HomeSections;