import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Filter, Search, Sliders, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [size, setSize] = useState('all');
  const [color, setColor] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
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

  const categories = useMemo(() => ['all', ...new Set(products.map((p) => (p.category ?? '').trim()).filter(Boolean))], [products]);
  const sizes = useMemo(() => ['all', ...new Set(products.flatMap((p) => p.sizes ?? []).filter(Boolean))], [products]);
  const colors = useMemo(() => ['all', ...new Set(products.map((p) => (p.color ?? '').trim()).filter(Boolean))], [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesQuery =
        !q ||
        [p.name, p.description, p.category, p.collection, p.material, p.color].some((v) => (v ?? '').toLowerCase().includes(q));
      const matchesCategory = category === 'all' || (p.category ?? '').toLowerCase() === category.toLowerCase();
      const matchesSize = size === 'all' || (p.sizes ?? []).some((s) => s.toLowerCase() === size.toLowerCase());
      const matchesColor = color === 'all' || (p.color ?? '').toLowerCase() === color.toLowerCase();
      return matchesQuery && matchesCategory && matchesSize && matchesColor;
    });
    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price-desc') return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === 'newest') return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      return Number(b.featured ?? false) - Number(a.featured ?? false) || new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
  }, [products, query, category, size, color, sortBy]);

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setSize('all');
    setColor('all');
    setSortBy('featured');
  };

  return (
    <main className="bg-[#F9F7F6] text-[#2E2E2E]">
      <section className="border-b border-[#C9BDB2] bg-[#EEE8E2]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6E655E]">Catalog</p>
              <h1 className="mt-3 font-['Playfair_Display'] text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl">
                Shop the NDDN edit
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6E655E] sm:text-base">
                A live collection of refined silhouettes, tactile tailoring, and seasonal statements curated for a fine-paper canvas.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#6E655E]">
              <span>{filtered.length} results</span>
              <span className="h-1 w-1 rounded-full bg-[#8B0000]" />
              <span>{loading ? 'Updating' : 'Live inventory'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="min-w-0 border border-[#C9BDB2] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Filter className="h-4 w-4 shrink-0" />
                <h2 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.25em]">Filters</h2>
              </div>
              <button onClick={clearFilters} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B0000]">
                Reset
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6E655E]">Search</label>
              <div className="flex items-center gap-2 border border-[#C9BDB2] bg-[#F9F7F6] px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-[#6E655E]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#6E655E]"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6E655E]">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={cn(
                      'min-w-0 border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] transition',
                      category === item ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BDB2] bg-white text-[#2E2E2E]'
                    )}
                  >
                    <span className="block max-w-full truncate">{item === 'all' ? 'All' : item}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6E655E]">Size</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((item) => (
                  <button
                    key={item}
                    onClick={() => setSize(item)}
                    className={cn(
                      'border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition',
                      size === item ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BDB2] bg-white text-[#2E2E2E]'
                    )}
                  >
                    {item === 'all' ? 'All' : item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6E655E]">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((item) => (
                  <button
                    key={item}
                    onClick={() => setColor(item)}
                    className={cn(
                      'border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition',
                      color === item ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BDB2] bg-white text-[#2E2E2E]'
                    )}
                  >
                    {item === 'all' ? 'All' : item}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 border-b border-[#C9BDB2] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#6E655E]">{filtered.length} pieces curated for your current selection</p>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="inline-flex items-center gap-2 border border-[#C9BDB2] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                    Sort
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="z-50 min-w-44 border border-[#C9BDB2] bg-white p-1 shadow-lg">
                    {[
                      ['featured', 'Featured'],
                      ['newest', 'Newest'],
                      ['price-asc', 'Price: Low to High'],
                      ['price-desc', 'Price: High to Low'],
                      ['rating', 'Top Rated'],
                    ].map(([value, label]) => (
                      <DropdownMenu.Item
                        key={value}
                        onSelect={() => setSortBy(value as typeof sortBy)}
                        className={cn(
                          'cursor-pointer px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] outline-none hover:bg-[#EEE8E2]',
                          sortBy === value && 'bg-[#EEE8E2]'
                        )}
                      >
                        {label}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            {filtered.length === 0 ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center border border-dashed border-[#C9BDB2] bg-white px-6 py-16 text-center">
                <X className="h-8 w-8 text-[#8B0000]" />
                <h3 className="mt-4 font-['Playfair_Display'] text-2xl font-light">No pieces match your edit</h3>
                <p className="mt-2 max-w-md text-sm leading-7 text-[#6E655E]">Try a broader search or clear the filters to reveal the full collection.</p>
                <button onClick={clearFilters} className="mt-6 border border-[#8B0000] bg-[#8B0000] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  Clear filters
                </button>
              </div>
            ) : (
              <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <motion.div key={product.id} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default ShopPage;