import React, { useEffect, useState } from 'react';
import { HomeSections } from '@/components/StorefrontSections';
import type { Product, ProductsResponse } from '@/types';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/products');
        const json = (await res.json()) as ProductsResponse;
        if (active) setProducts(Array.isArray(json?.data) ? json.data : []);
      } catch {
        if (active) setProducts([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);
  return <HomeSections products={products} />;
}

export default Home;