import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, X } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

type ProductDetailModalProps = {
  product?: Product | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

type ProductDetailViewProps = {
  product?: Product | null;
  onAddToCart?: (variantId?: string | null, quantity?: number) => void;
  className?: string;
};

const money = (value: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value ?? 0);

export function ProductDetailView({ product = null, onAddToCart = () => {}, className = "" }: ProductDetailViewProps) {
  const variants = product?.variants ?? [];
  const images = product?.images?.length ? product.images : ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"];
  const [activeImage, setActiveImage] = useState(images[0] ?? "");
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setActiveImage(images[0] ?? "");
    setSelectedVariantId(variants[0]?.id ?? "");
    setQuantity(1);
  }, [product?.id]);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? variants[0] ?? null,
    [variants, selectedVariantId]
  );

  const stock = selectedVariant?.stock ?? (product?.inStock === false ? 0 : 12);
  const available = stock > 0;
  const price = selectedVariant?.price ?? product?.price ?? 0;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? product?.compareAtPrice ?? null;
  const currency = product?.currency ?? "INR";

  const handleAdd = () => {
    if (!product) return;
    if (!available) {
      toast.error("Selected variant is currently out of stock.");
      return;
    }
    onAddToCart(selectedVariant?.id ?? null, quantity);
    toast.success(`${product.name} added to cart.`);
  };

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[1.15fr_0.85fr]", className)}>
      <div className="space-y-3">
        <div className="overflow-hidden border border-[#CFC5B8] bg-[#FFFCF8]">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={product?.name ?? "Product image"}
            crossOrigin="anonymous"
            className="h-[72vh] w-full object-cover"
            initial={{ opacity: 0.85, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(image)}
              className={cn(
                "h-20 w-16 shrink-0 overflow-hidden border transition",
                activeImage === image ? "border-[#8B0000]" : "border-[#CFC5B8]"
              )}
            >
              <img src={image} alt="" crossOrigin="anonymous" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="sticky top-6 space-y-6 self-start border border-[#CFC5B8] bg-[#FFFCF8] p-5">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6F685F]">{product?.collection ?? product?.category ?? "Collection"}</p>
          <h2 className="font-['Bodoni_Moda'] text-4xl font-light tracking-tight text-[#211F1D]">{product?.name ?? "Untitled Product"}</h2>
          <p className="text-sm leading-6 text-[#6F685F]">{product?.description ?? "A refined editorial piece designed for a quiet, elevated wardrobe."}</p>
        </div>

        <div className="flex items-end justify-between gap-4 border-y border-[#CFC5B8] py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6F685F]">Price</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-[#211F1D]">{money(price, currency)}</span>
              {compareAtPrice ? <span className="text-sm text-[#6F685F] line-through">{money(compareAtPrice, currency)}</span> : null}
            </div>
          </div>
          <div className={cn("text-right text-sm font-semibold", available ? "text-[#8B0000]" : "text-[#6F685F]")}>
            {available ? `${stock} in stock` : "Sold out"}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6F685F]">Select size</p>
          <div className="flex flex-wrap gap-2">
            {(variants.length ? variants : [{ id: "default", name: "One size", size: "One size", stock }]).map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={cn(
                  "min-w-0 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                  selectedVariantId === variant.id ? "border-[#8B0000] bg-[#8B0000] text-white" : "border-[#CFC5B8] text-[#211F1D]"
                )}
              >
                {variant.size ?? variant.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6F685F]">Quantity</p>
          <div className="inline-flex items-center border border-[#CFC5B8]">
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3 text-[#211F1D]">
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-12 px-4 text-center text-sm font-semibold text-[#211F1D]">{quantity}</span>
            <button type="button" onClick={() => setQuantity((value) => Math.min(Math.max(stock, 1), value + 1))} className="p-3 text-[#211F1D]">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!available}
          className="flex w-full items-center justify-center gap-2 bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:bg-[#CFC5B8]"
        >
          <Check className="h-4 w-4" />
          Add to cart
        </button>

        <div className="grid gap-2 border-t border-[#CFC5B8] pt-4 text-sm text-[#6F685F]">
          <div className="flex items-center justify-between gap-4">
            <span className="uppercase tracking-[0.2em]">SKU</span>
            <span className="text-right">{selectedVariant?.sku ?? product?.id ?? "NDDN"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="uppercase tracking-[0.2em]">Color</span>
            <span className="text-right">{selectedVariant?.color ?? "Neutral"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailModal({ product = null, open = false, onOpenChange = () => {}, className = "" }: ProductDetailModalProps) {
  const { addItem } = useCart();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-[#0a0a0a]/55"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.28 }}
              >
                <div className={cn("mx-auto max-w-6xl border border-[#CFC5B8] bg-[#F5F1EC] shadow-2xl", className)}>
                  <div className="flex items-center justify-between border-b border-[#CFC5B8] px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#6F685F]">
                      <ArrowLeft className="h-4 w-4" />
                      Quick preview
                    </div>
                    <Dialog.Close asChild>
                      <button type="button" className="p-2 text-[#211F1D]">
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <div className="p-4 sm:p-6">
                    <ProductDetailView
                      product={product}
                      onAddToCart={(variantId, quantity) => {
                        if (!product) return;
                        const variant = product.variants?.find((item) => item.id === variantId) ?? product.variants?.[0] ?? null;
                        addItem({
                          productId: product.id,
                          variantId: variant?.id ?? null,
                          name: product.name,
                          image: variant?.image ?? product.images?.[0] ?? null,
                          price: variant?.price ?? product.price,
                          quantity: quantity ?? 1,
                          color: variant?.color ?? null,
                          size: variant?.size ?? null,
                        });
                      }}
                    />
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