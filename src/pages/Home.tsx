import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Sparkles, Truck } from 'lucide-react';
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import type { Product, ProductsResponse } from "@/types";
import { cn } from "@/lib/utils";

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/products", { credentials: "include" });
        if (!res.ok) throw new Error("Unable to load the collection.");
        const json = (await res.json()) as ProductsResponse;
        if (!active) return;
        setProducts(Array.isArray(json?.data) ? json.data : []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load the collection.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const featured = useMemo(() => products.filter((p) => p?.featured).slice(0, 8), [products]);
  const categories = useMemo(() => {
    const map = new Map<string, Product[]>();
    products.forEach((p) => {
      const key = p?.category ?? "Collection";
      map.set(key, [...(map.get(key) ?? []), p]);
    });
    return Array.from(map.entries()).slice(0, 3);
  }, [products]);

  const heroImage =
    products?.[0]?.images?.[0]?.url ??
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85";

  return (
    <main className="bg-[#F5F1EB] text-[#1C1C1C]">
      <section className="relative min-h-[92vh] overflow-hidden border-b border-[#CFC5B8]">
        <img
          src={heroImage}
          alt="NDDN Store editorial lookbook"
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/55 via-[#0a0a0a]/20 to-transparent" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-end px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-3xl border border-white/20 bg-[#FAF9F6]/92 p-6 backdrop-blur-sm sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8B0000]">Autumn / Winter 2026</p>
              <h1 className="mt-4 font-serif text-5xl font-light tracking-tight text-[#1C1C1C] sm:text-6xl lg:text-7xl">
                Tailored warmth, rendered in crimson restraint.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#68625C] sm:text-base">
                A luxury fashion storefront shaped by editorial rhythm, verified lookbook photography, and a quietly dramatic palette.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000]"
                >
                  Explore Collection <ArrowRight size={16} />
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 border border-[#1C1C1C] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#1C1C1C] transition-colors hover:bg-[#1C1C1C] hover:text-white"
                >
                  Shop Latest Drop
                </Link>
              </div>
            </motion.div>
            <div className="hidden justify-self-end lg:block">
              <div className="flex flex-col items-end gap-4 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.35em]">Season 01</div>
                <div className="h-24 w-px bg-white/60" />
                <div className="max-w-[10rem] text-right text-xs leading-6 text-white/85">
                  Scroll through the collection, then enter the atelier.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 border-b border-[#CFC5B8] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8B0000]">Featured Drop</p>
            <h2 className="mt-2 font-serif text-3xl font-light tracking-tight">Selected pieces from the live collection</h2>
          </div>
          <Link to="/shop" className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#1C1C1C] sm:inline-flex">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse border border-[#CFC5B8] bg-[#FAF9F6]" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 border border-[#CFC5B8] bg-[#FAF9F6] p-6 text-sm text-[#68625C]">{error}</div>
        ) : featured.length === 0 ? (
          <div className="mt-6 border border-[#CFC5B8] bg-[#FAF9F6] p-6 text-sm text-[#68625C]">No featured products are available right now.</div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, index) => (
              <motion.div
                key={product?.id ?? index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-[#CFC5B8] bg-[#FAF9F6]">
        <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-3">
          {categories.map(([category, items], index) => (
            <div key={category} className={cn("border-[#CFC5B8] p-6", index < 2 ? "border-b lg:border-b-0 lg:border-r" : "")}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="min-w-0 truncate font-serif text-2xl font-light">{category}</h3>
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#68625C]">{items.length} pieces</span>
              </div>
              <div className="mt-5 grid gap-3">
                {items.slice(0, 2).map((item) => (
                  <Link
                    key={item?.id}
                    to={`/product/${item?.slug ?? item?.id ?? ""}`}
                    className="group flex items-center gap-4 border border-[#CFC5B8] bg-white p-3 transition-transform hover:-translate-y-0.5"
                  >
                    <img
                      src={item?.images?.[0]?.url ?? heroImage}
                      alt={item?.images?.[0]?.alt ?? item?.name ?? "Product image"}
                      crossOrigin="anonymous"
                      className="h-20 w-16 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item?.name ?? "Untitled"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#68625C]">{item?.collection ?? "Collection"}</p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-[#8B0000] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-[#CFC5B8] bg-[#FAF9F6] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8B0000]">Craft Manifesto</p>
            <h2 className="mt-3 font-serif text-4xl font-light tracking-tight">Precision tailoring, tactile fabrics, and a disciplined silhouette.</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-[#68625C]">
              <p>Every edit is chosen for structure, movement, and the quiet confidence of a well-made garment.</p>
              <p>From outerwear to occasion dressing, the collection is arranged to feel cinematic without losing commercial clarity.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: "Editorial curation", text: "A refined assortment with a magazine-like cadence." },
              { icon: Leaf, title: "Considered materials", text: "Textures and finishes selected for depth and longevity." },
              { icon: Truck, title: "Seamless delivery", text: "Cart, checkout, and order flow designed for ease." },
            ].map((item) => (
              <div key={item.title} className="border border-[#CFC5B8] bg-white p-5">
                <item.icon size={18} className="text-[#8B0000]" />
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.22em]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#68625C]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#CFC5B8] bg-[#8B0000]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-white sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">Newsletter</p>
            <h2 className="mt-2 font-serif text-3xl font-light tracking-tight">Receive the next drop before it lands.</h2>
          </div>
          <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Email address"
              className="min-w-0 flex-1 border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/70 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 border border-white bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#8B0000] transition-colors hover:bg-transparent hover:text-white"
            >
              Subscribe <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Home;