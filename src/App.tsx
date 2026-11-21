import React, { useEffect, useMemo, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { CartProvider } from '@/context/CartContext';
import Home from '@/pages/Home';
import ShopPage from '@/pages/ShopPage';
import { ProductDetailExperience } from '@/components/ProductDetailModal';
import { CheckoutPage, UserDashboard } from '@/components/CommerceAccountSections';
import type { Product } from '@/types';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products', { credentials: 'include' });
        const json = (await res.json().catch(() => null)) as { data?: Product[] } | null;
        if (active) setProducts(Array.isArray(json?.data) ? json?.data ?? [] : []);
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((product) => {
      if (product?.id) map.set(product.id, product);
    });
    return map;
  }, [products]);

  useEffect(() => {
    const onOpenCart = () => setCartOpen(true);
    const onOpenAuth = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: 'sign-in' | 'sign-up' }>).detail;
      setAuthMode(detail?.mode ?? 'sign-in');
      setAuthOpen(true);
    };
    const onOpenProduct = (event: Event) => {
      const detail = (event as CustomEvent<{ productId?: string; product?: Product | null }>).detail;
      setSelectedProductId(detail?.productId ?? '');
      setSelectedProduct(detail?.product ?? null);
    };
    window.addEventListener('nddn:open-cart', onOpenCart);
    window.addEventListener('nddn:open-auth', onOpenAuth);
    window.addEventListener('nddn:open-product', onOpenProduct);
    return () => {
      window.removeEventListener('nddn:open-cart', onOpenCart);
      window.removeEventListener('nddn:open-auth', onOpenAuth);
      window.removeEventListener('nddn:open-product', onOpenProduct);
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct && selectedProductId) setSelectedProduct(productById.get(selectedProductId) ?? null);
  }, [productById, selectedProduct, selectedProductId]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F5F1EB] text-[#2E2B28]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products" element={<Navigate to="/shop" replace />} />
          <Route path="/products/:slug" element={<ShopPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<UserDashboard />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
      <ProductDetailExperience
        productId={selectedProductId}
        product={selectedProduct}
        open={Boolean(selectedProductId || selectedProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null);
            setSelectedProductId('');
          }
        }}
      />
      <Toaster position="top-right" richColors closeButton />
      {loading ? <div className="sr-only" aria-live="polite">Loading products</div> : null}
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <CartProvider>
        <ScrollToTop />
        <AppRoutes />
      </CartProvider>
    </HashRouter>
  );
}

export default App;