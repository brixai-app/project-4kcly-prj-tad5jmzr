import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import ProductDetailModal from '@/components/ProductDetailModal';
import type { Product } from '@/types';

export function ProductCard({ product }: { product?: Product }) {
  const { addItem } = useCart?.() ?? {};
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageSrc = useMemo(() => {
    const primary = product?.images?.[0]?.url ?? product?.image ?? '';
    return primary || `https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80 ?? product?.id ?? 'nddn')}/1200/1600`;
  }, [product?.id, product?.image, product?.images, product?.slug]);

  const currency = product?.currency ?? '₹';
  const price = `${currency}${Number(product?.price ?? 0).toLocaleString('en-IN')}`;
  const compareAt = product?.compareAtPrice ? `${currency}${Number(product?.compareAtPrice).toLocaleString('en-IN')}` : '';

  const handleQuickAdd = () => {
    if (!product || !addItem) return;
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      product,
      name: product.name ?? 'Untitled',
      price: Number(product.price ?? 0),
      quantity: 1,
      image: product.images?.[0]?.url ?? product.image,
    });
  };

  if (!product) return null;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="group relative flex h-full flex-col overflow-hidden border border-[#C9BDB2] bg-white"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[#EEE8E2]">
          <Link to={`/shop/${product.slug ?? product.id}`} className="block h-full w-full">
            <img
              src={imgError ? `https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80 ?? product.id ?? 'nddn-fallback')}/1200/1600` : imageSrc}
              alt={product.images?.[0]?.alt ?? product.name ?? 'Product image'}
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute right-3 top-3 inline-flex items-center gap-2 border border-[#C9BDB2] bg-[#F9F7F6]/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2E2E2E] backdrop-blur-sm transition-colors hover:bg-white"
          >
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </button>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#650000]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Quick Add
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6E655E]">
                {product.collection ?? product.category ?? 'Collection'}
              </p>
              <Link to={`/shop/${product.slug ?? product.id}`} className="block min-w-0">
                <h3 className="truncate font-['Playfair_Display'] text-lg font-medium leading-tight text-[#2E2E2E]">
                  {product.name ?? 'Untitled'}
                </h3>
              </Link>
            </div>
            <button
              type="button"
              aria-label="Save to wishlist"
              className="mt-0.5 inline-flex h-9 w-9 items-center justify-center border border-[#C9BDB2] text-[#2E2E2E] transition-colors hover:bg-[#F9F7F6]"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2E2E2E]">{price}</p>
              {compareAt ? <p className="text-xs text-[#6E655E] line-through">{compareAt}</p> : null}
            </div>
            <button
              type="button"
              onClick={handleQuickAdd}
              className={cn(
                'inline-flex items-center gap-2 border border-[#C9BDB2] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2E2E2E] transition-colors hover:bg-[#F9F7F6]',
                !addItem && 'opacity-50'
              )}
            >
              Add
            </button>
          </div>
        </div>
      </motion.article>

      <ProductDetailModal product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}

export default ProductCard;