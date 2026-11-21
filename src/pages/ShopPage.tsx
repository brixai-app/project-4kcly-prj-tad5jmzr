import React from 'react';
import { useLocation } from 'react-router-dom';
import CatalogWorkspace from '@/components/CatalogWorkspace';

export function ShopPage() {
  const location = useLocation();
  const params = new URLSearchParams(location?.search ?? '');
  const initialQuery = params.get('q') ?? params.get('query') ?? '';
  const initialCategory = params.get('category') ?? params.get('cat') ?? '';

  return (
    <main className="min-h-screen bg-[#F5F1EB] text-[#2E2B28]">
      <CatalogWorkspace className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8" />
      <div className="sr-only" aria-hidden="true">
        {initialQuery}
        {initialCategory}
      </div>
    </main>
  );
}

export default ShopPage;