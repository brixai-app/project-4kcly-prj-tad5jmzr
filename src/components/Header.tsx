import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingBag, User, X, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import AuthModal from "@/components/AuthModal";

type SessionUser = {
  name?: string | null;
  email?: string | null;
};

type SessionState = {
  user?: SessionUser | null;
};

const navItems = [
  { label: "New In", to: "/shop?category=new-in" },
  { label: "Women", to: "/shop?category=women" },
  { label: "Men", to: "/shop?category=men" },
  { label: "Accessories", to: "/shop?category=accessories" },
];

export function Header({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart() as { items?: Array<{ quantity?: number }> };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState<SessionState | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as SessionState;
        if (active) setSession(data ?? null);
      } catch {
        if (active) setSession(null);
      }
    };
    loadSession();
    return () => {
      active = false;
    };
  }, []);

  const itemCount = useMemo(
    () => (items ?? []).reduce((sum, item) => sum + (item?.quantity ?? 0), 0),
    [items]
  );

  const isAuthed = Boolean(session?.user?.email);
  const userLabel = session?.user?.name ?? session?.user?.email ?? "Account";

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
      setSession(null);
      setAccountOpen(false);
      navigate("/");
    } catch {
      setAccountOpen(false);
    }
  };

  return (
    <header className={cn("sticky top-0 z-50 border-b border-[#CFC4BA] bg-[#F9F7F6]/95 backdrop-blur", className)}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC4BA] text-[#211E1D] transition hover:bg-[#EFE9E3] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="min-w-0 flex-1 md:flex-none">
          <div className="flex items-baseline gap-2">
            <span className="font-['Bodoni_Moda'] text-2xl leading-none tracking-tight text-[#211E1D]">
              NDDN
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.35em] text-[#665F5B] sm:inline">
              Store
            </span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.28em] text-[#665F5B] transition hover:text-[#211E1D]",
                location.pathname + location.search === item.to ? "text-[#8B0000]" : ""
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="hidden h-10 items-center gap-2 border border-[#CFC4BA] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211E1D] transition hover:bg-[#EFE9E3] sm:inline-flex"
          >
            <Search className="h-4 w-4" />
            Search
          </button>

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="relative inline-flex h-10 w-10 items-center justify-center border border-[#CFC4BA] text-[#211E1D] transition hover:bg-[#EFE9E3]"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center border border-[#8B0000] bg-[#8B0000] px-1 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            ) : null}
          </button>

          {isAuthed ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 border border-[#CFC4BA] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211E1D] transition hover:bg-[#EFE9E3]"
              >
                <User className="h-4 w-4" />
                <span className="hidden max-w-[120px] truncate sm:inline">{userLabel}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {accountOpen ? (
                <div className="absolute right-0 top-full mt-2 w-56 border border-[#CFC4BA] bg-[#F9F7F6] p-2 shadow-[0_18px_40px_rgba(33,30,29,0.08)]">
                  <Link
                    to="/dashboard"
                    onClick={() => setAccountOpen(false)}
                    className="block px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211E1D] transition hover:bg-[#EFE9E3]"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8B0000] transition hover:bg-[#EFE9E3]"
                  >
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="inline-flex h-10 items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-[#680000]"
            >
              <User className="h-4 w-4" />
              Sign In
            </button>
          )}
        </div>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="fixed inset-0 z-[60] bg-[#F9F7F6] p-0 outline-none">
          <DialogTitle className="sr-only">Navigation menu</DialogTitle>
          <div className="flex items-center justify-between border-b border-[#CFC4BA] px-4 py-4">
            <span className="font-['Bodoni_Moda'] text-2xl tracking-tight text-[#211E1D]">NDDN</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center border border-[#CFC4BA] text-[#211E1D]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="border border-[#CFC4BA] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211E1D]"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate("/shop");
              }}
              className="mt-2 inline-flex items-center justify-center gap-2 border border-[#CFC4BA] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#211E1D]"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
            {!isAuthed ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setAuthOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white"
              >
                <User className="h-4 w-4" />
                Sign In
              </button>
            ) : (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white"
              >
                <User className="h-4 w-4" />
                Account
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab="signin" />
    </header>
  );
}

export default Header;