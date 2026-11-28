import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sliders, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

type SortBy = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

const categoryOptions = ['All', 'Outerwear', 'Dresses', 'Tailoring', 'Knitwear', 'Accessories', 'Footwear', 'Shirts', 'Trousers'];
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
const colorOptions = ['Ivory', 'Black', 'Crimson', 'Stone', 'Olive', 'Navy'];

const fallbackImages = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
];

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('featured');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const json = await res.json().catch(() => ({}));
        const payload = Array.isArray(json?.data) ? json.data : Array.isArray(json?.products) ? json.products : Array.isArray(json?.items) ? json.items : [];
        if (active) setProducts(payload ?? []);
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

  const normalizedProducts = useMemo(() => {
    return (products ?? []).map((product, index) => ({
      ...product,
      image: product?.image || fallbackImages[index % fallbackImages.length],
      category: product?.category ?? 'Accessories',
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minPrice === '' ? Number.NEGATIVE_INFINITY : Number(minPrice);
    const max = maxPrice === '' ? Number.POSITIVE_INFINITY : Number(maxPrice);

    const list = normalizedProducts.filter((product) => {
      const categoryMatch = category === 'All' || String(product?.category ?? '').toLowerCase() === category.toLowerCase();
      const sizeMatch = !size || (product?.sizes ?? []).some((s) => String(s ?? '').toLowerCase() === size.toLowerCase());
      const colorMatch = !color || (product?.colors ?? []).some((c) => String(c ?? '').toLowerCase() === color.toLowerCase());
      const priceMatch = (product?.price ?? 0) >= min && (product?.price ?? 0) <= max;
      const textMatch =
        !q ||
        [product?.name, product?.category, product?.description, product?.material]
          .filter(Boolean)
          .some((value) => String(value ?? '').toLowerCase().includes(q));
      return categoryMatch && sizeMatch && colorMatch && priceMatch && textMatch;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return (a?.price ?? 0) - (b?.price ?? 0);
      if (sortBy === 'price-desc') return (b?.price ?? 0) - (a?.price ?? 0);
      if (sortBy === 'rating') return (b?.rating ?? 0) - (a?.rating ?? 0);
      if (sortBy === 'newest') return new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime();
      return Number(Boolean(b?.featured)) - Number(Boolean(a?.featured));
    });
  }, [normalizedProducts, query, category, size, color, minPrice, maxPrice, sortBy]);

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setSize('');
    setColor('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
  };

  return (
    <main className="bg-[#F9F7F6] text-[#2E2E2E]">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border border-[#C9BEB4] bg-[#F1ECE7] p-4">
            <div className="flex items-center justify-between gap-3 border-b border-[#C9BEB4] pb-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Filters</p>
                <h1 className="truncate font-['Playfair_Display'] text-2xl font-light tracking-tight">Shop the edit</h1>
              </div>
              <Sliders className="h-4 w-4 shrink-0 text-[#8B0000]" />
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <label className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Search</span>
                <div className="flex items-center gap-2 border border-[#C9BEB4] bg-[#F9F7F6] px-3 py-2">
                  <Search className="h-4 w-4 shrink-0 text-[#6F665F]" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search collection" className="w-full bg-transparent text-sm outline-none placeholder:text-[#6F665F]" />
                </div>
              </label>

              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Category</span>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={cn(
                        'min-w-0 border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] transition',
                        category === item ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BEB4] bg-[#F9F7F6] text-[#2E2E2E]'
                      )}
                    >
                      <span className="block truncate">{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Size</span>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((item) => (
                    <button key={item} type="button" onClick={() => setSize(size === item ? '' : item)} className={cn('border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition', size === item ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BEB4] bg-[#F9F7F6] text-[#2E2E2E]')}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Color</span>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((item) => (
                    <button key={item} type="button" onClick={() => setColor(color === item ? '' : item)} className={cn('border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition', color === item ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BEB4] bg-[#F9F7F6] text-[#2E2E2E]')}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Min</span>
                  <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} inputMode="numeric" placeholder="0" className="border border-[#C9BEB4] bg-[#F9F7F6] px-3 py-2 text-sm outline-none" />
                </label>
                <label className="flex flex-col gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Max</span>
                  <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} inputMode="numeric" placeholder="99999" className="border border-[#C9BEB4] bg-[#F9F7F6] px-3 py-2 text-sm outline-none" />
                </label>
              </div>

              <button type="button" onClick={clearFilters} className="border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#650000]">
                Reset filters
              </button>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-5 flex flex-col gap-3 border-b border-[#C9BEB4] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Catalog</p>
                <h2 className="truncate font-['Playfair_Display'] text-3xl font-light tracking-tight">Curated pieces</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">{filteredProducts.length} items</span>
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="appearance-none border border-[#C9BEB4] bg-[#F9F7F6] px-3 py-2 pr-8 text-xs font-semibold uppercase tracking-[0.18em] outline-none">
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6F665F]" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse border border-[#C9BEB4] bg-[#F1ECE7]" />
                ))}
              </div>
            ) : (
              <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <motion.div key={product?.id ?? product?.slug ?? `${product?.name ?? 'product'}-${product?.price ?? 0}`} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!loading && filteredProducts.length === 0 ? (
              <div className="mt-8 border border-[#C9BEB4] bg-[#F1ECE7] p-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">No results</p>
                <p className="mt-2 font-['Playfair_Display'] text-2xl font-light tracking-tight">Refine your search or reset the filters.</p>
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

export default ShopPage;