import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles, Truck, Shield, Leaf } from 'lucide-react';
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85",
    title: "Tailored Silence",
    caption: "A study in ivory light, sharp lines, and deep-crimson restraint.",
  },
  {
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85",
    title: "Modern Atelier",
    caption: "Editorial silhouettes framed by tactile neutrals and precise tailoring.",
  },
  {
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85",
    title: "After Hours",
    caption: "A nocturne of texture, movement, and elevated essentials.",
  },
];

const categories = ["Outerwear", "Knitwear", "Tailoring", "Accessories", "Footwear", "Essentials"];

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const json = (await response.json()) as { data?: Product[] };
        if (mounted) setProducts(Array.isArray(json?.data) ? json.data : []);
      } catch {
        if (mounted) setProducts([]);
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
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  const featuredProducts = useMemo(
    () => products.filter((product) => product?.featured ?? false).slice(0, 4),
    [products]
  );

  const spotlightProducts = useMemo(() => products.slice(0, 6), [products]);

  return (
    <main className="bg-[#F5F1EC] text-[#211F1D]">
      <section className="relative min-h-[100svh] overflow-hidden border-b border-[#CFC5B8]">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={heroSlides[activeSlide]?.image}
              src={heroSlides[activeSlide]?.image ?? heroSlides[0].image}
              alt={heroSlides[activeSlide]?.title ?? "Editorial lookbook"}
              crossOrigin="anonymous"
              className="h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/55 via-[#0a0a0a]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/55 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-[12rem] border border-white/20 bg-[#FFFCF8]/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80">NDDN Store</p>
            </div>
            <div className="hidden flex-col items-end gap-2 text-right text-white/80 md:flex">
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">Lookbook 01</span>
              <span className="text-sm">Verified editorial photography</span>
            </div>
          </div>

          <div className="grid flex-1 items-end gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-3xl pb-8">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.45em] text-white/75">
                New season / curated release
              </p>
              <h1 className="max-w-2xl font-['Bodoni_Moda'] text-5xl font-light leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-7xl">
                {heroSlides[activeSlide]?.title ?? "Tailored Silence"}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                {heroSlides[activeSlide]?.caption ??
                  "A study in ivory light, sharp lines, and deep-crimson restraint."}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-white transition-colors hover:bg-[#650000]"
                >
                  Explore Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#featured"
                  className="inline-flex items-center gap-2 border border-white/30 bg-white/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  Featured Edit <ChevronDown className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="hidden justify-self-end lg:block">
              <div className="flex flex-col items-end gap-3 text-white/80">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={cn(
                      "flex items-center gap-3 text-right transition-opacity",
                      activeSlide === index ? "opacity-100" : "opacity-45 hover:opacity-75"
                    )}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">
                      0{index + 1}
                    </span>
                    <span className="h-px w-10 bg-white/50" />
                    <span className="max-w-[10rem] text-sm">{slide.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#CFC5B8] bg-[#FFFCF8]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="min-w-0 border border-[#CFC5B8] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#211F1D] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"
              >
                <span className="block truncate">{category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-[#6F685F]">Featured edit</p>
            <h2 className="mt-2 font-['Bodoni_Moda'] text-3xl font-light tracking-tight sm:text-4xl">
              Curated arrivals
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8B0000] md:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {(featuredProducts.length > 0 ? featuredProducts : spotlightProducts).map((product) => (
            <ProductCard key={product?.id ?? product?.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="border-y border-[#CFC5B8] bg-[#faf9f6]">
        <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-[#CFC5B8] p-6 lg:border-b-0 lg:border-r lg:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-[#6F685F]">Craft manifesto</p>
            <h3 className="mt-3 max-w-md font-['Bodoni_Moda'] text-3xl font-light leading-tight tracking-tight sm:text-4xl">
              Precision tailoring, tactile fabrics, and a disciplined palette.
            </h3>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#6F685F]">
              NDDN Store frames modern luxury through quiet structure: ivory surfaces, charcoal depth, taupe warmth,
              and crimson accents that punctuate the collection with intent.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Sparkles, title: "Editorial", text: "Lookbook-led merchandising." },
                { icon: Shield, title: "Secure", text: "Protected checkout and sessions." },
                { icon: Truck, title: "Delivery", text: "Refined fulfillment experience." },
              ].map((item) => (
                <div key={item.title} className="border border-[#CFC5B8] bg-[#FFFCF8] p-4">
                  <item.icon className="h-5 w-5 text-[#8B0000]" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em]">{item.title}</p>
                  <p className="mt-2 text-sm text-[#6F685F]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            <div className="relative min-h-[22rem] border-b border-[#CFC5B8] sm:border-b-0 sm:border-r">
              <img
                src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
                alt="Fashion editorial detail"
                crossOrigin="anonymous"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative min-h-[22rem]">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury fashion portrait"
                crossOrigin="anonymous"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-[#6F685F]">Latest drop</p>
            <h2 className="mt-2 font-['Bodoni_Moda'] text-3xl font-light tracking-tight sm:text-4xl">
              Selected from the live catalog
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8B0000]"
          >
            Shop latest <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {spotlightProducts.map((product) => (
            <ProductCard key={product?.id ?? product?.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t border-[#CFC5B8] bg-[#8B0000] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-white/75">Newsletter</p>
            <h2 className="mt-3 font-['Bodoni_Moda'] text-3xl font-light tracking-tight sm:text-4xl">
              Receive the next release before it lands.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">
              Early access to new arrivals, editorial stories, and private offers from the NDDN Store atelier.
            </p>
          </div>
          <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Email address"
              className="min-w-0 flex-1 border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 border border-white bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8B0000] transition-colors hover:bg-white/90"
            >
              Subscribe <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Home;