import React, { useMemo, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { Home } from '@/pages/Home';
import { ShopPage } from '@/pages/ShopPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { cn } from '@/lib/utils';

function AppShell() {
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const isCheckout = useMemo(() => location.pathname?.includes('/checkout') ?? false, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F5F1EC] text-[#211F1D] antialiased">
      <Header />
      <main className={cn('min-h-[calc(100vh-8rem)]', isCheckout ? 'bg-[#FFFCF8]' : '')}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cart" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </HashRouter>
  );
}

export default App;