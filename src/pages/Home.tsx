import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Leaf, Shirt, Tag, Globe2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/products');
        const json = await res.json().catch(() => null);
        const data = (json?.data ?? json ?? []) as Product[];
        if (active) setProducts(Array.isArray(data) ? data : []);
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

  const featured = useMemo(() => products.filter((p) => p?.featured).slice(0, 6), [products]);
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p?.category).filter(Boolean))).slice(0, 4), [products]);

  const heroImage = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85';
  const bandImages = [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <div className="bg-[#F9F7F6] text-[#2B2B2B]">
      <section className="relative min-h-[100svh] overflow-hidden">
        <img src={heroImage} alt="NDDN Store editorial lookbook" crossOrigin="anonymous" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/55 via-[#0a0a0a]/20 to-transparent" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-end px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl border border-[#C9BDB2]/70 bg-[#F9F7F6]/92 p-6 backdrop-blur-[2px] sm:p-8 lg:p-10">
              <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#6E655F]">
                <Sparkles className="h-4 w-4" />
                NDDN Store
              </p>
              <h1 className="font-['Playfair_Display',serif] text-5xl font-light leading-[0.92] tracking-tight text-[#2B2B2B] sm:text-6xl lg:text-7xl">
                Tailored silhouettes, quiet luxury, and a crimson editorial pulse.
              </h1>
              <p className="mt-5 max-w-2xl font-['Lora',serif] text-base leading-7 text-[#6E655F] sm:text-lg">
                A live collection of refined essentials and statement pieces, curated with warm neutrals, sharp rules, and image-led composition.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/shop" className="inline-flex items-center gap-2 border border-[#B11226] bg-[#B11226] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#8F0E1F]">
                  Explore Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/shop" className="inline-flex items-center gap-2 border border-[#C9BDB2] bg-transparent px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#2B2B2B] transition-colors hover:bg-[#EFEAE5]">
                  Shop Latest Drop
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex lg:items-end lg:justify-end">
              <div className="w-full max-w-sm border-l border-[#F9F7F6]/40 pl-6 text-[#F9F7F6]">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#F9F7F6]/80">Collection Index</p>
                <div className="space-y-3 text-sm leading-6">
                  <div className="flex items-start gap-3"><span className="mt-1 h-px w-8 bg-[#B11226]" /><span>01 / Elevated tailoring with sculpted lines and softened structure.</span></div>
                  <div className="flex items-start gap-3"><span className="mt-1 h-px w-8 bg-[#B11226]" /><span>02 / Warm-beige layers, charcoal contrast, and tactile finishing.</span></div>
                  <div className="flex items-start gap-3"><span className="mt-1 h-px w-8 bg-[#B11226]" /><span>03 / Live inventory, editorial motion, and seamless checkout flow.</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-10 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border border-[#C9BDB2] bg-[#EFEAE5] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#C9BDB2] pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6E655F]">Trending now</p>
              <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#B11226]">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(loading ? Array.from({ length: 6 }) : featured).map((product, index) => (
                <div key={product?.id ?? `skeleton-${index}`} className="min-w-0">
                  {product ? <ProductCard product={product} /> : <div className="aspect-[3/4] animate-pulse border border-[#C9BDB2] bg-[#F9F7F6]" />}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="border border-[#C9BDB2] bg-[#F9F7F6] p-5">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#6E655F]"><Leaf className="h-4 w-4" /> Craft manifesto</p>
              <h2 className="font-['Playfair_Display',serif] text-3xl font-light tracking-tight">Precision in fabric, restraint in form, and a measured sense of drama.</h2>
              <p className="mt-4 max-w-prose font-['Lora',serif] text-sm leading-7 text-[#6E655F]">Every piece is presented with a magazine rhythm: tall imagery, thin rules, and a calm palette that lets texture and cut lead the conversation.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {bandImages.map((src, i) => (
                <div key={src} className="overflow-hidden border border-[#C9BDB2] bg-[#EFEAE5]">
                  <img src={src} alt={`Editorial band ${i + 1}`} crossOrigin="anonymous" className="h-44 w-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link key={category ?? index} to="/shop" className="group border border-[#C9BDB2] bg-[#F9F7F6] p-5 transition-colors hover:bg-[#EFEAE5]">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.35em] text-[#6E655F]">{category}</p>
                <ArrowRight className="h-4 w-4 text-[#B11226] transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#6E655F]">
                {index % 2 === 0 ? <Shirt className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                <span className="min-w-0 break-words">Explore the latest edit in this category.</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[#C9BDB2] bg-[#EFEAE5]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#6E655F]"><Globe2 className="h-4 w-4" /> Newsletter</p>
            <h2 className="font-['Playfair_Display',serif] text-4xl font-light tracking-tight">Receive the next drop before it lands.</h2>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row">
            <input type="email" placeholder="Email address" className="min-w-0 flex-1 border border-[#C9BDB2] bg-[#F9F7F6] px-4 py-3 text-sm text-[#2B2B2B] outline-none placeholder:text-[#6E655F]" />
            <button type="submit" className="inline-flex items-center justify-center gap-2 border border-[#B11226] bg-[#B11226] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#8F0E1F]">
              Subscribe <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Home;