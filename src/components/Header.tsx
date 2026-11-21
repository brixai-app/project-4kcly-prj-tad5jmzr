import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingBag, User, X, ChevronDown } from 'lucide-react';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import AuthModal from "@/components/AuthModal";

type SessionLike = {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
} | null;

const navItems = [
  { label: "New In", to: "/shop?sort=newest" },
  { label: "Shop", to: "/shop" },
  { label: "Collections", to: "/shop?collection=featured" },
  { label: "Journal", to: "/shop?category=editorial" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items = [] } = useCart() as { items?: Array<{ quantity?: number }> };
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const session = null as SessionLike;
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (item?.quantity ?? 0), 0),
    [items]
  );

  const isActive = (to: string) => {
    const path = to.split("?")?.[0] ?? to;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#CFC5B8] bg-[#F5F1EC]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC5B8] text-[#211F1D] transition hover:bg-[#FFFCF8] lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="min-w-0 flex-1 lg:flex-none">
          <div className="flex items-baseline gap-2">
            <span className="font-['Bodoni_Moda'] text-2xl font-light tracking-[0.18em] text-[#211F1D]">
              NDDN
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.35em] text-[#6F685F] sm:inline">
              Store
            </span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6F685F] transition hover:text-[#211F1D]",
                isActive(item.to) && "text-[#211F1D]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="hidden h-10 items-center gap-2 border border-[#CFC5B8] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211F1D] transition hover:bg-[#FFFCF8] sm:inline-flex"
          >
            <Search className="h-4 w-4" />
            Search
          </button>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="relative inline-flex h-10 w-10 items-center justify-center border border-[#CFC5B8] text-[#211F1D] transition hover:bg-[#FFFCF8]"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center border border-[#8B0000] bg-[#8B0000] px-1 text-[10px] font-semibold leading-none text-white">
                {itemCount}
              </span>
            ) : null}
          </button>

          {session?.user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="hidden h-10 items-center gap-2 border border-[#CFC5B8] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211F1D] transition hover:bg-[#FFFCF8] sm:inline-flex"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{session.user?.name ?? session.user?.email ?? "Account"}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={10}
                  className="z-50 min-w-48 border border-[#CFC5B8] bg-[#FFFCF8] p-2 shadow-[0_12px_40px_rgba(33,31,29,0.08)]"
                >
                  <DropdownMenu.Item
                    className="cursor-pointer px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211F1D] outline-none hover:bg-[#F5F1EC]"
                    onSelect={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="cursor-pointer px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211F1D] outline-none hover:bg-[#F5F1EC]"
                    onSelect={() => navigate("/checkout")}
                  >
                    Checkout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="hidden h-10 items-center gap-2 border border-[#CFC5B8] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211F1D] transition hover:bg-[#FFFCF8] sm:inline-flex"
            >
              <User className="h-4 w-4" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#CFC5B8] bg-[#FFFCF8] lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "min-w-0 border border-[#CFC5B8] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211F1D] transition hover:bg-[#F5F1EC]",
                  isActive(item.to) && "bg-[#F5F1EC]"
                )}
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
              className="border border-[#CFC5B8] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211F1D] transition hover:bg-[#F5F1EC]"
            >
              Sign In
            </button>
          </div>
        </div>
      ) : null}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}

export default Header;