import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, User, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import AuthModal from '@/components/AuthModal';
import { signOut, useSession } from 'better-auth/react';

export interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const location = useLocation();
  const { items } = useCart() as { items?: Array<{ quantity?: number }> };
  const { data: session } = useSession() as { data?: { user?: { name?: string; email?: string } } };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const cartCount = useMemo(() => (items ?? []).reduce((sum, item) => sum + (item?.quantity ?? 0), 0), [items]);
  const nav = [
    { to: '/shop', label: 'Shop' },
    { to: '/shop?category=outerwear', label: 'Outerwear' },
    { to: '/shop?category=tailoring', label: 'Tailoring' },
    { to: '/shop?category=accessories', label: 'Accessories' },
  ];

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to.split('?')[0] ?? '');

  return (
    <header className={cn('sticky top-0 z-50 border-b border-[#C9BDB2] bg-[#F9F7F6]/95 backdrop-blur-sm', className)}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] text-[#2B2B2B] transition hover:bg-[#EFEAE5] lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="min-w-0 flex-1 lg:flex-none">
          <div className="flex items-baseline gap-2">
            <span className="font-['Playfair_Display',serif] text-2xl tracking-tight text-[#2B2B2B]">NDDN</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.35em] text-[#6E655F] sm:inline">Store</span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6E655F] transition hover:text-[#2B2B2B]',
                isActive(item.to) && 'text-[#B11226]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] text-[#2B2B2B] transition hover:bg-[#EFEAE5]"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="hidden h-10 items-center gap-2 border border-[#C9BDB2] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B] transition hover:bg-[#EFEAE5] sm:inline-flex"
          >
            <User className="h-4 w-4" />
            {session?.user?.name ?? 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] text-[#2B2B2B] transition hover:bg-[#EFEAE5] sm:hidden"
            aria-label="Sign in"
          >
            <User className="h-4 w-4" />
          </button>

          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center border border-[#C9BDB2] text-[#2B2B2B] transition hover:bg-[#EFEAE5]"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center border border-[#B11226] bg-[#B11226] px-1 text-[10px] font-semibold leading-none text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-[#C9BDB2] bg-[#EFEAE5]">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Search className="h-4 w-4 shrink-0 text-[#6E655F]" />
            <input
              type="search"
              placeholder="Search collections, silhouettes, materials"
              className="w-full bg-transparent text-sm text-[#2B2B2B] outline-none placeholder:text-[#6E655F]"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B11226]"
            >
              Close <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="border-t border-[#C9BDB2] bg-[#F9F7F6] lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between border-b border-[#C9BDB2] py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B]"
              >
                <span className="min-w-0 truncate">{item.label}</span>
                <ArrowRight className="h-4 w-4 text-[#6E655F]" />
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="flex items-center justify-between border-b border-[#C9BDB2] py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B]"
            >
              <span className="min-w-0 truncate">{session?.user?.name ?? 'Sign in'}</span>
              <ChevronDown className="h-4 w-4 text-[#6E655F]" />
            </button>
          </div>
        </div>
      ) : null}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode="sign-in" />
    </header>
  );
}

export default Header;