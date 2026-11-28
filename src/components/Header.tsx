import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X, User, ChevronDown, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { AuthModal } from '@/components/AuthModal';
import { CartDrawer } from '@/components/CartDrawer';
import { authClient } from '@/lib/auth-client';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items = [] } = useCart() ?? {};
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      try {
        const result = await authClient?.getSession?.();
        if (mounted) setSession(result?.data?.session ?? result?.session ?? null);
      } catch {
        if (mounted) setSession(null);
      }
    };
    loadSession();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const itemCount = useMemo(
    () => items.reduce((sum: number, item: any) => sum + (item?.quantity ?? 0), 0),
    [items]
  );

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Cart', to: '/cart' },
    { label: 'Checkout', to: '/checkout' },
    { label: 'Dashboard', to: '/dashboard' },
  ];

  const handleSearch = () => {
    const value = query.trim();
    navigate(value ? `/shop?search=${encodeURIComponent(value)}` : '/shop');
  };

  const userName = session?.user?.name ?? session?.user?.email ?? 'Guest';

  return (
    <header className="sticky top-0 z-50 border-b border-[#C9BDB2] bg-[#F9F7F6]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2 text-[#2E2E2E]">
          <Store className="h-5 w-5 shrink-0 text-[#8B0000]" />
          <span className="min-w-0 truncate font-['Playfair_Display'] text-lg tracking-tight">NDDN Store</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.22em] text-[#6E655E] transition-colors hover:text-[#8B0000]',
                location.pathname === link.to && 'text-[#8B0000]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
          <div className="flex min-w-0 max-w-xs items-center border border-[#C9BDB2] bg-white px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-[#6E655E]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search collection"
              className="w-full min-w-0 bg-transparent text-sm text-[#2E2E2E] outline-none placeholder:text-[#6E655E]"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000]"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex items-center gap-2 border border-[#C9BDB2] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#2E2E2E] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"
          >
            <User className="h-4 w-4" />
            <span className="max-w-[10rem] truncate">{session?.user ? `Hi, ${userName}` : 'Sign In'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 border border-[#C9BDB2] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#2E2E2E] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Bag</span>
            {itemCount > 0 && (
              <span className="ml-1 inline-flex min-w-5 items-center justify-center bg-[#8B0000] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] bg-white text-[#2E2E2E]"
            aria-label="Sign in"
          >
            <User className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] bg-white text-[#2E2E2E]"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {itemCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 bg-[#8B0000]" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] bg-white text-[#2E2E2E]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-[#C9BDB2] bg-[#F9F7F6] md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2 border border-[#C9BDB2] bg-white px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-[#6E655E]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search collection"
                  className="w-full min-w-0 bg-transparent text-sm text-[#2E2E2E] outline-none placeholder:text-[#6E655E]"
                />
              </div>
              <div className="flex flex-col gap-2.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center justify-between border border-[#C9BDB2] bg-white px-3 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#2E2E2E]"
                  >
                    <span className="min-w-0 truncate">{link.label}</span>
                    <ChevronDown className="h-4 w-4 -rotate-90 text-[#6E655E]" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}

export default Header;