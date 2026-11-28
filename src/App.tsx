import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { Home } from '@/pages/Home';
import { ShopPage } from '@/pages/ShopPage';

const CommercePages = lazy(() => import('@/pages/CommercePages'));

function RouteShell({ children = null }: { children?: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="min-h-[calc(100vh-0px)]"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <HashRouter>
      <CartProvider>
        <div className="min-h-screen bg-[#F9F7F6] text-[#2E2E2E] antialiased">
          <Header />
          <Suspense fallback={<div className="px-4 py-16 text-sm text-[#6F665F]">Loading…</div>}>
            <RouteShell>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/login" element={<div className="px-4 py-16"><AuthModal open defaultMode="signin" /></div>} />
                <Route path="/cart" element={<CommercePages />} />
                <Route path="/checkout" element={<CommercePages />} />
                <Route path="/dashboard" element={<CommercePages />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </RouteShell>
          </Suspense>
          <Footer />
          <CartDrawer />
          <Toaster position="top-right" richColors closeButton toastOptions={{ style: { background: '#F1ECE7', color: '#2E2E2E', border: '1px solid #C9BEB4', borderRadius: '2px' } }} />
        </div>
      </CartProvider>
    </HashRouter>
  );
}

export default App;