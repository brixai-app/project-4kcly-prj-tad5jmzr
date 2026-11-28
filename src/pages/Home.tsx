import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Sparkles, Star } from 'lucide-react';
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85",
    title: "Tailored light, sculpted in motion.",
    caption: "A quiet edit of modern occasionwear and elevated essentials.",
  },
  {
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85",
    title: "Evening silhouettes with a disciplined edge.",
    caption: "Sharp lines, warm stone tones, and deep-crimson accents.",
  },
  {
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    title: "The new season, rendered as an editorial study.",
    caption: "Verified photography, restrained composition, refined commerce.",
  },
];

const categories = [
  { name: "Outerwear", slug: "outerwear" },
  { name: "Dresses", slug: "dresses" },
  { name: "Tailoring", slug: "tailoring" },
  { name: "Accessories", slug: "accessories" },
];

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const json = (await res.json()) as { data?: Product[]; message?: string };
        if (!mounted) return;
        setProducts(Array.isArray(json?.data) ? json.data : []);
      } catch {
        if (!mounted) return;
        setProducts([]);
        toast.error("Unable to load featured collection.");
      }
    };
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const featured = useMemo(() => products.filter((product) => product?.featured).slice(0, 6), [products]);

  return (
    <main className="bg-[#F9F7F6] text-[#211E1D]">
      <section className="relative min-h-[92vh] overflow-hidden border-b border-[#CFC4BA]">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <motion.img
              key={slide.image}
              src={slide.image}
              alt={slide.title}
              crossOrigin="anonymous"
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: index === activeSlide ? 1 : 0, scale: index === activeSlide ? 1 : 1.04 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/55 via-[#0a0a0a]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/50 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-end px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="max-w-3xl text-white">
              <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                <Sparkles className="h-4 w-4" />
                NDDN Store
              </p>
              <h1 className="font-['Bodoni_Moda'] text-5xl font-light tracking-tight sm:text-6xl lg:text-7xl">
                {heroSlides[activeSlide]?.title ?? "Tailored light, sculpted in motion."}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/82 sm:text-base">
                {heroSlides[activeSlide]?.caption ?? "A quiet edit of modern occasionwear and elevated essentials."}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#680000]"
                >
                  Explore Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 border border-white/35 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-sm transition-colors hover:bg-white/18"
                >
                  Shop Latest Drop
                </Link>
              </div>
            </div>

            <div className="grid gap-3 self-end border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/15 pb-3 text-[11px] uppercase tracking-[0.3em] text-white/75">
                <span>Collection Index</span>
                <span>{String(activeSlide + 1).padStart(2, "0")}</span>
              </div>
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className="flex items-center justify-between gap-3 border border-white/10 px-3 py-3 text-left transition-colors hover:bg-white/10"
                >
                  <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.24em] text-white">
                    {slide.title}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/80" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#665F5B]">Featured edit</p>
            <h2 className="mt-2 font-['Bodoni_Moda'] text-3xl font-light tracking-tight sm:text-4xl">
              Selected pieces from the current collection
            </h2>
          </div>
          <Link to="/shop" className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#8B0000] sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product?.id ?? product?.slug ?? crypto.randomUUID()} product={product} />
          ))}
        </div>
      </section>

      <section className="border-y border-[#CFC4BA] bg-[#EFE9E3]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#665F5B]">Craft manifesto</p>
            <h2 className="mt-3 max-w-xl font-['Bodoni_Moda'] text-4xl font-light tracking-tight">
              Precision tailoring, tactile fabrics, and a measured sense of drama.
            </h2>
          </div>
          <div className="grid gap-4 text-sm leading-7 text-[#665F5B] sm:grid-cols-2">
            <p>
              Every piece is presented with editorial restraint, allowing silhouette, texture, and proportion to lead the experience.
            </p>
            <p>
              The store pairs luxury commerce with a calm interface: verified imagery, disciplined spacing, and a deep-crimson accent system.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/shop?category=${category.slug}`}
              className="inline-flex min-w-0 items-center gap-2 border border-[#CFC4BA] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#211E1D] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"
            >
              <span className="min-w-0 truncate">{category.name}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="border border-[#CFC4BA] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#665F5B]">Newsletter</p>
            <h2 className="mt-3 font-['Bodoni_Moda'] text-3xl font-light tracking-tight">Receive the next drop before it opens.</h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Email address"
                className="min-w-0 flex-1 border border-[#CFC4BA] bg-[#F9F7F6] px-4 py-3 text-sm outline-none placeholder:text-[#665F5B] focus:border-[#8B0000]"
              />
              <button
                type="button"
                onClick={() => toast.success("Subscription request saved.")}
                className="inline-flex items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#680000]"
              >
                Subscribe <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 border border-[#CFC4BA] bg-[#EFE9E3] p-6">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-[#8B0000]" />
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#665F5B]">Editorial commerce</p>
            </div>
            <p className="text-sm leading-7 text-[#665F5B]">
              Browse a luxury storefront shaped by measured motion, refined product presentation, and a seamless path from discovery to checkout.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#8B0000]">
              Enter the shop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;