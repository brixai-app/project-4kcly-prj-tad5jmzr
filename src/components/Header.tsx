import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Search, ShoppingBag, User, X, Circle as LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';

type SessionUser = { name?: string | null; email?: string | null } | null;

const navItems = [
  { label: 'Shop', to: '/shop' },
  { label: 'Tailoring', to: '/shop?category=tailoring' },
  { label: 'Outerwear', to: '/shop?category=outerwear' },
  { label: 'Accessories', to: '/shop?category=accessories' },
];

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart() as { items?: Array<{ quantity?: number }> };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser>(null);
  const [search, setSearch] = useState('');

  const itemCount = useMemo(
    () => (items ?? []).reduce((sum, item) => sum + (item?.quantity ?? 0), 0),
    [items],
  );

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (!res.ok) {
          setSessionUser(null);
          return;
        }
        const data = (await res.json()) as { user?: SessionUser };
        setSessionUser(data?.user ?? null);
      } catch {
        setSessionUser(null);
      }
    };
    loadSession();
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/shop?query=${encodeURIComponent(q)}` : '/shop');
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' });
      setSessionUser(null);
      navigate('/');
    } catch {
      setSessionUser(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#CFC6BA] bg-[#F5F1EB]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC6BA] bg-[#FFFDF9] text-[#2B2B2B] transition hover:border-[#8B0000] hover:text-[#8B0000] lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="min-w-0 flex-1 lg:flex-none">
          <div className="flex items-baseline gap-2">
            <span className="font-['Playfair_Display'] text-2xl font-semibold tracking-tight text-[#2B2B2B]">
              NDDN
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.35em] text-[#716A63] sm:inline">
              Store
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.28em] text-[#716A63] transition hover:text-[#8B0000]',
                location.pathname + location.search === item.to ? 'text-[#8B0000]' : '',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="ml-auto hidden max-w-[280px] flex-1 items-center lg:flex">
          <div className="flex w-full items-center gap-2 border border-[#CFC6BA] bg-[#FFFDF9] px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-[#716A63]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search collection"
              className="w-full bg-transparent text-sm text-[#2B2B2B] outline-none placeholder:text-[#716A63]"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="hidden items-center gap-2 border border-[#CFC6BA] bg-[#FFFDF9] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B] transition hover:border-[#8B0000] hover:text-[#8B0000] sm:inline-flex"
          >
            <User className="h-4 w-4" />
            <span className="max-w-[120px] truncate">
              {sessionUser?.name ?? sessionUser?.email ?? 'Sign In'}
            </span>
          </button>

          {sessionUser ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden items-center gap-2 border border-[#CFC6BA] bg-[#FFFDF9] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B] transition hover:border-[#8B0000] hover:text-[#8B0000] sm:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex h-10 items-center gap-2 border border-[#CFC6BA] bg-[#FFFDF9] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B] transition hover:border-[#8B0000] hover:text-[#8B0000]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="ml-1 inline-flex min-w-5 items-center justify-center border border-[#8B0000] bg-[#8B0000] px-1.5 text-[10px] leading-5 text-white">
              {itemCount}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="border-t border-[#CFC6BA] bg-[#FFFDF9] lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
            <form onSubmit={handleSearch} className="flex items-center gap-2 border border-[#CFC6BA] px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-[#716A63]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collection"
                className="w-full bg-transparent text-sm text-[#2B2B2B] outline-none placeholder:text-[#716A63]"
              />
            </form>
            <div className="flex flex-col gap-2.5">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between border border-[#CFC6BA] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B]"
                >
                  <span className="min-w-0 truncate">{item.label}</span>
                  <ChevronDown className="h-4 w-4 rotate-[-90deg] text-[#716A63]" />
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setAuthOpen(true);
                  setMobileOpen(false);
                }}
                className="inline-flex items-center justify-center gap-2 border border-[#CFC6BA] bg-[#FFFDF9] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B]"
              >
                <User className="h-4 w-4" />
                {sessionUser?.name ?? 'Sign In'}
              </button>
              {sessionUser ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-2 border border-[#CFC6BA] bg-[#FFFDF9] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode="signin" />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}

export default Header;