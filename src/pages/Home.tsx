import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/types';
import { HeroBanner, MasonryLookbook, ManifestoSection, NewsletterPanel } from '@/components/StorefrontSections';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/products');
        const json = (await res.json().catch(() => ({}))) as { data?: Product[] };
        if (active) setProducts(Array.isArray(json?.data) ? json.data : []);
      } catch {
        if (active) setProducts([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const featured = useMemo(() => products.filter((product) => product?.featured ?? false), [products]);
  const curated = useMemo(() => {
    const source = featured.length > 0 ? featured : products;
    return source.slice(0, 8);
  }, [featured, products]);

  return (
    <main className="bg-[#F9F7F6] text-[#2E2E2E]">
      <HeroBanner />
      <section className="mx-auto w-full max-w-7xl px-4 pb-8 pt-2 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6F665F]">Curated edit</p>
            <h2 className="mt-3 font-['Playfair_Display'] text-3xl font-light tracking-tight sm:text-4xl">
              A measured selection of the season&apos;s most refined silhouettes.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#6F665F]">
            The collection unfolds through tactile tailoring, softened structure, and quiet contrast—pieces chosen for
            their line, movement, and enduring presence.
          </p>
        </div>
      </section>
      <MasonryLookbook products={curated} />
      <ManifestoSection />
      <NewsletterPanel />
    </main>
  );
}

export default Home;