import React, { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, X } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

export type ProductDetailModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  product?: Product | null;
};

export function ProductDetailModal({ open = false, onOpenChange = () => {}, product = null }: ProductDetailModalProps) {
  const { addToCart } = useCart() as { addToCart?: (product: Product, quantity: number, size?: string, color?: string) => void };
  const gallery = useMemo(() => [product?.image, ...(product?.gallery ?? [])].filter(Boolean) as string[], [product]);
  const [index, setIndex] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setIndex(0);
    setSize(product?.sizes?.[0] ?? "");
    setColor(product?.colors?.[0] ?? "");
    setQuantity(1);
  }, [product?.id, open]);

  const inStock = product?.inStock ?? true;
  const maxQty = inStock ? 9 : 0;

  const handleAdd = () => {
    if (!product) return;
    if (!inStock) {
      toast.error("This piece is currently out of stock.");
      return;
    }
    addToCart?.(product, quantity, size || undefined, color || undefined);
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
                className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-x-0 top-0 z-50 mx-auto flex h-full w-full max-w-6xl items-center justify-center p-3 sm:p-6"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <div className="grid max-h-[92vh] w-full overflow-hidden border border-[#CFC4BA] bg-[#F9F7F6] shadow-2xl md:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative min-h-[42vh] overflow-hidden bg-[#EFE9E3]">
                    <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
                      <Dialog.Close asChild>
                        <button className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC4BA] bg-[#F9F7F6] text-[#211E1D] transition-colors hover:bg-[#EFE9E3]">
                          <X className="h-4 w-4" />
                        </button>
                      </Dialog.Close>
                      <div className="border border-[#CFC4BA] bg-[#F9F7F6]/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#665F5B]">
                        Quick Preview
                      </div>
                    </div>
                    {gallery.length > 0 ? (
                      <img
                        src={gallery[index] ?? product?.image ?? ""}
                        alt={product?.name ?? "Product image"}
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#665F5B]">No image available</div>
                    )}
                    {gallery.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIndex((v) => (v - 1 + gallery.length) % gallery.length)}
                          className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-[#CFC4BA] bg-[#F9F7F6]/90 text-[#211E1D] transition-colors hover:bg-white"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIndex((v) => (v + 1) % gallery.length)}
                          className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-[#CFC4BA] bg-[#F9F7F6]/90 text-[#211E1D] transition-colors hover:bg-white"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </>
                    ) : null}
                  </div>

                  <div className="flex min-h-0 flex-col overflow-y-auto border-t border-[#CFC4BA] md:border-l md:border-t-0">
                    <div className="space-y-5 p-5 sm:p-6">
                      <div className="space-y-2">
                        <Dialog.Title className="font-['Bodoni_Moda',serif] text-3xl font-light tracking-tight text-[#211E1D]">
                          {product?.name ?? "Selected piece"}
                        </Dialog.Title>
                        <p className="text-xs uppercase tracking-[0.28em] text-[#665F5B]">{product?.category?.name ?? "Collection"}</p>
                        <p className="text-lg font-semibold text-[#211E1D]">
                          {product?.currency ?? "₹"}
                          {product?.price?.toLocaleString?.() ?? "0"}
                        </p>
                      </div>

                      <p className="text-sm leading-7 text-[#665F5B]">{product?.description ?? "A refined wardrobe essential with a tailored silhouette and elevated finish."}</p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#665F5B]">Size</span>
                          <span className="text-[10px] uppercase tracking-[0.24em] text-[#665F5B]">{size || "Select"}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(product?.sizes ?? ["XS", "S", "M", "L"]).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setSize(item)}
                              className={cn(
                                "min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition-colors",
                                size === item ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC4BA] bg-white text-[#211E1D] hover:bg-[#EFE9E3]"
                              )}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#665F5B]">Color</span>
                          <span className="text-[10px] uppercase tracking-[0.24em] text-[#665F5B]">{color || "Select"}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(product?.colors ?? ["Ivory", "Black", "Crimson"]).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setColor(item)}
                              className={cn(
                                "min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition-colors",
                                color === item ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC4BA] bg-white text-[#211E1D] hover:bg-[#EFE9E3]"
                              )}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-y border-[#CFC4BA] py-4">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#665F5B]">Quantity</span>
                        <div className="flex items-center border border-[#CFC4BA] bg-white">
                          <button type="button" onClick={() => setQuantity((v) => Math.max(1, v - 1))} className="inline-flex h-10 w-10 items-center justify-center text-[#211E1D]">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-[#211E1D]">{quantity}</span>
                          <button type="button" onClick={() => setQuantity((v) => Math.min(maxQty || 1, v + 1))} className="inline-flex h-10 w-10 items-center justify-center text-[#211E1D]" disabled={!inStock}>
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[#665F5B]">
                        <Check className={cn("h-4 w-4", inStock ? "text-[#8B0000]" : "text-[#665F5B]")} />
                        <span>{inStock ? "In stock and ready to ship" : "Currently unavailable"}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!inStock}
                        className="inline-flex w-full items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#680000] disabled:cursor-not-allowed disabled:bg-[#665F5B]"
                      >
                        Add to cart
                      </button>
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