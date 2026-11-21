import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import ProductDetailModal from '@/components/ProductDetailModal';

const Home = lazy(() => import('@/pages/Home'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const StoreFlowPages = lazy(() => import('@/pages/StoreFlowPages'));

export function App() {
  return (
    <HashRouter>
      <CartProvider>
        <div className="min-h-screen bg-[#F9F7F6] text-[#2B2B2B] antialiased">
          <Header />
          <Suspense fallback={<div className="px-4 py-16 text-center text-sm uppercase tracking-[0.2em] text-[#6E655F]">Loading</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<StoreFlowPages />} />
              <Route path="/checkout" element={<StoreFlowPages />} />
              <Route path="/dashboard" element={<StoreFlowPages />} />
              <Route path="/login" element={<StoreFlowPages />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Footer />
          <CartDrawer />
          <AuthModal />
          <ProductDetailModal />
          <Toaster position="top-right" richColors closeButton />
        </div>
      </CartProvider>
    </HashRouter>
  );
}

export default App;