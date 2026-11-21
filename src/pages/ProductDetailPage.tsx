import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { Product, ProductResponse } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailView } from "@/components/ProductDetailModal";
import { cn } from "@/lib/utils";

export function ProductDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Unable to load product.");
        const data = (await res.json()) as ProductResponse;
        if (!active) return;
        setProduct(data?.data ?? null);
      } catch (err) {
        if (!active) return;
        setProduct(null);
        setError(err instanceof Error ? err.message : "Unable to load product.");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) load();
    else {
      setLoading(false);
      setError("Product not found.");
    }

    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadRelated = async () => {
      try {
        const res = await fetch("/api/products", { signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { data?: Product[] };
        if (!active) return;
        const items = (data?.data ?? []).filter((item) => item?.id !== product?.id);
        setRelated(items.slice(0, 4));
      } catch {
        if (active) setRelated([]);
      }
    };

    if (product?.id) loadRelated();
    return () => {
      active = false;
      controller.abort();
    };
  }, [product?.id]);

  const heroImage = useMemo(() => product?.images?.[0] ?? "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80", [product?.images]);
  const fallback = loading ? "Loading product..." : error || "Product not found.";

  if (loading) {
    return <div className="min-h-[60vh] bg-[#F5F1EC] px-4 py-16 text-[#211F1D]"><div className="mx-auto max-w-7xl text-sm uppercase tracking-[0.25em] text-[#6F685F]">Loading product</div></div>;
  }

  if (!product) {
    return <div className="min-h-[60vh] bg-[#F5F1EC] px-4 py-16"><div className="mx-auto max-w-7xl border border-[#CFC5B8] bg-[#FFFCF8] p-8 text-[#211F1D]"><p className="text-xs uppercase tracking-[0.25em] text-[#6F685F]">Product detail</p><h1 className="mt-3 font-['Bodoni_Moda'] text-4xl font-light tracking-tight">{fallback}</h1></div></div>;
  }

  return (
    <div className="bg-[#F5F1EC] text-[#211F1D]">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0">
            <div className="overflow-hidden border border-[#CFC5B8] bg-[#FFFCF8]">
              <img src={heroImage} alt={product?.name ?? "Product image"} crossOrigin="anonymous" className="h-[72vh] w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0">
            <ProductDetailView product={product} className="sticky top-4 border border-[#CFC5B8] bg-[#FFFCF8] p-5" />
          </div>
        </div>

        <section className="mt-10 border-t border-[#CFC5B8] pt-8">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6F685F]">Recommended</p>
              <h2 className="mt-2 font-['Bodoni_Moda'] text-3xl font-light tracking-tight">Complete the look</h2>
            </div>
          </div>
          <div className={cn("mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4")}>
            {related.map((item) => (
              <ProductCard key={item?.id ?? item?.slug ?? crypto.randomUUID()} product={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetailPage;