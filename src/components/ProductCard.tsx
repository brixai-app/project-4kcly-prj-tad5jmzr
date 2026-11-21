import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductDetailModal from '@/components/ProductDetailModal';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
  product?: Product | null;
  className?: string;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product = null, className = '', onQuickView }: ProductCardProps) {
  const { addToCart } = useCart?.() ?? {};
  const [open, setOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const image = useMemo(
    () => product?.image ?? `https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80 ?? 'nddn-product'}/1200/1600`,
    [product?.image, product?.slug]
  );

  if (!product) return null;

  const price = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product?.price ?? 0);
  const compareAt = product?.compareAtPrice ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product?.compareAtPrice ?? 0) : null;

  const handleQuickAdd = () => {
    addToCart?.({ productId: product?.id ?? '', quantity: 1 });
  };

  const handleQuickView = () => {
    onQuickView?.(product);
    setOpen(true);
  };

  return (
    <>
      <motion.article
        layout
        whileHover={{ y: -4 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn('group relative flex h-full flex-col overflow-hidden border border-[#CFC6BA] bg-[#FFFDF9] text-[#2B2B2B]', className)}
      >
        <button type="button" onClick={handleQuickView} className="relative block w-full overflow-hidden bg-[#F5F1EB] text-left">
          <div className="aspect-[3/4] w-full overflow-hidden">
            <img
              src={image}
              alt={product?.name ?? 'Product image'}
              crossOrigin="anonymous"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute left-3 top-3 flex items-center gap-2 bg-[#FFFDF9]/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#2B2B2B]">
            <Eye className="h-3.5 w-3.5" />
            Quick view
          </div>
        </button>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.28em] text-[#716A63]">{product?.collection ?? product?.category ?? 'Collection'}</p>
            <h3 className="mt-1 truncate text-sm font-medium tracking-tight text-[#2B2B2B]">{product?.name ?? 'Untitled product'}</h3>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-[#2B2B2B]">{price}</span>
                {compareAt ? <span className="text-xs text-[#716A63] line-through">{compareAt}</span> : null}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[#716A63]">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-[11px]">{(product?.rating ?? 0).toFixed(1)}</span>
                <span className="text-[11px]">({product?.reviewCount ?? 0})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWishlisted((v) => !v)}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center border border-[#CFC6BA] transition-colors',
                wishlisted ? 'bg-[#8B0000] text-white' : 'bg-transparent text-[#2B2B2B] hover:bg-[#F5F1EB]'
              )}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={cn('h-4 w-4', wishlisted && 'fill-current')} />
            </button>
          </div>

          <div className="mt-auto flex items-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="inline-flex flex-1 items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#650000]"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Quick add
            </button>
            <button
              type="button"
              onClick={handleQuickView}
              className="inline-flex items-center justify-center border border-[#CFC6BA] bg-transparent px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#2B2B2B] transition-colors hover:bg-[#F5F1EB]"
            >
              View
            </button>
          </div>
        </div>
      </motion.article>

      <ProductDetailModal product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}

export default ProductCard;