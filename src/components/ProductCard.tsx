import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Eye, ShoppingBag, Star } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import ProductDetailModal from "@/components/ProductDetailModal";

type ProductCardProps = {
  product?: Product | null;
  className?: string;
};

export function ProductCard({ product = null, className = "" }: ProductCardProps) {
  const { addItem } = useCart?.() ?? {};
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const imageSrc = useMemo(() => {
    const fallback = `https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80 ?? "product")}/1200/1600`;
    return product?.image?.trim() ? product.image : fallback;
  }, [product?.image, product?.slug]);

  if (!product) return null;

  const handleQuickAdd = () => {
    if (!product?.inStock) {
      toast.error("This piece is currently unavailable.");
      return;
    }
    addItem?.(product, 1);
    setAdded(true);
    toast.success("Added to cart.");
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <>
      <motion.article
        layout
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn("group relative flex h-full flex-col overflow-hidden border border-[#CFC4BA] bg-white", className)}
      >
        <button type="button" onClick={() => setOpen(true)} className="block w-full text-left">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#EFE9E3]">
            <img
              src={imageSrc}
              alt={product?.name ?? "Product image"}
              crossOrigin="anonymous"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <span className="min-w-0 max-w-[70%] truncate bg-white/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#211E1D]">
                {product?.category?.name ?? "Collection"}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
                  product?.inStock ? "border-[#CFC4BA] bg-white/85 text-[#211E1D]" : "border-[#8B0000] bg-[#8B0000] text-white"
                )}
              >
                {product?.inStock ? "In stock" : "Sold out"}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 bg-[#211E1D]/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                <Eye className="h-3.5 w-3.5" />
                Quick view
              </span>
              <span className="inline-flex items-center gap-2 bg-[#8B0000] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                <ArrowRight className="h-3.5 w-3.5" />
                Explore
              </span>
            </div>
          </div>
        </button>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-['Bodoni_Moda'] text-xl font-medium tracking-tight text-[#211E1D]">
                {product?.name ?? "Untitled"}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#665F5B]">
                {product?.description ?? ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#211E1D]">
              <Star className="h-4 w-4 fill-[#8B0000] text-[#8B0000]" />
              <span>{(product?.rating ?? 0).toFixed(1)}</span>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#665F5B]">Price</p>
              <p className="font-['Bodoni_Moda'] text-2xl font-semibold tracking-tight text-[#211E1D]">
                {product?.currency ?? "₹"}
                {product?.price?.toLocaleString?.() ?? "0"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!product?.inStock}
              className={cn(
                "inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors",
                product?.inStock
                  ? "border-[#8B0000] bg-[#8B0000] text-white hover:bg-[#680000]"
                  : "cursor-not-allowed border-[#CFC4BA] bg-[#EFE9E3] text-[#665F5B]"
              )}
            >
              {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
              {added ? "Added" : "Quick add"}
            </button>
          </div>
        </div>
      </motion.article>

      <ProductDetailModal product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}

export default ProductCard;