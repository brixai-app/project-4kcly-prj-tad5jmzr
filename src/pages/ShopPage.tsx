import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Filter, Search, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Product, ProductCategory } from '@/types';
import { ProductCard } from '@/components/ProductCard';

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const json = await res.json().catch(() => null);
        const payload = json?.data ?? json ?? [];
        const list = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
        if (active) setProducts(list.filter(Boolean));
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

  const categories = useMemo(() => {
    const base = ['all', 'tailoring', 'outerwear', 'knitwear', 'shirts', 'trousers', 'accessories'];
    const fromData = Array.from(new Set(products.map((p) => String(p?.category ?? '').toLowerCase()).filter(Boolean)));
    return Array.from(new Set([...base, ...fromData]));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesQuery =
        !q ||
        [p?.name, p?.description, p?.collection, p?.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      const matchesCategory = category === 'all' || String(p?.category ?? '').toLowerCase() === category.toLowerCase();
      return matchesQuery && matchesCategory;
    });

    const sorted = [...list].sort((a, b) => {
      if (sort === 'price-asc') return (a?.price ?? 0) - (b?.price ?? 0);
      if (sort === 'price-desc') return (b?.price ?? 0) - (a?.price ?? 0);
      if (sort === 'rating') return (b?.rating ?? 0) - (a?.rating ?? 0);
      if (sort === 'newest') return new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime();
      return Number(Boolean(b?.featured)) - Number(Boolean(a?.featured));
    });
    return sorted;
  }, [products, query, category, sort]);

  const skeletons = Array.from({ length: 8 });

  return (
    <main className="bg-[#F5F1EB] text-[#2B2B2B]">
      <section className="border-b border-[#CFC6BA] bg-[#FFFDF9]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#716A63]">Shop</p>
              <h1 className="mt-2 font-['Playfair_Display'] text-4xl font-light tracking-tight sm:text-5xl">NDDN Store</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#716A63]">
                A curated edit of tailoring, outerwear, and refined essentials shaped by warm ivory surfaces and deep-crimson accents.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#716A63]">
              <span>{filtered.length} pieces</span>
              <span className="h-4 w-px bg-[#CFC6BA]" />
              <span>Editorial selection</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="sticky top-24 h-fit border border-[#CFC6BA] bg-[#FFFDF9] p-4">
          <div className="flex items-center gap-2 border-b border-[#CFC6BA] pb-4">
            <Filter className="h-4 w-4" />
            <h2 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.28em]">Filters</h2>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            <label className="flex items-center gap-2 border border-[#CFC6BA] bg-white px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-[#716A63]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-[#716A63]"
              />
            </label>

            <div className="flex items-center gap-2 border border-[#CFC6BA] bg-white px-3 py-2">
              <Sliders className="h-4 w-4 shrink-0 text-[#716A63]" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="min-w-0 w-full bg-transparent text-sm outline-none"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#716A63]">Category</p>
              <div className="mt-3 flex flex-col gap-2.5">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={cn(
                      'flex items-center justify-between border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] transition-colors',
                      category === item ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#CFC6BA] bg-white text-[#2B2B2B] hover:border-[#8B0000]'
                    )}
                  >
                    <span className="min-w-0 truncate">{item}</span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-2 inline-flex items-center justify-center border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000]"
            >
              View Cart & Checkout
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#CFC6BA] pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#716A63]">
              {loading ? 'Loading collection' : `${filtered.length} results`}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#716A63]">Masonry edit</p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
            {categories.slice(0, 6).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  'border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]',
                  category === item ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#CFC6BA] bg-white text-[#2B2B2B]'
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {skeletons.map((_, i) => (
                <div key={i} className="border border-[#CFC6BA] bg-[#FFFDF9]">
                  <div className="aspect-[3/4] animate-pulse bg-[#E7E0D6]" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-24 animate-pulse bg-[#E7E0D6]" />
                    <div className="h-4 w-3/4 animate-pulse bg-[#E7E0D6]" />
                    <div className="h-3 w-16 animate-pulse bg-[#E7E0D6]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div layout className="columns-1 gap-4 sm:columns-2 xl:columns-3">
              {filtered.map((product) => (
                <motion.div key={product?.id ?? product?.slug} layout className="mb-4 break-inside-avoid">
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ShopPage;