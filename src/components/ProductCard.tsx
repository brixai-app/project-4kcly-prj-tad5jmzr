import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Plus, ShoppingBag, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductDetailModal from '@/components/ProductDetailModal';

export interface ProductCardProps {
  product?: Product | null;
  className?: string;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product = null, className = '', onQuickView }: ProductCardProps) {
  const { addToCart } = useCart?.() ?? {};
  const [open, setOpen] = useState(false);
  const image = product?.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
  const alt = product?.images?.[0]?.alt ?? product?.name ?? 'Product image';
  const priceLabel = useMemo(() => {
    const currency = product?.currency ?? '₹';
    const value = Number.isFinite(product?.price ?? NaN) ? (product?.price ?? 0).toLocaleString('en-IN') : '0';
    return `${currency}${value}`;
  }, [product?.currency, product?.price]);

  const handleQuickAdd = () => {
    if (!product) return;
    addToCart?.(product, 1);
  };

  const handleQuickView = () => {
    if (!product) return;
    if (onQuickView) onQuickView(product);
    else setOpen(true);
  };

  if (!product) return null;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={cn('group relative flex h-full flex-col overflow-hidden border border-[#C9BDB2] bg-[#F9F7F6] text-[#2B2B2B]', className)}
      >
        <button type="button" onClick={handleQuickView} className="relative block w-full text-left">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#EFEAE5]">
            <img
              src={image}
              alt={alt}
              crossOrigin="anonymous"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
            <div className="absolute left-3 top-3 flex items-center gap-2 bg-[#F9F7F6]/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#2B2B2B] backdrop-blur-sm">
              <Eye className="h-3.5 w-3.5" />
              Quick View
            </div>
          </div>
        </button>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6E655F]">
                {product.collection ?? product.category ?? 'Collection'}
              </p>
              <h3 className="mt-1 truncate font-['Playfair_Display'] text-lg font-medium leading-tight text-[#2B2B2B]">
                {product.name}
              </h3>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6E655F]">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{Number.isFinite(product.rating ?? NaN) ? (product.rating ?? 0).toFixed(1) : '4.8'}</span>
            </div>
          </div>

          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-6 text-[#6E655F]">
            {product.description}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#C9BDB2] pt-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6E655F]">Price</p>
              <p className="mt-1 font-['Playfair_Display'] text-xl font-semibold text-[#2B2B2B]">{priceLabel}</p>
            </div>
            <button
              type="button"
              onClick={handleQuickAdd}
              className="inline-flex items-center gap-2 border border-[#B11226] bg-[#B11226] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors duration-200 hover:bg-[#8F0E1F]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Quick Add</span>
              <Plus className="h-3.5 w-3.5 sm:hidden" />
            </button>
          </div>
        </div>
      </motion.article>

      <ProductDetailModal product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}

export default ProductCard;