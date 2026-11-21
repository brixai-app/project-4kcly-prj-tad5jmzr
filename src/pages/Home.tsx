import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState<string>(
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
  );

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch('/api/products');
        const json = (await res.json()) as { data?: Product[] };
        if (alive) setProducts(Array.isArray(json?.data) ? json.data : []);
      } catch {
        if (alive) setProducts([]);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const featured = useMemo(() => products.filter((p) => p?.featured).slice(0, 4), [products]);
  const categories = ['tailoring', 'outerwear', 'knitwear', 'shirts', 'trousers', 'accessories'];

  const heroImages = [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
  ];

  return (
    <div className="bg-[#F5F1EB] text-[#2B2B2B]">
      <section className="relative overflow-hidden border-b border-[#CFC6BA]">
        <div className="grid min-h-[92vh] lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative min-h-[62vh] lg:min-h-[92vh]">
            <motion.img
              key={activeImage}
              src={activeImage}
              alt="NDDN Store editorial lookbook"
              crossOrigin="anonymous"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-10">
              <div className="max-w-2xl border border-white/30 bg-[#FFFDF9]/90 p-5 backdrop-blur-sm sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#716A63]">Issue 01 / NDDN Store</p>
                <h1 className="mt-3 font-serif text-5xl font-light tracking-tight text-[#2B2B2B] sm:text-6xl lg:text-7xl">
                  Quiet luxury, sharply cut.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#716A63] sm:text-base">
                  Warm ivory canvases, deep-crimson actions, and precise silhouettes shaped for the modern wardrobe.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000]"
                  >
                    Explore Collection <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveImage(heroImages[(heroImages.indexOf(activeImage) + 1) % heroImages.length] ?? heroImages[0])}
                    className="inline-flex items-center gap-2 border border-[#CFC6BA] bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B] transition-colors hover:bg-[#F5F1EB]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Change Frame
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-rows-2 border-t border-[#CFC6BA] lg:border-l lg:border-t-0">
            {heroImages.slice(1).map((src, index) => (
              <motion.button
                key={src}
                type="button"
                onClick={() => setActiveImage(src)}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  'relative min-h-[30vh] overflow-hidden border-b border-[#CFC6BA] text-left last:border-b-0',
                  index === 0 ? 'lg:min-h-0' : 'lg:min-h-0',
                )}
              >
                <img src={src} alt="Seasonal frame" crossOrigin="anonymous" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0 bg-black/10" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#CFC6BA] bg-[#FFFDF9]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#716A63]">Collection index</p>
              <h2 className="mt-2 font-serif text-3xl font-light tracking-tight text-[#2B2B2B] sm:text-4xl">A concise wardrobe, edited by category.</h2>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8B0000]">
              View all categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/shop?category=${category}`}
                className="min-w-0 border border-[#CFC6BA] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2B2B2B] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#716A63]">Trending now</p>
            <h2 className="mt-2 font-serif text-3xl font-light tracking-tight text-[#2B2B2B]">Live product drop</h2>
          </div>
          <Link to="/shop" className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8B0000] sm:inline-flex">
            Shop latest <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((product, index) => (
            <motion.article
              key={product?.id ?? index}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="group border border-[#CFC6BA] bg-[#FFFDF9]"
            >
              <Link to={`/product/${product?.slug ?? product?.id ?? ''}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F1EB]">
                  <img
                    src={product?.image ?? heroImages[index % heroImages.length] ?? heroImages[0]}
                    alt={product?.name ?? 'Featured product'}
                    crossOrigin="anonymous"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold uppercase tracking-[0.28em] text-[#716A63]">{product?.collection ?? product?.category ?? 'Collection'}</p>
                      <h3 className="mt-2 truncate text-sm font-semibold text-[#2B2B2B]">{product?.name ?? 'Untitled piece'}</h3>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-[#2B2B2B]">₹{Number(product?.price ?? 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B0000] opacity-0 transition-opacity group-hover:opacity-100">
                    Quick view <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#CFC6BA] bg-[#FFFDF9]">
        <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-[#CFC6BA] p-6 lg:border-b-0 lg:border-r lg:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#716A63]">Craft manifesto</p>
            <h2 className="mt-3 font-serif text-4xl font-light tracking-tight text-[#2B2B2B]">Precision tailoring, softened by texture.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#716A63]">
              Each silhouette is designed to move between ceremony and routine, balancing structure, drape, and a restrained palette.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8B0000]">
              <Star className="h-4 w-4" />
              Editorial quality, daily wearability
            </div>
          </div>
          <div className="grid gap-0 sm:grid-cols-2">
            <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80" alt="Craft detail" crossOrigin="anonymous" className="h-full min-h-[260px] w-full object-cover" />
            <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80" alt="Craft detail" crossOrigin="anonymous" className="h-full min-h-[260px] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-[#F5F1EB]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 border border-[#CFC6BA] bg-[#FFFDF9] p-6 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#716A63]">Newsletter</p>
              <h2 className="mt-2 font-serif text-3xl font-light tracking-tight text-[#2B2B2B]">Receive the next drop before it lands.</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000]"
            >
              Join the list <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;