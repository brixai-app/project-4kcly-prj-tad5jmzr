import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Leaf, Shirt, Watch, ShoppingBag, Circle as Icon } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

const heroImage = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85';
const atelierImage = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85';
const lookbookImages = [
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
];

const categories = [
  { label: 'Tailoring', icon: Shirt },
  { label: 'Accessories', icon: Watch },
  { label: 'Essentials', icon: Leaf },
  { label: 'New In', icon: Sparkles },
  { label: 'Bags', icon: ShoppingBag },
];

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/products');
        const json = await res.json().catch(() => ({}));
        const data = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        if (active) setProducts(data);
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const trending = useMemo(() => products.slice(0, 6), [products]);

  return (
    <main className="bg-[#F9F7F6] text-[#2E2E2E]">
      <section className="relative min-h-[92vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Editorial fashion lookbook"
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/55 via-[#0a0a0a]/20 to-transparent" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-end px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl border border-[#C9BDB2] bg-[#F9F7F6]/92 p-6 backdrop-blur-sm sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6E655E]">01 / NDDN Store</p>
            <h1 className="mt-4 font-['Playfair_Display'] text-5xl font-light leading-[0.92] tracking-tight text-[#2E2E2E] sm:text-6xl lg:text-7xl">
              A quiet luxury wardrobe, composed like a campaign.
            </h1>
            <p className="mt-5 max-w-2xl font-['Lora'] text-sm leading-7 text-[#6E655E] sm:text-base">
              Verified lookbook photography, sculpted silhouettes, and deep-crimson actions on a fine-paper canvas.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000]"
              >
                Explore Collection <ArrowRight size={16} />
              </Link>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6E655E]">
                Curated drops / atelier edits
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[#C9BDB2] bg-[#EEE8E2]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2.5">
            {categories.map(({ label, icon: Icon }) => (
              <Link
                key={label}
                to="/shop"
                className="inline-flex min-w-0 items-center gap-2 border border-[#C9BDB2] bg-[#F9F7F6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#2E2E2E] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"
              >
                <Icon size={14} />
                <span className="min-w-0 truncate">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6 sm:grid-cols-2">
            {lookbookImages.slice(0, 4).map((src, index) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className={cn(
                  'overflow-hidden border border-[#C9BDB2] bg-white',
                  index === 0 ? 'sm:col-span-2 aspect-[16/10]' : 'aspect-[3/4]'
                )}
              >
                <img src={src} alt={`Lookbook ${index + 1}`} crossOrigin="anonymous" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </motion.div>
            ))}
          </div>
          <div className="grid gap-6">
            <div className="border border-[#C9BDB2] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6E655E]">02 / Trending runway</p>
              <h2 className="mt-4 font-['Playfair_Display'] text-3xl font-light tracking-tight text-[#2E2E2E]">
                The edit, distilled into tactile essentials.
              </h2>
              <p className="mt-4 font-['Lora'] text-sm leading-7 text-[#6E655E]">
                A restrained selection of live catalog pieces, styled for movement, layering, and seasonless wear.
              </p>
            </div>
            <div className="grid gap-4">
              {loading ? (
                <div className="border border-[#C9BDB2] bg-white p-6 text-sm text-[#6E655E]">Loading live catalog...</div>
              ) : trending.length > 0 ? (
                trending.map((product) => <ProductCard key={product.id} product={product} />)
              ) : (
                <div className="border border-[#C9BDB2] bg-white p-6 text-sm text-[#6E655E]">No products available right now.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-[#C9BDB2] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6E655E]">03 / Atelier manifesto</p>
            <h2 className="mt-4 font-['Playfair_Display'] text-4xl font-light tracking-tight text-[#2E2E2E]">
              Crafted with restraint, worn with conviction.
            </h2>
            <p className="mt-4 font-['Lora'] text-sm leading-7 text-[#6E655E]">
              NDDN Store pairs verified imagery with precise silhouettes, allowing the garment, not the interface, to lead.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 border border-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#8B0000] transition-colors hover:bg-[#8B0000] hover:text-white"
            >
              Shop Latest Drop <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="aspect-[4/5] overflow-hidden border border-[#C9BDB2] bg-white">
              <img src={atelierImage} alt="Atelier portrait" crossOrigin="anonymous" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>
            <div className="grid gap-6">
              {lookbookImages.slice(4).map((src, index) => (
                <div key={src} className={cn('overflow-hidden border border-[#C9BDB2] bg-white', index === 0 ? 'aspect-[16/10]' : 'aspect-[3/4]')}>
                  <img src={src} alt={`Editorial detail ${index + 5}`} crossOrigin="anonymous" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#C9BDB2] bg-[#EEE8E2]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6E655E]">04 / Newsletter</p>
              <h2 className="mt-4 font-['Playfair_Display'] text-3xl font-light tracking-tight text-[#2E2E2E]">
                Receive the next drop before it lands.
              </h2>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Email address"
                className="min-w-0 flex-1 border border-[#C9BDB2] bg-[#F9F7F6] px-4 py-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#6E655E]"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000]"
              >
                Subscribe <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;