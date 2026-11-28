import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Circle as ChevronLeft, ChevronRight, Heart, ShoppingCart, Star, Minus, Plus } from 'lucide-react';
import { toast } from "sonner";
import type { Product, Review } from "@/types";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

export function ProductDetailPage() {
  const { id = "" } = useParams();
  const { addItem } = useCart?.() ?? {};
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
          fetch(`/api/products/${encodeURIComponent(id)}`),
          fetch(`/api/products/${encodeURIComponent(id)}/reviews`),
        ]);
        const productJson = await productRes.json().catch(() => ({}));
        const reviewsJson = await reviewsRes.json().catch(() => ({}));
        if (!alive) return;
        setProduct(productJson?.data ?? null);
        setReviews(Array.isArray(reviewsJson?.data) ? reviewsJson.data : []);
      } catch {
        if (alive) {
          setProduct(null);
          setReviews([]);
          toast.error("Unable to load product details.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    setActiveImage(0);
    setSize("");
    setColor("");
    setQty(1);
  }, [product?.id]);

  const images = useMemo(() => product?.images?.length ? product.images : [], [product?.images]);
  const currency = product?.currency ?? "INR";
  const priceLabel = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(product?.price ?? 0), [currency, product?.price]);
  const compareLabel = useMemo(() => product?.compareAtPrice ? new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(product.compareAtPrice) : "", [currency, product?.compareAtPrice]);

  const handleAdd = () => {
    if (!product) return;
    if (!product.inStock) {
      toast.error("This piece is currently out of stock.");
      return;
    }
    addItem?.({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      size: size || undefined,
      color: color || undefined,
      image: images?.[activeImage]?.url ?? product.images?.[0]?.url,
      product,
      id: crypto.randomUUID(),
    });
    toast.success("Added to cart.");
  };

  const currentImage = images?.[activeImage] ?? images?.[0];

  return (
    <div className="bg-[#F5F1EB] text-[#1C1C1C]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#68625C] transition hover:text-[#8B0000]">
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="min-w-0">
            <div className="overflow-hidden border border-[#CFC5B8] bg-[#FAF9F6]">
              <div className="relative aspect-[4/5] w-full">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#68625C]">Loading lookbook...</div>
                ) : (
                  <>
                    <motion.img
                      key={currentImage?.url ?? product?.id ?? "placeholder"}
                      src={currentImage?.url ?? "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85"}
                      alt={currentImage?.alt ?? product?.name ?? "Product image"}
                      crossOrigin="anonymous"
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.45 }}
                      className="h-full w-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 border border-[#CFC5B8] bg-[#FAF9F6]/90 p-2 text-[#1C1C1C] transition hover:bg-white">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => setActiveImage((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 border border-[#CFC5B8] bg-[#FAF9F6]/90 p-2 text-[#1C1C1C] transition hover:bg-white">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, index) => (
                  <button key={`${img.url}-${index}`} onClick={() => setActiveImage(index)} className={cn("h-20 w-16 shrink-0 overflow-hidden border transition", activeImage === index ? "border-[#8B0000]" : "border-[#CFC5B8]")}>
                    <img src={img.url} alt={img.alt ?? `${product?.name ?? "Product"} thumbnail ${index + 1}`} crossOrigin="anonymous" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0 border-t border-[#CFC5B8] pt-6 lg:border-t-0 lg:pt-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8B0000]">{product?.collection ?? product?.category ?? "Collection"}</p>
                <h1 className="mt-2 font-['Playfair_Display'] text-4xl font-light tracking-tight text-[#1C1C1C] sm:text-5xl">{product?.name ?? "Loading..."}</h1>
              </div>
              <button className="border border-[#CFC5B8] p-2 text-[#1C1C1C] transition hover:border-[#8B0000] hover:text-[#8B0000]">
                <Heart className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-2xl font-semibold text-[#1C1C1C]">{priceLabel}</span>
              {product?.compareAtPrice ? <span className="text-sm text-[#68625C] line-through">{compareLabel}</span> : null}
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-[#68625C]">
              <Star className="h-4 w-4 fill-current text-[#8B0000]" />
              <span>{(product?.rating ?? 0).toFixed(1)}</span>
              <span>•</span>
              <span>{product?.reviewCount ?? reviews.length} reviews</span>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#68625C]">{product?.description ?? "A refined wardrobe essential with tailored structure, tactile finish, and a quietly dramatic silhouette."}</p>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#68625C]">Size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(product?.sizes ?? ["XS", "S", "M", "L", "XL"]).map((s) => (
                    <button key={s} onClick={() => setSize(s)} className={cn("min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition", size === s ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC5B8] bg-[#FAF9F6] text-[#1C1C1C] hover:border-[#8B0000]")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#68625C]">Color</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(product?.colors ?? ["Ivory", "Charcoal", "Crimson"]).map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={cn("min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition", color === c ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC5B8] bg-[#FAF9F6] text-[#1C1C1C] hover:border-[#8B0000]")}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#68625C]">Qty</p>
                <div className="flex items-center border border-[#CFC5B8]">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-[#1C1C1C] transition hover:bg-[#FAF9F6]"><Minus className="h-4 w-4" /></button>
                  <span className="min-w-10 px-3 py-2 text-center text-sm">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 text-[#1C1C1C] transition hover:bg-[#FAF9F6]"><Plus className="h-4 w-4" /></button>
                </div>
              </div>

              <button onClick={handleAdd} disabled={!product?.inStock} className="inline-flex w-full items-center justify-center gap-2 bg-[#8B0000] px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:bg-[#CFC5B8]">
                {product?.inStock ? <ShoppingCart className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {product?.inStock ? "Add to cart" : "Out of stock"}
              </button>

              <div className="border-t border-[#CFC5B8] pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#68625C]">Reviews</p>
                <div className="mt-4 space-y-4">
                  {reviews.length ? reviews.map((review) => (
                    <article key={review.id} className="border-b border-[#CFC5B8] pb-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-[#1C1C1C]">{review.userName}</h3>
                        <div className="flex items-center gap-1 text-[#8B0000]">
                          {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("h-3.5 w-3.5", i < review.rating ? "fill-current" : "opacity-25")} />)}
                        </div>
                      </div>
                      <p className="mt-2 text-sm font-medium text-[#1C1C1C]">{review.title ?? "Verified impression"}</p>
                      <p className="mt-1 text-sm leading-6 text-[#68625C]">{review.body}</p>
                    </article>
                  )) : <p className="text-sm text-[#68625C]">No reviews yet.</p>}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;