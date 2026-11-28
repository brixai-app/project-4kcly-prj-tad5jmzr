import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@radix-ui/react-dialog';
import { useCart } from '@/context/CartContext';
import AuthModal from '@/components/AuthModal';
import { cn } from '@/lib/utils';
import type { SessionState } from '@/types';

type AuthClientLike = {
  getSession?: () => Promise<{ data?: SessionState | null } | SessionState | null>;
  signOut?: () => Promise<void>;
};

const navItems = [
  { label: 'New In', to: '/shop?category=featured' },
  { label: 'Outerwear', to: '/shop?category=Outerwear' },
  { label: 'Dresses', to: '/shop?category=Dresses' },
  { label: 'Tailoring', to: '/shop?category=Tailoring' },
  { label: 'Accessories', to: '/shop?category=Accessories' },
];

const authClient = (globalThis as typeof globalThis & { authClient?: AuthClientLike }).authClient;

export function Header({ className = '' }: { className?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { items = [] } = useCart() as { items?: Array<{ quantity?: number }> };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState<SessionState>({ user: null, isAuthenticated: false });
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (item?.quantity ?? 0), 0),
    [items]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get('q') ?? '');
  }, [location.search]);

  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      try {
        const result = await authClient?.getSession?.();
        const next = (result as { data?: SessionState | null } | SessionState | null)?.data ?? result ?? null;
        if (mounted) setSession(next ?? { user: null, isAuthenticated: false });
      } catch {
        if (mounted) setSession({ user: null, isAuthenticated: false });
      }
    };
    void loadSession();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(location.search);
    if (value.trim()) params.set('q', value.trim());
    else params.delete('q');
    navigate({ pathname: '/shop', search: params.toString() ? `?${params.toString()}` : '' });
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await authClient?.signOut?.();
      setSession({ user: null, isAuthenticated: false });
      navigate('/');
    } catch {
      setSession({ user: null, isAuthenticated: false });
    }
  };

  return (
    <header className={cn('sticky top-0 z-50 border-b border-[#C9BEB4] bg-[#F9F7F6]/95 backdrop-blur-sm', className)}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BEB4] text-[#2E2E2E] transition hover:bg-[#F1ECE7] lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="min-w-0">
            <div className="truncate font-['Playfair_Display'] text-xl tracking-tight text-[#2E2E2E] sm:text-2xl">
              NDDN Store
            </div>
            <div className="truncate text-[10px] uppercase tracking-[0.28em] text-[#6F665F]">
              Luxury fashion storefront
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2E2E2E] transition hover:text-[#8B0000]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="inline-flex h-10 items-center gap-2 border border-[#C9BEB4] px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2E2E2E] transition hover:bg-[#F1ECE7]"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="relative inline-flex h-10 items-center gap-2 border border-[#C9BEB4] px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2E2E2E] transition hover:bg-[#F1ECE7]"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            {itemCount > 0 ? (
              <span className="ml-1 inline-flex min-w-5 items-center justify-center bg-[#8B0000] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                {itemCount}
              </span>
            ) : null}
          </button>

          {session?.isAuthenticated ? (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex max-w-[160px] items-center gap-2 border border-[#C9BEB4] px-3 py-2">
                <User className="h-4 w-4 shrink-0 text-[#6F665F]" />
                <span className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2E2E2E]">
                  {session?.user?.name ?? session?.user?.email ?? 'Account'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="border border-[#8B0000] bg-[#8B0000] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#650000]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="hidden border border-[#8B0000] bg-[#8B0000] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#650000] sm:inline-flex"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {searchOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-[#C9BEB4] bg-[#F1ECE7]"
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <Search className="h-4 w-4 shrink-0 text-[#6F665F]" />
              <input
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search collections, silhouettes, or pieces"
                className="w-full bg-transparent text-sm text-[#2E2E2E] outline-none placeholder:text-[#6F665F]"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center border border-[#C9BEB4] text-[#2E2E2E] transition hover:bg-[#F9F7F6]"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[#C9BEB4] bg-[#F9F7F6] lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-4 py-4 sm:px-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between border border-[#C9BEB4] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2E2E2E]"
                >
                  <span className="min-w-0 truncate">{item.label}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#6F665F]" />
                </Link>
              ))}
              {session?.isAuthenticated ? (
                <div className="flex flex-col gap-2.5 pt-2">
                  <div className="flex items-center gap-2 border border-[#C9BEB4] px-3 py-3">
                    <User className="h-4 w-4 shrink-0 text-[#6F665F]" />
                    <span className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2E2E2E]">
                      {session?.user?.name ?? session?.user?.email ?? 'Account'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="border border-[#8B0000] bg-[#8B0000] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="border border-[#8B0000] bg-[#8B0000] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}

export default Header;