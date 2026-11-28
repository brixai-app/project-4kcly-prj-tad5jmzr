import React, { useMemo, useState } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { AuthModal } from "./components/AuthModal";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import DashboardPage from "./pages/DashboardPage";
import { ShoppingCart, User } from 'lucide-react';

function AppShell() {
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const defaultTab = useMemo(() => (location.pathname?.includes("login") ? "signin" : "signin"), [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F9F7F6] text-[#211E1D]">
      <Header className="sticky top-0 z-40" />
      <main className="min-h-[calc(100vh-8rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/products" element={<ShopPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<Navigate to="/shop" replace />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={defaultTab} />
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="inline-flex items-center gap-2 border border-[#CFC4BA] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#211E1D] shadow-sm transition hover:border-[#8B0000] hover:text-[#8B0000]"
        >
          <User className="h-4 w-4" />
          Account
        </button>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-[#680000]"
        >
          <ShoppingCart className="h-4 w-4" />
          Cart
        </button>
      </div>
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <CartProvider>
        <AppShell />
        <Toaster richColors position="top-right" />
      </CartProvider>
    </HashRouter>
  );
}

export default App;