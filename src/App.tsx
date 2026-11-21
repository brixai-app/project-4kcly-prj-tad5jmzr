import React, { useEffect, useMemo, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { CartProvider } from './context/CartContext';
import { Home } from './pages/Home';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { DashboardPage } from './pages/DashboardPage';
import { cn } from '@/lib/utils';

function AppShell() {
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const state = location.state as { openCart?: boolean; openAuth?: boolean; authMode?: 'signin' | 'signup' } | null;
    if (state?.openCart) setCartOpen(true);
    if (state?.openAuth) {
      setAuthMode(state?.authMode ?? 'signin');
      setAuthOpen(true);
    }
  }, [location.state]);

  const shellClassName = useMemo(
    () => cn('min-h-screen bg-[#F5F1EB] text-[#2B2B2B] antialiased'),
    []
  );

  return (
    <div className={shellClassName}>
      <Header />
      <main className="min-h-[calc(100vh-8rem)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cart" element={<Navigate to="/" replace state={{ openCart: true }} />} />
          <Route path="/auth" element={<Navigate to="/" replace state={{ openAuth: true, authMode: 'signin' }} />} />
          <Route path="/login" element={<Navigate to="/" replace state={{ openAuth: true, authMode: 'signin' }} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
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