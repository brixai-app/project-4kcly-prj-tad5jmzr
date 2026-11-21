import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter, Search, Sliders, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import type { FilterState, Product, ProductsResponse } from '@/types';

export function CatalogWorkspace({ className = '' }: { className?: string } = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    categories: [],
    collections: [],
    priceMin: undefined,
    priceMax: undefined,
    inStockOnly: false,
    featuredOnly: false,
    sortBy: 'featured',
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/products', { credentials: 'include' });
        const json = (await res.json().catch(() => null)) as ProductsResponse | null;
        const data = Array.isArray(json?.data) ? json?.data : [];
        if (!res.ok || json?.success === false) throw new Error(json?.message ?? 'Unable to load products.');
        if (active) setProducts(data);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load products.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => (p.category ?? '').trim()).filter(Boolean))).sort(), [products]);
  const collections = useMemo(() => Array.from(new Set(products.map((p) => (p.collection ?? '').trim()).filter(Boolean))).sort(), [products]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const list = products.filter((p) => {
      const category = (p.category ?? '').toLowerCase();
      const collection = (p.collection ?? '').toLowerCase();
      const matchesQuery = !q || [p.name, p.description, p.category, p.collection, ...(p.tags ?? [])].join(' ').toLowerCase().includes(q);
      const matchesCategory = filters.categories.length === 0 || filters.categories.some((c) => c.toLowerCase() === category);
      const matchesCollection = filters.collections.length === 0 || filters.collections.some((c) => c.toLowerCase() === collection);
      const matchesMin = filters.priceMin == null || p.price >= filters.priceMin;
      const matchesMax = filters.priceMax == null || p.price <= filters.priceMax;
      const matchesStock = !filters.inStockOnly || (p.stock ?? 0) > 0;
      const matchesFeatured = !filters.featuredOnly || !!p.featured;
      return matchesQuery && matchesCategory && matchesCollection && matchesMin && matchesMax && matchesStock && matchesFeatured;
    });
    const sorted = [...list].sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      if (filters.sortBy === 'newest') return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      return Number(!!b.featured) - Number(!!a.featured) || new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
    return sorted;
  }, [filters, products]);

  useEffect(() => setVisibleCount(8), [filters]);

  const toggle = (key: 'categories' | 'collections', value: string) =>
    setFilters((prev) => {
      const current = prev[key];
      const exists = current.some((item) => item.toLowerCase() === value.toLowerCase());
      return { ...prev, [key]: exists ? current.filter((item) => item.toLowerCase() !== value.toLowerCase()) : [...current, value] };
    });

  const FilterPanel = ({ compact = false }: { compact?: boolean }) => (
    <div className={cn('flex flex-col gap-4 min-w-0', compact && 'pb-2')}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#71695F]">Refine</p>
          <h2 className="truncate font-serif text-lg text-[#2E2B28]">Editorial filters</h2>
        </div>
        {compact ? null : <Sliders className="h-4 w-4 text-[#71695F]" />}
      </div>
      <label className="flex items-center gap-2 rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-[#71695F]" />
        <input value={filters.query} onChange={(e) => setFilters((p) => ({ ...p, query: e.target.value }))} placeholder="Search products" className="w-full bg-transparent text-sm text-[#2E2B28] outline-none placeholder:text-[#71695F]" />
      </label>
      <div className="flex flex-col gap-2.5">
        <button type="button" onClick={() => setFilters((p) => ({ ...p, featuredOnly: !p.featuredOnly }))} className={cn('w-full rounded-sm border px-3 py-2 text-left text-xs uppercase tracking-widest transition', filters.featuredOnly ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BFB1] bg-[#FFFCF7] text-[#2E2B28]')}>Featured only</button>
        <button type="button" onClick={() => setFilters((p) => ({ ...p, inStockOnly: !p.inStockOnly }))} className={cn('w-full rounded-sm border px-3 py-2 text-left text-xs uppercase tracking-widest transition', filters.inStockOnly ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BFB1] bg-[#FFFCF7] text-[#2E2B28]')}>In stock only</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" min="0" value={filters.priceMin ?? ''} onChange={(e) => setFilters((p) => ({ ...p, priceMin: e.target.value === '' ? undefined : Number(e.target.value) }))} placeholder="Min" className="min-w-0 rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] px-3 py-2 text-sm outline-none placeholder:text-[#71695F]" />
        <input type="number" min="0" value={filters.priceMax ?? ''} onChange={(e) => setFilters((p) => ({ ...p, priceMax: e.target.value === '' ? undefined : Number(e.target.value) }))} placeholder="Max" className="min-w-0 rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] px-3 py-2 text-sm outline-none placeholder:text-[#71695F]" />
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2"><span className="min-w-0 truncate text-xs uppercase tracking-widest text-[#71695F]">Categories</span></div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => <button key={c} type="button" onClick={() => toggle('categories', c)} className={cn('min-w-0 max-w-full truncate rounded-sm border px-3 py-1.5 text-xs uppercase tracking-widest', filters.categories.some((x) => x.toLowerCase() === c.toLowerCase()) ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BFB1] bg-[#FFFCF7] text-[#2E2B28]')}>{c}</button>)}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <span className="min-w-0 truncate text-xs uppercase tracking-widest text-[#71695F]">Collections</span>
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => <button key={c} type="button" onClick={() => toggle('collections', c)} className={cn('min-w-0 max-w-full truncate rounded-sm border px-3 py-1.5 text-xs uppercase tracking-widest', filters.collections.some((x) => x.toLowerCase() === c.toLowerCase()) ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BFB1] bg-[#FFFCF7] text-[#2E2B28]')}>{c}</button>)}
        </div>
      </div>
      <select value={filters.sortBy} onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value as FilterState['sortBy'] }))} className="rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] px-3 py-2 text-sm text-[#2E2B28] outline-none">
        <option value="featured">Featured</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="rating">Rating</option>
      </select>
    </div>
  );

  return (
    <section className={cn('bg-[#F5F1EB] px-4 py-8 text-[#2E2B28] md:px-6 lg:px-8', className)}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#71695F]">Catalog</p>
            <h1 className="truncate font-serif text-3xl text-[#2E2B28]">Asymmetric product field</h1>
          </div>
          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild><button type="button" className="inline-flex items-center gap-2 rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] px-3 py-2 text-xs uppercase tracking-widest md:hidden"><Filter className="h-4 w-4" />Filters</button></Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/35" />
              <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-sm overflow-y-auto border-r border-[#C9BFB1] bg-[#F5F1EB] p-4 outline-none">
                <div className="mb-4 flex items-center justify-between"><Dialog.Title className="font-serif text-xl">Filters</Dialog.Title><Dialog.Close asChild><button className="rounded-sm border border-[#C9BFB1] p-2"><X className="h-4 w-4" /></button></Dialog.Close></div>
                <FilterPanel compact />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
        <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden min-w-0 md:block"><div className="sticky top-24 rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] p-4"><FilterPanel /></div></aside>
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#C9BFB1] pb-3">
              <p className="text-xs uppercase tracking-widest text-[#71695F]">{filtered.length} pieces</p>
              <button type="button" onClick={() => setVisibleCount((v) => v + 8)} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B0000]"><ChevronDown className="h-4 w-4" />Reveal more</button>
            </div>
            {loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><div className="h-80 animate-pulse rounded-sm border border-[#C9BFB1] bg-[#FFFCF7]" /><div className="h-96 animate-pulse rounded-sm border border-[#C9BFB1] bg-[#FFFCF7]" /><div className="h-72 animate-pulse rounded-sm border border-[#C9BFB1] bg-[#FFFCF7]" /></div> : error ? <div className="rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] p-6 text-sm text-[#71695F]">{error}</div> : <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.slice(0, visibleCount).map((product, index) => <motion.div key={product.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24) }} className={cn(index % 5 === 0 ? 'sm:col-span-2 xl:col-span-2' : 'sm:col-span-1')}><ProductCard product={product} /></motion.div>)}</motion.div>}
            <AnimatePresence>{!loading && !error && filtered.length === 0 ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] p-6 text-sm text-[#71695F]">No pieces match your current filters.</motion.div> : null}</AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CatalogWorkspace;