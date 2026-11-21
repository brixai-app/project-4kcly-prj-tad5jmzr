import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import ProductDetailModal from "@/components/ProductDetailModal";
import type { Product } from "@/types";

type ProductCardProps = {
  product?: Product | null;
  className?: string;
  onQuickPreview?: (product: Product) => void;
};

type EditorialGridProps = {
  children?: React.ReactNode;
  className?: string;
};

export function EditorialGrid({ children, className = "" }: EditorialGridProps) {
  return <div className={cn("grid gap-5 sm:grid-cols-2 xl:grid-cols-3", className)}>{children}</div>;
}

export function ProductCard({ product = null, className = "", onQuickPreview }: ProductCardProps) {
  const { addItem } = useCart?.() ?? {};
  const [open, setOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const image = useMemo(() => product?.images?.[0] ?? "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85", [product?.images]);
  const currency = product?.currency ?? "INR";
  const priceLabel = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(product?.price ?? 0), [currency, product?.price]);
  const compareLabel = useMemo(() => {
    const compare = product?.compareAtPrice ?? null;
    return compare && compare > (product?.price ?? 0)
      ? new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(compare)
      : "";
  }, [currency, product?.compareAtPrice, product?.price]);

  const handleQuickAdd = () => {
    if (!product) return;
    const firstVariant = product?.variants?.[0];
    addItem?.({
      productId: product.id,
      variantId: firstVariant?.id ?? null,
      name: product.name,
      image: firstVariant?.image ?? image,
      price: firstVariant?.price ?? product.price,
      quantity: 1,
      color: firstVariant?.color ?? null,
      size: firstVariant?.size ?? null,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handlePreview = () => {
    if (!product) return;
    if (onQuickPreview) onQuickPreview(product);
    else setOpen(true);
  };

  if (!product) return null;

  return (
    <>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={cn("group relative overflow-hidden border border-[#CFC5B8] bg-[#FFFCF8] text-[#211F1D]", className)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F1EC]">
          <img
            src={image}
            alt={product.name}
            crossOrigin="anonymous"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            {product.featured ? (
              <span className="border border-[#CFC5B8] bg-[#FFFCF8]/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#211F1D]">
                Featured
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setWishlisted((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center border border-[#CFC5B8] bg-[#FFFCF8]/90 text-[#211F1D] transition-colors hover:bg-[#8B0000] hover:text-white"
              aria-label="Save to wishlist"
            >
              <Heart className={cn("h-4 w-4", wishlisted ? "fill-current" : "")} />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#211F1D]/70 via-[#211F1D]/20 to-transparent p-4 text-white">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">{product.collection ?? product.category ?? "Collection"}</p>
              <h3 className="mt-1 truncate font-['Bodoni_Moda'] text-2xl font-light tracking-tight">{product.name}</h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{product.inStock ?? true ? "In stock" : "Sold out"}</span>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="pointer-events-auto mb-4 flex w-[calc(100%-2rem)] items-center justify-between gap-2 border border-[#CFC5B8] bg-[#FFFCF8] p-2">
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={!(product.inStock ?? true)}
                className="inline-flex flex-1 items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />
                Quick Add
              </button>
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex items-center justify-center border border-[#CFC5B8] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#211F1D] transition-colors hover:bg-[#F5F1EC]"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6F685F]">{product.category ?? product.collection ?? "Editorial"}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#211F1D]">{product.description ?? "Tailored silhouette with a restrained finish."}</p>
            </div>
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex shrink-0 items-center gap-1 border border-[#CFC5B8] px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#211F1D] transition-colors hover:bg-[#F5F1EC]"
            >
              Preview
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-end justify-between gap-3 border-t border-[#CFC5B8] pt-3">
            <div className="min-w-0">
              <p className="text-lg font-semibold text-[#211F1D]">{priceLabel}</p>
              {compareLabel ? <p className="text-xs text-[#6F685F] line-through">{compareLabel}</p> : null}
            </div>
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", product.inStock ?? true ? "text-[#6F685F]" : "text-[#8B0000]")}>
              {(product.inStock ?? true) ? "Available now" : "Out of stock"}
            </p>
          </div>
        </div>
      </motion.article>
      <ProductDetailModal open={open} onOpenChange={setOpen} product={product} />
    </>
  );
}

export default ProductCard;