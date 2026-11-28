import React, { useEffect, useMemo, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const state = location.state as { openCart?: boolean; openAuth?: boolean; from?: string } | null;
    if (state?.openCart) setCartOpen(true);
    if (state?.openAuth) setAuthOpen(true);
    if (state?.openCart || state?.openAuth) navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  const shellClass = useMemo(
    () => cn('min-h-screen bg-[#F5F1EB] text-[#1C1C1C] antialiased'),
    []
  );

  return (
    <div className={shellClass}>
      <Header className="sticky top-0 z-40" />
      <main className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CheckoutPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Toaster position="top-right" richColors closeButton />
      {authOpen ? null : null}
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