import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Filter, Search, Sliders } from 'lucide-react';
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/products");
        const json = await res.json().catch(() => ({}));
        const raw = Array.isArray(json?.data) ? json.data : Array.isArray(json?.products) ? json.products : Array.isArray(json?.items) ? json.items : [];
        if (alive) setProducts(raw.filter(Boolean));
      } catch {
        if (alive) setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => (p?.category ?? "Uncategorized").trim()).filter(Boolean)))], [products]);
  const sizes = useMemo(() => ["All", ...Array.from(new Set(products.flatMap((p) => p?.sizes ?? []).filter(Boolean)))], [products]);
  const colors = useMemo(() => ["All", ...Array.from(new Set(products.flatMap((p) => p?.colors ?? []).filter(Boolean)))], [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      const name = (p?.name ?? "").toLowerCase();
      const desc = (p?.description ?? "").toLowerCase();
      const cat = (p?.category ?? "").toLowerCase();
      const col = (p?.collection ?? "").toLowerCase();
      const matchesQuery = !q || [name, desc, cat, col].some((v) => v.includes(q));
      const matchesCategory = category === "All" || cat === category.toLowerCase();
      const matchesSize = size === "All" || (p?.sizes ?? []).some((s) => s?.toLowerCase() === size.toLowerCase());
      const matchesColor = color === "All" || (p?.colors ?? []).some((c) => c?.toLowerCase() === color.toLowerCase());
      return matchesQuery && matchesCategory && matchesSize && matchesColor;
    });
    return list.sort((a, b) => {
      if (sort === "price-asc") return (a?.price ?? 0) - (b?.price ?? 0);
      if (sort === "price-desc") return (b?.price ?? 0) - (a?.price ?? 0);
      if (sort === "newest") return new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime();
      return Number(b?.featured ?? false) - Number(a?.featured ?? false) || (b?.rating ?? 0) - (a?.rating ?? 0);
    });
  }, [products, query, category, size, color, sort]);

  return (
    <main className="bg-[#F5F1EB] text-[#1C1C1C]">
      <section className="border-b border-[#CFC5B8] bg-[#FAF9F6]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8B0000]">Shop</p>
            <h1 className="mt-3 font-['Playfair_Display'] text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl">
              Curated pieces, live from the atelier.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#68625C] sm:text-base">
              Explore the full collection with refined filters, editorial pacing, and verified product imagery.
            </p>
          </div>
          <div className="flex items-end justify-between gap-4 border border-[#CFC5B8] bg-white p-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#68625C]">Collection index</p>
              <p className="mt-2 text-sm text-[#1C1C1C]">{filtered.length} pieces</p>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#8B0000]">
              View lookbook <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[280px_minmax(0,1fr)] md:px-6 lg:px-8">
        <aside className="min-w-0 border border-[#CFC5B8] bg-[#FAF9F6] p-4">
          <div className="flex items-center gap-2 border-b border-[#CFC5B8] pb-3">
            <Filter className="h-4 w-4 text-[#8B0000]" />
            <h2 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.35em] text-[#1C1C1C]">Filters</h2>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#68625C]">Search</span>
              <div className="flex items-center gap-2 border border-[#CFC5B8] bg-white px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-[#68625C]" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none placeholder:text-[#68625C]" />
              </div>
            </label>
            <FilterGroup label="Category" options={categories} value={category} onChange={setCategory} />
            <FilterGroup label="Size" options={sizes} value={size} onChange={setSize} />
            <FilterGroup label="Color" options={colors} value={color} onChange={setColor} />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#68625C]">Sort</span>
              <div className="flex items-center gap-2 border border-[#CFC5B8] bg-white px-3 py-2">
                <Sliders className="h-4 w-4 shrink-0 text-[#68625C]" />
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-transparent text-sm outline-none">
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </label>
          </div>
        </aside>

        <section className="min-w-0">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse border border-[#CFC5B8] bg-[#FAF9F6]" />
              ))}
            </div>
          ) : filtered.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product, index) => (
                <div key={product?.id ?? product?.slug ?? `${product?.name ?? "product"}-${index}`} className={cn(index % 3 === 0 ? "xl:translate-y-0" : index % 3 === 1 ? "xl:translate-y-8" : "xl:translate-y-16")}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-[#CFC5B8] bg-[#FAF9F6] p-10 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-[#68625C]">No results found</p>
              <p className="mt-3 text-sm text-[#68625C]">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function FilterGroup({
  label = "",
  options = [],
  value = "All",
  onChange = () => {},
}: {
  label?: string;
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#68625C]">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "min-w-0 border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.25em] transition-colors",
                active ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC5B8] bg-white text-[#1C1C1C] hover:border-[#8B0000] hover:text-[#8B0000]"
              )}
            >
              <span className="block truncate">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ShopPage;