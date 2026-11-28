import React from 'react';
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Heart, Minus, Plus, Star, Truck } from 'lucide-react';
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import type { CreateReviewPayload, Product, Review } from "@/types";

export function ProductDetailPage() {
  const { id = "" } = useParams();
  const { addToCart } = useCart?.() ?? {};
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
          fetch(`/api/products/${encodeURIComponent(id)}`),
          fetch(`/api/reviews?productId=${encodeURIComponent(id)}`),
        ]);
        const productJson = await productRes.json();
        const reviewsJson = await reviewsRes.json();
        if (!alive) return;
        const nextProduct = productJson?.data ?? null;
        setProduct(nextProduct);
        setReviews(Array.isArray(reviewsJson?.data) ? reviewsJson.data : []);
        setActiveImage(nextProduct?.image ?? "");
        setSize(nextProduct?.sizes?.[0] ?? "");
        setColor(nextProduct?.colors?.[0] ?? "");
      } catch {
        if (alive) toast.error("Unable to load product details.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      alive = false;
    };
  }, [id]);

  const gallery = useMemo(() => {
    const base = product?.gallery?.length ? product.gallery : [product?.image ?? ""];
    return base.filter(Boolean);
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!size && (product?.sizes?.length ?? 0) > 0) return toast.error("Please select a size.");
    if (!color && (product?.colors?.length ?? 0) > 0) return toast.error("Please select a color.");
    addToCart?.(product, quantity, size || undefined, color || undefined);
    toast.success("Added to cart.");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !body.trim()) return toast.error("Please complete your review.");
    setSubmitting(true);
    try {
      const payload: CreateReviewPayload = { productId: id, author: author.trim(), rating, title: title.trim() || undefined, body: body.trim() };
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? "Review submission failed");
      setReviews((prev) => [json?.data ?? payload, ...prev]);
      setAuthor("");
      setTitle("");
      setBody("");
      setRating(5);
      toast.success("Review published.");
    } catch {
      toast.error("Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-[70vh] bg-[#F9F7F6] px-4 py-16 text-[#665F5B]">Loading...</div>;
  if (!product) return <div className="min-h-[70vh] bg-[#F9F7F6] px-4 py-16"><Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8B0000]"><ArrowLeft size={16} />Back to shop</Link><p className="mt-6 max-w-md text-sm text-[#665F5B]">This product could not be found.</p></div>;

  return (
    <div className="bg-[#F9F7F6] text-[#211E1D]">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8B0000]">
          <ArrowLeft size={16} /> Back to shop
        </Link>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_88px]">
            <motion.div layout className="overflow-hidden border border-[#CFC4BA] bg-[#EFE9E3]">
              <img src={activeImage || product.image} alt={product.name} crossOrigin="anonymous" className="h-full w-full object-cover" />
            </motion.div>
            <div className="flex gap-3 overflow-x-auto sm:flex-col">
              {gallery.map((src, index) => (
                <button key={`${src}-${index}`} type="button" onClick={() => setActiveImage(src)} className={`overflow-hidden border ${activeImage === src ? "border-[#8B0000]" : "border-[#CFC4BA]"}`}>
                  <img src={src} alt={`${product.name} ${index + 1}`} crossOrigin="anonymous" className="h-24 w-20 object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {gallery.slice(0, 2).map((src, index) => (
              <img key={`${src}-m-${index}`} src={src} alt={`${product.name} detail ${index + 1}`} crossOrigin="anonymous" className="aspect-[4/5] w-full object-cover border border-[#CFC4BA]" />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-4 border-b border-[#CFC4BA] pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#665F5B]">{product.category?.name ?? "Collection"}</p>
            <h1 className="font-['Bodoni_Moda'] text-5xl font-light tracking-tight text-[#211E1D]">{product.name}</h1>
            <div className="flex items-center gap-3 text-sm text-[#665F5B]">
              <span className="font-semibold text-[#211E1D]">{product.currency ?? "₹"}{product.price?.toLocaleString?.() ?? product.price}</span>
              <span className="inline-flex items-center gap-1"><Star size={14} className="fill-[#8B0000] text-[#8B0000]" />{product.rating ?? 0}</span>
              <span>{product.reviewCount ?? reviews.length} reviews</span>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#665F5B]">{product.description}</p>
          </div>

          <div className="space-y-5">
            {(product.sizes?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#665F5B]">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((item) => (
                    <button key={item} type="button" onClick={() => setSize(item)} className={`min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${size === item ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC4BA] text-[#211E1D]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(product.colors?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#665F5B]">Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors?.map((item) => (
                    <button key={item} type="button" onClick={() => setColor(item)} className={`min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${color === item ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC4BA] text-[#211E1D]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#665F5B]">Quantity</p>
              <div className="inline-flex items-center border border-[#CFC4BA]">
                <button type="button" onClick={() => setQuantity((v) => Math.max(1, v - 1))} className="px-3 py-2"><Minus size={14} /></button>
                <span className="min-w-10 px-4 text-center text-sm font-semibold">{quantity}</span>
                <button type="button" onClick={() => setQuantity((v) => v + 1)} className="px-3 py-2"><Plus size={14} /></button>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={handleAddToCart} className="inline-flex items-center justify-center gap-2 bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                <Check size={14} /> Add to cart
              </button>
              <button type="button" className="inline-flex items-center justify-center gap-2 border border-[#CFC4BA] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#211E1D]">
                <Heart size={14} /> Save
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#665F5B]"><Truck size={16} className="text-[#8B0000]" /> Complimentary shipping and returns</div>
          </div>
        </section>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section className="space-y-4">
          <h2 className="font-['Bodoni_Moda'] text-3xl font-light">Reviews</h2>
          <form onSubmit={handleReviewSubmit} className="space-y-3 border border-[#CFC4BA] bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Your name" className="border border-[#CFC4BA] bg-transparent px-3 py-2 text-sm outline-none" />
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title" className="border border-[#CFC4BA] bg-transparent px-3 py-2 text-sm outline-none" />
            </div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your experience" rows={4} className="w-full border border-[#CFC4BA] bg-transparent px-3 py-2 text-sm outline-none" />
            <div className="flex items-center gap-3">
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border border-[#CFC4BA] bg-transparent px-3 py-2 text-sm outline-none">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
              </select>
              <button type="submit" disabled={submitting} className="bg-[#8B0000] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60">{submitting ? "Submitting" : "Publish"}</button>
            </div>
          </form>
        </section>
        <section className="space-y-4">
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="border border-[#CFC4BA] bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold">{review.author}</h3>
                  <div className="flex items-center gap-1 text-[#8B0000]">{Array.from({ length: review.rating ?? 0 }).map((_, i) => <Star key={i} size={14} className="fill-current" />)}</div>
                </div>
                {review.title ? <p className="mt-2 text-sm font-semibold">{review.title}</p> : null}
                <p className="mt-2 text-sm leading-7 text-[#665F5B]">{review.body}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#665F5B]">{new Date(review.createdAt).toLocaleDateString()}</p>
              </article>
            ))}
            {reviews.length === 0 ? <p className="text-sm text-[#665F5B]">No reviews yet.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetailPage;