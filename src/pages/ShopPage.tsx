import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, RefreshCw, Search, Sliders, X } from 'lucide-react';
import type { FilterState, Product, ProductsResponse } from "@/types";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";

type SortOption = FilterState["sortBy"];

const defaultFilters: FilterState = {
  query: "",
  categories: [],
  collections: [],
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  featuredOnly: false,
  sortBy: "featured",
};

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function normalizeText(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function toNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseProducts(payload: unknown): Product[] {
  const raw = Array.isArray(payload)
    ? payload
    : (payload as ProductsResponse | { data?: unknown } | null)?.data;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is Product => Boolean(item && typeof item === "object" && "id" in item && "slug" in item));
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category") ?? ""] : [],
  );
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    searchParams.get("collection") ? [searchParams.get("collection") ?? ""] : [],
  );
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) ?? "featured");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("stock") === "1");
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("featured") === "1");
  const [minPrice, setMinPrice] = useState<number | null>(searchParams.get("min") ? Number(searchParams.get("min")) : null);
  const [maxPrice, setMaxPrice] = useState<number | null>(searchParams.get("max") ? Number(searchParams.get("max")) : null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        if (!response.ok) throw new Error((data as { error?: string })?.error ?? "Unable to load products.");
        if (active) setProducts(parseProducts(data));
      } catch (err) {
        if (active) {
          setProducts([]);
          setError(err instanceof Error ? err.message : "Unable to load products.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (selectedCategories[0]) next.set("category", selectedCategories[0]);
    if (selectedCollections[0]) next.set("collection", selectedCollections[0]);
    if (sortBy !== "featured") next.set("sort", sortBy);
    if (inStockOnly) next.set("stock", "1");
    if (featuredOnly) next.set("featured", "1");
    if (minPrice != null) next.set("min", String(minPrice));
    if (maxPrice != null) next.set("max", String(maxPrice));
    setSearchParams(next, { replace: true });
  }, [query, selectedCategories, selectedCollections, sortBy, inStockOnly, featuredOnly, minPrice, maxPrice, setSearchParams]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => normalizeText(p.category)).filter(Boolean))).sort(),
    [products],
  );
  const collections = useMemo(
    () => Array.from(new Set(products.map((p) => normalizeText(p.collection)).filter(Boolean))).sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const q = normalizeText(query);
    const categorySet = new Set(selectedCategories.map(normalizeText));
    const collectionSet = new Set(selectedCollections.map(normalizeText));
    const items = products.filter((product) => {
      const name = normalizeText(product.name);
      const description = normalizeText(product.description);
      const category = normalizeText(product.category);
      const collection = normalizeText(product.collection);
      const matchesQuery = !q || [name, description, category, collection, ...(product.tags ?? [])].some((v) => normalizeText(v).includes(q));
      const matchesCategory = categorySet.size === 0 || categorySet.has(category);
      const matchesCollection = collectionSet.size === 0 || collectionSet.has(collection);
      const matchesStock = !inStockOnly || product.inStock !== false;
      const matchesFeatured = !featuredOnly || product.featured === true;
      const price = toNumber(product.price);
      const matchesMin = minPrice == null || price >= minPrice;
      const matchesMax = maxPrice == null || price <= maxPrice;
      return matchesQuery && matchesCategory && matchesCollection && matchesStock && matchesFeatured && matchesMin && matchesMax;
    });
    return items.sort((a, b) => {
      const ap = toNumber(a.price);
      const bp = toNumber(b.price);
      if (sortBy === "price-asc") return ap - bp;
      if (sortBy === "price-desc") return bp - ap;
      if (sortBy === "newest") return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
  }, [products, query, selectedCategories, selectedCollections, sortBy, inStockOnly, featuredOnly, minPrice, maxPrice]);

  const toggleValue = (value: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const normalized = normalizeText(value);
    setter((prev) => (prev.some((item) => normalizeText(item) === normalized) ? prev.filter((item) => normalizeText(item) !== normalized) : [...prev, value]));
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategories([]);
    setSelectedCollections([]);
    setSortBy("featured");
    setInStockOnly(false);
    setFeaturedOnly(false);
    setMinPrice(null);
    setMaxPrice(null);
  };

  return (
    <main className="bg-[#F5F1EC] text-[#211F1D]">
      <section className="border-b border-[#CFC5B8] bg-[#FFFCF8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6F685F]">Catalog</p>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <h1 className="font-['Bodoni_Moda'] text-4xl font-light tracking-tight sm:text-5xl">Shop the collection</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6F685F]">
                  Refined essentials and statement pieces, curated in an ivory editorial canvas.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#6F685F]">
                <Sliders className="h-4 w-4" />
                <span>{filteredProducts.length} pieces</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <label className="flex min-w-0 items-center gap-3 border border-[#CFC5B8] bg-white px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-[#6F685F]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, collections, categories"
                className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-[#6F685F]"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-[#CFC5B8] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 border border-[#CFC5B8] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-[#F5F1EC]"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
            <aside className="border border-[#CFC5B8] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.25em] text-[#6F685F]">Filters</h2>
                <Filter className="h-4 w-4 text-[#6F685F]" />
              </div>
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F685F]">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const active = selectedCategories.some((item) => normalizeText(item) === category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleValue(category, selectedCategories, setSelectedCategories)}
                          className={cn(
                            "min-w-0 border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] transition-colors",
                            active ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC5B8] bg-white text-[#211F1D] hover:bg-[#F5F1EC]",
                          )}
                        >
                          <span className="block truncate">{category}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F685F]">Collection</p>
                  <div className="flex flex-wrap gap-2">
                    {collections.map((collection) => {
                      const active = selectedCollections.some((item) => normalizeText(item) === collection);
                      return (
                        <button
                          key={collection}
                          type="button"
                          onClick={() => toggleValue(collection, selectedCollections, setSelectedCollections)}
                          className={cn(
                            "min-w-0 border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] transition-colors",
                            active ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC5B8] bg-white text-[#211F1D] hover:bg-[#F5F1EC]",
                          )}
                        >
                          <span className="block truncate">{collection}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F685F]">Price</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      value={minPrice ?? ""}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Min"
                      className="min-w-0 border border-[#CFC5B8] bg-white px-3 py-2 text-sm outline-none placeholder:text-[#6F685F]"
                    />
                    <input
                      type="number"
                      min="0"
                      value={maxPrice ?? ""}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Max"
                      className="min-w-0 border border-[#CFC5B8] bg-white px-3 py-2 text-sm outline-none placeholder:text-[#6F685F]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F685F]">Refinements</p>
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                    <span>In stock only</span>
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
                    <span>Featured only</span>
                  </label>
                </div>
              </div>
            </aside>

            <section className="min-w-0">
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse border border-[#CFC5B8] bg-white">
                      <div className="aspect-[3/4] bg-[#F5F1EC]" />
                      <div className="space-y-3 p-4">
                        <div className="h-3 w-1/2 bg-[#F5F1EC]" />
                        <div className="h-4 w-3/4 bg-[#F5F1EC]" />
                        <div className="h-3 w-1/3 bg-[#F5F1EC]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="border border-[#CFC5B8] bg-white p-6">
                  <div className="flex items-start gap-3">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-[#8B0000]" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Unable to load catalog</p>
                      <p className="mt-1 text-sm text-[#6F685F]">{error}</p>
                    </div>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="border border-[#CFC5B8] bg-white p-10 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6F685F]">No results</p>
                  <p className="mt-2 text-sm text-[#6F685F]">Adjust your filters or clear the current selection.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#650000]"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} className="h-full" />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ShopPage;