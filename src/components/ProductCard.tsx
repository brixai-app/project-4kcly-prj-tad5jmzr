import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Heart, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductDetailModal from '@/components/ProductDetailModal';

export function ProductCard({ product = {} as Product, className = '' }: { product?: Product; className?: string } = {}) {
  const navigate = useNavigate();
  const { addItem } = useCart?.() ?? {};
  const [open, setOpen] = useState(false);
  const image = useMemo(() => product?.images?.[0]?.src ?? `https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80 ?? 'nddn')}/1200/1600`, [product?.images, product?.slug]);
  const alt = product?.images?.[0]?.alt ?? product?.name ?? 'Product image';
  const inStock = (product?.stock ?? 0) > 0;

  const handleQuickAdd = () => {
    if (!inStock || !addItem || !product?.id) return;
    addItem({
      id: `${product.id}-${product?.variants?.[0]?.id ?? 'default'}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency ?? 'INR',
      quantity: 1,
      image,
      size: product?.variants?.[0]?.size,
      color: product?.variants?.[0]?.color,
      stock: product.stock,
    });
  };

  return (
    <>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className={cn('group flex h-full flex-col overflow-hidden border border-[#C9BFB1] bg-[#FFFCF7] text-[#2E2B28]', className)}
      >
        <button type="button" onClick={() => setOpen(true)} className="block w-full text-left">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F1EB]">
            <img
              src={image}
              alt={alt}
              crossOrigin="anonymous"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute left-0 top-0 flex w-full items-start justify-between p-3">
              <span className="border border-[#C9BFB1] bg-[#FFFCF7]/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71695F]">
                {product?.collection ?? product?.category ?? 'Collection'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="border border-[#C9BFB1] bg-[#FFFCF7]/90 p-2 text-[#71695F] transition-colors hover:text-[#8B0000]"
                aria-label="Save to wishlist"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#2E2B28]/70 to-transparent p-3 text-white">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">{inStock ? 'In stock' : 'Sold out'}</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                <Star className="h-3.5 w-3.5 fill-current" />
                {product?.rating?.toFixed?.(1) ?? '4.8'}
              </span>
            </div>
          </div>
        </button>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-[#71695F]">
              {product?.category ?? 'Editorial'}
            </p>
            <h3 className="mt-1 truncate font-['Playfair_Display'] text-lg font-medium leading-tight text-[#2E2B28]">
              {product?.name ?? 'Untitled Piece'}
            </h3>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2E2B28]">
                ₹{Number(product?.price ?? 0).toLocaleString('en-IN')}
              </p>
              {typeof product?.compareAtPrice === 'number' && product.compareAtPrice > product.price ? (
                <p className="text-xs text-[#71695F] line-through">
                  ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8B0000] transition-colors hover:text-[#650000]"
            >
              View <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-auto flex gap-2 opacity-100 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!inStock}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-2 border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors',
                inStock
                  ? 'border-[#8B0000] bg-[#8B0000] text-white hover:bg-[#650000]'
                  : 'cursor-not-allowed border-[#C9BFB1] bg-[#F5F1EB] text-[#71695F]'
              )}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Quick Add
            </button>
            <button
              type="button"
              onClick={() => navigate(`/shop/${product?.slug ?? product?.id ?? ''}`)}
              className="inline-flex items-center justify-center border border-[#C9BFB1] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#2E2B28] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.article>

      <ProductDetailModal open={open} onOpenChange={setOpen} product={product} />
    </>
  );
}

export default ProductCard;