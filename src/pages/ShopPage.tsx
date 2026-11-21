import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import { ChevronDown, Filter, Search, Sliders, X } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { cn } from '@/lib/utils';

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/products');
        const json = await res.json().catch(() => null);
        const payload = json?.data ?? json;
        const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
        if (active) setProducts(list.filter((item): item is Product => !!item?.id));
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
    const values = products.map((p) => (p?.category ?? '').trim()).filter(Boolean);
    return ['All', ...Array.from(new Set(values))].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const name = product?.name ?? '';
      const desc = product?.description ?? '';
      const cat = product?.category ?? '';
      const matchesQuery = !q || [name, desc, cat, product?.collection ?? ''].join(' ').toLowerCase().includes(q);
      const matchesCategory = category === 'All' || cat.toLowerCase() === category.toLowerCase();
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  const FilterPanel = ({ compact = false }: { compact?: boolean }) => (
    <div className={cn('flex flex-col gap-2.5', compact ? 'w-full' : 'sticky top-24')}>
      <div className="flex items-center justify-between gap-3 border-b border-[#C9BDB2] pb-3">
        <div className="min-w-0">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6E655F]">Filters</p>
          <h2 className="min-w-0 truncate font-serif text-xl text-[#2B2B2B]">Shop the edit</h2>
        </div>
        {compact ? (
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center border border-[#C9BDB2] text-[#2B2B2B]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <label className="flex items-center gap-2 border border-[#C9BDB2] bg-white px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-[#6E655F]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
          className="min-w-0 w-full bg-transparent font-sans text-sm text-[#2B2B2B] outline-none placeholder:text-[#6E655F]"
        />
      </label>

      <div className="flex flex-col gap-2.5">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={cn(
              'flex min-w-0 items-center justify-between gap-3 border px-3 py-2 text-left transition-colors',
              category === item ? 'border-[#B11226] bg-[#B11226] text-white' : 'border-[#C9BDB2] bg-white text-[#2B2B2B]'
            )}
          >
            <span className="min-w-0 truncate font-sans text-xs font-semibold uppercase tracking-[0.22em]">{item}</span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <main className="bg-[#F9F7F6] text-[#2B2B2B]">
      <section className="border-b border-[#C9BDB2]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[280px_minmax(0,1fr)] md:px-6 lg:px-8">
          <aside className="hidden md:block">
            <FilterPanel />
          </aside>

          <div className="min-w-0">
            <div className="flex items-end justify-between gap-4 border-b border-[#C9BDB2] pb-4">
              <div className="min-w-0">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6E655F]">Collection index</p>
                <h1 className="min-w-0 truncate font-serif text-4xl font-light tracking-tight md:text-5xl">NDDN Store</h1>
              </div>
              <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 border border-[#C9BDB2] bg-white px-3 py-2 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#2B2B2B] md:hidden"
                  >
                    <Sliders className="h-4 w-4" />
                    Filters
                  </button>
                </DialogTrigger>
                <DialogContent className="fixed inset-0 z-50 bg-[#F9F7F6]/95 p-4 outline-none">
                  <div className="mx-auto mt-16 w-full max-w-md border border-[#C9BDB2] bg-[#F9F7F6] p-4 shadow-lg">
                    <FilterPanel compact />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="font-sans text-xs uppercase tracking-[0.22em] text-[#6E655F]">
                {loading ? 'Loading live catalog…' : `${filtered.length} pieces`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory('All');
                }}
                className="inline-flex items-center gap-2 border border-[#C9BDB2] px-3 py-2 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#2B2B2B]"
              >
                <X className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product?.id ?? product?.slug ?? crypto.randomUUID()} product={product} />
          ))}
        </div>
        {!loading && filtered.length === 0 ? (
          <div className="border border-[#C9BDB2] bg-white p-8 text-center">
            <p className="font-serif text-2xl text-[#2B2B2B]">No pieces match your selection.</p>
            <p className="mt-2 font-sans text-sm text-[#6E655F]">Try a broader search or clear the category filter.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default ShopPage;