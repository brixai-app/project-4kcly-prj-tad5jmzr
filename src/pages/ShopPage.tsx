import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Filter, Search, Sliders, X } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import type { FilterState, Product, ProductsResponse } from "@/types";

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get("q") ?? "",
    category: searchParams.get("category") ?? "all",
    minPrice: Number(searchParams.get("minPrice") ?? 0),
    maxPrice: Number(searchParams.get("maxPrice") ?? 999999),
    sortBy: (searchParams.get("sortBy") as FilterState["sortBy"]) ?? "featured",
    sizes: [],
    colors: [],
  });

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/products", { signal: controller.signal });
        if (!res.ok) throw new Error("Unable to load catalog.");
        const raw = await res.json();
        const payload = (raw?.data ?? raw) as ProductsResponse["data"] | { products?: Product[] } | Product[] | string;
        const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
        const list = Array.isArray(parsed) ? parsed : Array.isArray((parsed as any)?.products) ? (parsed as any).products : Array.isArray((parsed as any)?.data) ? (parsed as any).data : [];
        setProducts(
          list.map((item: Product) => ({
            ...item,
            inStock: Boolean((item as any)?.inStock ?? Number((item as any)?.stock ?? 0) > 0),
            category: {
              ...(item?.category ?? { id: "all", name: "All", slug: "all" }),
              name: item?.category?.name ?? "All",
              slug: item?.category?.slug ?? "all",
            },
          }))
        );
      } catch (e) {
        if ((e as Error)?.name !== "AbortError") setError((e as Error)?.message ?? "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      const slug = (p?.category?.slug ?? "all").toLowerCase();
      const name = p?.category?.name ?? "All";
      if (!map.has(slug)) map.set(slug, name);
    });
    return [{ slug: "all", name: "All" }, ...Array.from(map.entries()).map(([slug, name]) => ({ slug, name }))];
  }, [products]);

  const sizes = useMemo(() => Array.from(new Set(products.flatMap((p) => p?.sizes ?? []))).filter(Boolean), [products]);
  const colors = useMemo(() => Array.from(new Set(products.flatMap((p) => p?.colors ?? []))).filter(Boolean), [products]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const list = products.filter((p) => {
      const categoryMatch = filters.category === "all" || (p?.category?.slug ?? "").toLowerCase() === filters.category.toLowerCase() || (p?.category?.name ?? "").toLowerCase() === filters.category.toLowerCase();
      const queryMatch = !q || [p?.name, p?.description, p?.category?.name].some((v) => (v ?? "").toLowerCase().includes(q));
      const priceMatch = (p?.price ?? 0) >= filters.minPrice && (p?.price ?? 0) <= filters.maxPrice;
      const sizeMatch = filters.sizes.length === 0 || filters.sizes.some((s) => (p?.sizes ?? []).includes(s));
      const colorMatch = filters.colors.length === 0 || filters.colors.some((c) => (p?.colors ?? []).includes(c));
      return categoryMatch && queryMatch && priceMatch && sizeMatch && colorMatch;
    });
    return list.sort((a, b) => {
      if (filters.sortBy === "price-asc") return (a?.price ?? 0) - (b?.price ?? 0);
      if (filters.sortBy === "price-desc") return (b?.price ?? 0) - (a?.price ?? 0);
      if (filters.sortBy === "newest") return Number(b?.featured ?? false) - Number(a?.featured ?? false);
      return Number(b?.featured ?? false) - Number(a?.featured ?? false);
    });
  }, [products, filters]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice < 999999) params.set("maxPrice", String(filters.maxPrice));
    if (filters.sortBy !== "featured") params.set("sortBy", filters.sortBy);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const toggleMulti = (key: "sizes" | "colors", value: string) =>
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));

  return (
    <main className="bg-[#F9F7F6] text-[#211E1D]">
      <section className="border-b border-[#CFC4BA] bg-[#EFE9E3]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#665F5B]">Catalog</p>
              <h1 className="mt-2 font-['Bodoni_Moda'] text-4xl font-light tracking-tight sm:text-5xl">NDDN Store</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="inline-flex items-center gap-2 border border-[#CFC4BA] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition hover:bg-white">
                Home <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="min-w-0 border border-[#CFC4BA] bg-white p-4 lg:sticky lg:top-24 lg:h-fit">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <h2 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.25em]">Filters</h2>
              </div>
              <button onClick={() => setFiltersOpen((v) => !v)} className="lg:hidden">
                {filtersOpen ? <X className="h-4 w-4" /> : <Sliders className="h-4 w-4" />}
              </button>
            </div>

            <AnimatePresence>
              {(filtersOpen || typeof window !== "undefined") && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-4 flex flex-col gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#665F5B]">Search</span>
                    <div className="flex items-center gap-2 border border-[#CFC4BA] bg-[#F9F7F6] px-3 py-2">
                      <Search className="h-4 w-4 shrink-0 text-[#665F5B]" />
                      <input value={filters.query} onChange={(e) => setFilters((p) => ({ ...p, query: e.target.value }))} placeholder="Search products" className="w-full bg-transparent text-sm outline-none placeholder:text-[#665F5B]" />
                    </div>
                  </label>

                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#665F5B]">Category</span>
                    <div className="flex flex-col gap-2.5">
                      {categories.map((c) => (
                        <button key={c.slug} onClick={() => setFilters((p) => ({ ...p, category: c.slug }))} className={cn("min-w-0 truncate border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] transition", filters.category === c.slug ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC4BA] bg-white text-[#211E1D] hover:bg-[#F9F7F6]")}>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#665F5B]">Sizes</span>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button key={size} onClick={() => toggleMulti("sizes", size)} className={cn("border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition", filters.sizes.includes(size) ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC4BA] bg-white")}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#665F5B]">Colors</span>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button key={color} onClick={() => toggleMulti("colors", color)} className={cn("border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition", filters.colors.includes(color) ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC4BA] bg-white")}>
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#665F5B]">Sort</span>
                    <select value={filters.sortBy} onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value as FilterState["sortBy"] }))} className="border border-[#CFC4BA] bg-white px-3 py-2 text-sm outline-none">
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-[#665F5B]">{loading ? "Loading collection..." : `${filtered.length} pieces`}</p>
              <button onClick={() => setFilters({ query: "", category: "all", minPrice: 0, maxPrice: 999999, sortBy: "featured", sizes: [], colors: [] })} className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8B0000]">
                Reset
              </button>
            </div>

            {error ? (
              <div className="border border-[#CFC4BA] bg-white p-6 text-sm text-[#665F5B]">{error}</div>
            ) : loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse border border-[#CFC4BA] bg-white" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-[#CFC4BA] bg-white p-8">
                <p className="text-lg font-medium">No pieces match your filters.</p>
                <p className="mt-2 text-sm text-[#665F5B]">Try a broader search or clear the current selection.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product?.id ?? product?.slug} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default ShopPage;