import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, ShoppingCart, Star } from 'lucide-react';
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import ProductDetailModal from "@/components/ProductDetailModal";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product?: Product | null;
  className?: string;
};

export function ProductCard({ product = null, className = "" }: ProductCardProps) {
  const { addToCart } = useCart?.() ?? {};
  const [open, setOpen] = useState(false);
  const image = product?.images?.[0]?.url ?? `https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80 ?? "nddn"}/1200/1600`;
  const alt = product?.images?.[0]?.alt ?? product?.name ?? "Product image";
  const price = useMemo(() => {
    const currency = product?.currency ?? "INR";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(product?.price ?? 0);
  }, [product?.currency, product?.price]);

  const handleQuickAdd = () => {
    if (!product) return;
    addToCart?.({ productId: product.id, quantity: 1 });
    toast.success(`${product.name ?? "Item"} added to cart`);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={cn("group relative flex h-full flex-col overflow-hidden rounded-sm border border-[#CFC5B8] bg-[#FAF9F6]", className)}
      >
        <button type="button" onClick={() => setOpen(true)} className="block w-full text-left">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F1EB]">
            <img
              src={image}
              alt={alt}
              crossOrigin="anonymous"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/35 via-black/10 to-transparent p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.24em]">{product?.collection ?? product?.category ?? "Collection"}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.24em]">
                <Eye className="h-3.5 w-3.5" />
                Quick View
              </span>
            </div>
          </div>
        </button>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-[#68625C]">
                {product?.category ?? "Category"}
              </p>
              <h3 className="mt-1 truncate font-serif text-lg font-medium leading-tight text-[#1C1C1C]">
                {product?.name ?? "Untitled Product"}
              </h3>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-[#1C1C1C]">{price}</p>
              {typeof product?.compareAtPrice === "number" && product.compareAtPrice > product.price ? (
                <p className="text-[11px] text-[#68625C] line-through">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: product?.currency ?? "INR", maximumFractionDigits: 0 }).format(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#68625C]">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{(product?.rating ?? 4.8).toFixed(1)}</span>
              <span>·</span>
              <span>{product?.reviewCount ?? 0} reviews</span>
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              className="inline-flex items-center gap-2 rounded-sm bg-[#8B0000] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white opacity-100 transition-colors duration-200 hover:bg-[#650000] sm:opacity-0 sm:translate-y-2 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Quick Add
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.article>

      <ProductDetailModal open={open} onOpenChange={setOpen} product={product ?? undefined} />
    </>
  );
}

export default ProductCard;