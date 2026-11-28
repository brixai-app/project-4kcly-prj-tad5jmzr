import React, { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, Check, ShoppingBag, Heart } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";

export interface ProductDetailModalProps {
  product?: Product | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProductDetailModal({
  product = null,
  open = false,
  onOpenChange = () => {},
}: ProductDetailModalProps) {
  const { addToCart } = useCart?.() ?? {};
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);

  const images = useMemo(() => product?.images?.filter(Boolean) ?? [], [product]);
  const primaryImage = images?.[0]?.url ?? "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85";
  const sizes = product?.sizes ?? [];
  const colors = product?.colors ?? [];
  const inStock = product?.inStock ?? true;

  useEffect(() => {
    setSize(sizes?.[0] ?? "");
    setColor(colors?.[0] ?? "");
    setQty(1);
  }, [product?.id, sizes, colors]);

  const handleAdd = () => {
    if (!product) return;
    if (!inStock) {
      toast.error("This piece is currently out of stock.");
      return;
    }
    if (sizes.length > 0 && !size) {
      toast.error("Please select a size.");
      return;
    }
    if (colors.length > 0 && !color) {
      toast.error("Please select a color.");
      return;
    }
    addToCart?.({ productId: product.id, quantity: qty, size: size || undefined, color: color || undefined });
    toast.success("Added to cart.");
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="fixed left-1/2 top-1/2 z-50 w-[min(94vw,980px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-[#CFC5B8] bg-[#FAF9F6] text-[#1C1C1C] shadow-2xl"
              >
                <div className="grid max-h-[88vh] grid-cols-1 md:grid-cols-[1.05fr_0.95fr]">
                  <div className="relative min-h-[320px] bg-[#F5F1EB]">
                    <img
                      src={primaryImage}
                      alt={product?.images?.[0]?.alt ?? product?.name ?? "Product image"}
                      crossOrigin="anonymous"
                      className="h-full w-full object-cover"
                    />
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center border border-[#CFC5B8] bg-[#FAF9F6] text-[#1C1C1C] transition hover:bg-[#8B0000] hover:text-white"
                        aria-label="Close product preview"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="flex min-h-0 flex-col">
                    <div className="flex items-start justify-between gap-4 border-b border-[#CFC5B8] px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8B0000]">
                          {product?.collection ?? product?.category ?? "Collection"}
                        </p>
                        <Dialog.Title className="mt-2 font-['Playfair_Display'] text-3xl font-normal tracking-tight text-[#1C1C1C]">
                          {product?.name ?? "Untitled piece"}
                        </Dialog.Title>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#1C1C1C]">
                          {product?.currency ?? "₹"}
                          {product?.price?.toLocaleString?.("en-IN") ?? "0"}
                        </p>
                        {typeof product?.compareAtPrice === "number" ? (
                          <p className="text-xs text-[#68625C] line-through">
                            {product?.currency ?? "₹"}
                            {product?.compareAtPrice?.toLocaleString?.("en-IN") ?? ""}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                      <div className="space-y-5">
                        <p className="text-sm leading-6 text-[#68625C]">
                          {product?.description ?? "A refined wardrobe essential with a tailored silhouette and editorial finish."}
                        </p>

                        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-[#68625C]">
                          <span className={cn("inline-flex items-center gap-1", inStock ? "text-[#1C1C1C]" : "text-[#8B0000]")}>
                            {inStock ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {inStock ? "In stock" : "Sold out"}
                          </span>
                          <span>{product?.category ?? "Fashion"}</span>
                        </div>

                        {sizes.length > 0 ? (
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#68625C]">
                              <span>Size</span>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {sizes.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setSize(s)}
                                  className={cn(
                                    "min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
                                    size === s
                                      ? "border-[#8B0000] bg-[#8B0000] text-white"
                                      : "border-[#CFC5B8] bg-white text-[#1C1C1C] hover:border-[#1C1C1C]"
                                  )}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {colors.length > 0 ? (
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#68625C]">
                              <span>Color</span>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {colors.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setColor(c)}
                                  className={cn(
                                    "min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
                                    color === c
                                      ? "border-[#8B0000] bg-[#8B0000] text-white"
                                      : "border-[#CFC5B8] bg-white text-[#1C1C1C] hover:border-[#1C1C1C]"
                                  )}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between border-t border-[#CFC5B8] pt-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setQty((v) => Math.max(1, v - 1))}
                              className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC5B8] bg-white text-[#1C1C1C] transition hover:border-[#1C1C1C]"
                              aria-label="Decrease quantity"
                            >
                              <span className="text-lg leading-none">−</span>
                            </button>
                            <span className="min-w-10 text-center text-sm font-semibold text-[#1C1C1C]">{qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty((v) => v + 1)}
                              className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC5B8] bg-white text-[#1C1C1C] transition hover:border-[#1C1C1C]"
                              aria-label="Increase quantity"
                            >
                              <span className="text-lg leading-none">+</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!inStock}
                            className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Add to cart
                          </button>
                        </div>

                        <button
                          type="button"
                          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#1C1C1C] transition hover:text-[#8B0000]"
                          onClick={() => toast.message("Saved to wishlist.")}
                        >
                          <Heart className="h-4 w-4" />
                          Save to wishlist
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default ProductDetailModal;