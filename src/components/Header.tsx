import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { Dialog } from '@radix-ui/react-dialog';
import { useSession } from 'better-auth/react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import AuthModal from '@/components/AuthModal';

export function Header({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session } = useSession();
  const { items = [] } = useCart?.() ?? {};
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [search, setSearch] = useState('');

  const bagCount = useMemo(
    () => items.reduce((sum: number, item: any) => sum + (item?.quantity ?? 0), 0),
    [items]
  );

  const navItems = [
    { label: 'New In', to: '/shop?category=new-in' },
    { label: 'Women', to: '/shop?category=women' },
    { label: 'Men', to: '/shop?category=men' },
    { label: 'Accessories', to: '/shop?category=accessories' },
  ];

  const submitSearch = (value: string) => {
    const q = value.trim();
    if (!q) return;
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  return (
    <header className={cn('sticky top-0 z-50 border-b border-[#CFC5B8] bg-[#F5F1EB]/90 backdrop-blur-md', className)}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC5B8] bg-[#FAF9F6] text-[#1C1C1C] transition-colors hover:bg-[#8B0000] hover:text-white lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="min-w-0 flex-1 lg:flex-none">
          <div className="flex items-baseline gap-2">
            <span className="font-['Playfair_Display'] text-2xl tracking-tight text-[#1C1C1C]">NDDN</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.35em] text-[#68625C] sm:inline">Store</span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1C1C1C] transition-colors hover:text-[#8B0000]',
                location.pathname + location.search === item.to ? 'text-[#8B0000]' : ''
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch(search);
          }}
          className="hidden min-w-0 flex-1 items-center justify-end lg:flex"
        >
          <div className="flex w-full max-w-sm items-center border border-[#CFC5B8] bg-[#FAF9F6] px-3">
            <Search className="h-4 w-4 shrink-0 text-[#68625C]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search collection"
              className="w-full bg-transparent px-2 py-2 text-sm text-[#1C1C1C] outline-none placeholder:text-[#68625C]"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="inline-flex h-10 items-center justify-center border border-[#CFC5B8] bg-[#FAF9F6] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1C1C1C] transition-colors hover:bg-[#1C1C1C] hover:text-white"
          >
            Shop
          </button>

          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="relative inline-flex h-10 w-10 items-center justify-center border border-[#CFC5B8] bg-[#FAF9F6] text-[#1C1C1C] transition-colors hover:bg-[#8B0000] hover:text-white"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {bagCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center border border-[#8B0000] bg-[#8B0000] px-1 text-[10px] font-semibold text-white">
                {bagCount}
              </span>
            ) : null}
          </button>

          {session?.user ? (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="hidden h-10 items-center gap-2 border border-[#CFC5B8] bg-[#FAF9F6] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1C1C1C] transition-colors hover:bg-[#1C1C1C] hover:text-white sm:inline-flex"
            >
              <User className="h-4 w-4" />
              <span className="max-w-[120px] truncate">{session?.user?.name ?? session?.user?.email ?? 'Account'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="hidden h-10 items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#650000] sm:inline-flex"
            >
              <User className="h-4 w-4" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#CFC5B8] bg-[#FAF9F6] lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(search);
              }}
              className="flex items-center border border-[#CFC5B8] bg-white px-3"
            >
              <Search className="h-4 w-4 shrink-0 text-[#68625C]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collection"
                className="w-full bg-transparent px-2 py-2 text-sm text-[#1C1C1C] outline-none placeholder:text-[#68625C]"
              />
            </form>
            <nav className="flex flex-col gap-2.5">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="min-w-0 border border-[#CFC5B8] bg-white px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1C1C1C] truncate transition-colors hover:bg-[#1C1C1C] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {!session?.user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setAuthOpen(true);
                }}
                className="inline-flex h-11 items-center justify-center border border-[#8B0000] bg-[#8B0000] px-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white"
              >
                Sign In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/dashboard');
                }}
                className="inline-flex h-11 items-center justify-center border border-[#CFC5B8] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1C1C1C]"
              >
                {session?.user?.name ?? session?.user?.email ?? 'Account'}
              </button>
            )}
          </div>
        </div>
      ) : null}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}

export default Header;