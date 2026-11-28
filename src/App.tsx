import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import ShopPage from '@/pages/ShopPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import DashboardPage from '@/pages/DashboardPage';
import ProductDetailModal from '@/components/ProductDetailModal';
import AuthModal from '@/components/AuthModal';

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<AuthModal open defaultMode="signin" onOpenChange={() => {}} />} />
          <Route path="/product/:slug" element={<ProductDetailModal open onOpenChange={() => {}} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <HashRouter>
      <CartProvider>
        <div className="min-h-screen bg-[#F9F7F6] text-[#2E2E2E] antialiased">
          <Header />
          <main className="pt-16">
            <AppRoutes />
          </main>
          <Footer />
          <Toaster position="top-right" richColors closeButton />
        </div>
      </CartProvider>
    </HashRouter>
  );
}

export default App;