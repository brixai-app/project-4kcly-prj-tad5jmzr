import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { AuthModal } from '@/components/AuthModal';
import { CartDrawer } from '@/components/CartDrawer';

type SessionUser = { name?: string; email?: string; image?: string } | null;
type SessionState = { user?: SessionUser } | null;

const navItems = [
  { label: 'New In', to: '/shop?sort=newest' },
  { label: 'Dresses', to: '/shop?category=dresses' },
  { label: 'Tailoring', to: '/shop?category=tailoring' },
  { label: 'Accessories', to: '/shop?category=accessories' },
];

export function Header({ className = '' }: { className?: string } = {}) {
  const location = useLocation();
  const { items } = useCart() as { items?: Array<{ quantity?: number }> };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [session, setSession] = useState<SessionState>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        const data = (await res.json().catch(() => null)) as SessionState;
        if (active) setSession(data ?? null);
      } catch {
        if (active) setSession(null);
      }
    };
    loadSession();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const itemCount = useMemo(
    () => (items ?? []).reduce((sum, item) => sum + (item?.quantity ?? 0), 0),
    [items]
  );

  const userName = session?.user?.name ?? session?.user?.email ?? 'Guest';
  const isAuthed = Boolean(session?.user);

  return (
    <header className={cn('sticky top-0 z-50 border-b border-[#C9BFB1] bg-[#F5F1EB]/90 backdrop-blur-md', className)}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BFB1] bg-[#FFFCF7] text-[#2E2B28] transition hover:bg-[#F5F1EB] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="min-w-0 shrink-0">
          <span className="block font-['Playfair_Display'] text-2xl font-semibold tracking-[0.22em] text-[#2E2B28]">
            NDDN
          </span>
          <span className="block text-[10px] uppercase tracking-[0.4em] text-[#71695F]">Store</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'text-xs font-semibold uppercase tracking-[0.28em] text-[#71695F] transition hover:text-[#2E2B28]',
                  isActive && 'text-[#8B0000]'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form
          action="/shop"
          method="get"
          className="hidden min-w-0 flex-1 max-w-sm items-center gap-2 border border-[#C9BFB1] bg-[#FFFCF7] px-3 py-2 lg:flex"
        >
          <Search className="h-4 w-4 shrink-0 text-[#71695F]" />
          <input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search collection"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#2E2B28] outline-none placeholder:text-[#71695F]"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="hidden items-center gap-2 border border-[#C9BFB1] bg-[#FFFCF7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#2E2B28] transition hover:bg-[#F5F1EB] sm:inline-flex"
          >
            <User className="h-4 w-4" />
            {isAuthed ? userName : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex h-10 items-center gap-2 border border-[#C9BFB1] bg-[#8B0000] px-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-[#650000]"
            aria-label={`Open cart with ${itemCount} items`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            {itemCount > 0 && (
              <span className="ml-1 inline-flex min-w-5 items-center justify-center border border-white/30 px-1.5 text-[10px] leading-5">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="border-t border-[#C9BFB1] bg-[#FFFCF7] px-4 py-2 sm:px-6 lg:hidden">
        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="inline-flex items-center gap-1 border border-[#C9BFB1] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2E2B28] transition hover:bg-[#F5F1EB]"
            >
              {item.label}
              <ChevronDown className="h-3.5 w-3.5" />
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex items-center gap-2 border border-[#C9BFB1] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2E2B28]"
          >
            <User className="h-3.5 w-3.5" />
            {isAuthed ? 'Account' : 'Sign In'}
          </button>
        </div>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-[60] bg-black/40" />
          <DialogContent className="fixed inset-y-0 left-0 z-[61] w-[88vw] max-w-sm border-r border-[#C9BFB1] bg-[#FFFCF7] p-5 outline-none">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-['Playfair_Display'] text-2xl text-[#2E2B28]">NDDN</DialogTitle>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BFB1] text-[#2E2B28]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="border border-[#C9BFB1] px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#2E2B28]"
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setAuthOpen(true);
                }}
                className="border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white"
              >
                {isAuthed ? 'Account' : 'Sign In'}
              </button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}

export default Header;