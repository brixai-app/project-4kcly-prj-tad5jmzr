import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';
import ProductDetailModal from '@/components/ProductDetailModal';
import { useCart } from '@/context/CartContext';

type ProductCardProps = {
  product?: Product | null;
  className?: string;
  onQuickView?: (product: Product) => void;
};

export function ProductCard({ product = null, className = '', onQuickView }: ProductCardProps) {
  const [open, setOpen] = useState(false);
  const { addToCart } = useCart?.() ?? {};
  const safeProduct = product ?? null;

  const image = useMemo(
    () => safeProduct?.image ?? 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
    [safeProduct?.image]
  );

  const priceLabel = useMemo(() => {
    const currency = safeProduct?.currency ?? '₹';
    const value = Number.isFinite(safeProduct?.price ?? NaN) ? safeProduct?.price ?? 0 : 0;
    return `${currency}${value.toLocaleString('en-IN')}`;
  }, [safeProduct?.currency, safeProduct?.price]);

  const handleQuickAdd = () => {
    if (!safeProduct) return;
    addToCart?.(safeProduct, 1);
    toast.success(`${safeProduct.name} added to cart`);
  };

  const handleQuickView = () => {
    if (!safeProduct) return;
    if (onQuickView) onQuickView(safeProduct);
    setOpen(true);
  };

  if (!safeProduct) return null;

  return (
    <>
      <motion.article
        layout
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn('group relative flex h-full flex-col overflow-hidden border border-[#C9BEB4] bg-white', className)}
      >
        <button type="button" onClick={handleQuickView} className="block w-full text-left">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#F1ECE7]">
            <img
              src={image}
              alt={safeProduct.name}
              crossOrigin="anonymous"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/35 via-black/10 to-transparent p-4 text-white">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
                  {safeProduct.category ?? 'Collection'}
                </p>
                <h3 className="mt-1 truncate font-serif text-lg font-medium leading-tight">
                  {safeProduct.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{(safeProduct.rating ?? 4.8).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </button>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6F665F]">
                {safeProduct.category ?? 'Editorial'}
              </p>
              <p className="mt-1 line-clamp-2 font-serif text-sm leading-6 text-[#2E2E2E]">
                {safeProduct.description ?? 'A refined wardrobe piece shaped for modern dressing.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickView}
              className="shrink-0 border border-[#C9BEB4] p-2 text-[#2E2E2E] transition-colors hover:bg-[#F1ECE7]"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight text-[#2E2E2E]">{priceLabel}</p>
              <p className={cn('text-[10px] font-semibold uppercase tracking-[0.28em]', safeProduct.inStock === false ? 'text-[#8B0000]' : 'text-[#6F665F]')}>
                {safeProduct.inStock === false ? 'Out of stock' : 'In stock'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={safeProduct.inStock === false}
                className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add
              </button>
              <button
                type="button"
                onClick={handleQuickView}
                className="inline-flex items-center gap-2 border border-[#C9BEB4] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#2E2E2E] transition-colors hover:bg-[#F1ECE7]"
              >
                View
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-3 border border-[#8B0000] bg-[#8B0000] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
        >
          Quick Add
        </button>
      </motion.article>

      <ProductDetailModal open={open} onOpenChange={setOpen} product={safeProduct} />
    </>
  );
}

export default ProductCard;