import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, CheckCircle2, AlertCircle, ShoppingBag, User, RefreshCw } from 'lucide-react';
import { toast } from "sonner";
import type { Order, OrdersResponse, UserProfile } from "@/types";
import { cn } from "@/lib/utils";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: "customer" | "admin";
};

declare const authClient: {
  useSession?: () => { data?: { user?: SessionUser | null } | null; isPending?: boolean };
  signIn?: (payload?: unknown) => Promise<unknown>;
};

export function DashboardPage() {
  const session = authClient?.useSession?.();
  const user = session?.data?.user ?? null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user?.id && !user?.email) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/orders", { credentials: "include" });
        const json = (await res.json()) as OrdersResponse;
        if (!res.ok) throw new Error(json?.error ?? "Unable to load orders.");
        if (!active) return;
        setOrders(Array.isArray(json?.data) ? json.data : []);
        setProfile({
          id: user?.id ?? "me",
          name: user?.name ?? null,
          email: user?.email ?? "",
          avatarUrl: user?.avatarUrl ?? null,
          role: user?.role ?? "customer",
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load dashboard.";
        if (!active) return;
        setError(message);
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [user?.email, user?.id, user?.name, user?.avatarUrl, user?.role]);

  const stats = useMemo(() => {
    const total = orders?.length ?? 0;
    const pending = orders?.filter((order) => order?.status === "pending")?.length ?? 0;
    const paid = orders?.filter((order) => order?.status === "paid")?.length ?? 0;
    const fulfilled = orders?.filter((order) => order?.status === "fulfilled")?.length ?? 0;
    return { total, pending, paid, fulfilled };
  }, [orders]);

  if (!user?.email) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full border border-[#CFC5B8] bg-[#FFFCF8] p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6F685F]">Private Access</p>
          <h1 className="mt-4 font-['Bodoni_Moda'] text-4xl font-light tracking-tight text-[#211F1D] md:text-6xl">
            Sign in to view your dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6F685F]">
            Access your order history, profile details, and account activity from one quiet, secure space.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#650000]"
            >
              Explore Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-[#CFC5B8] bg-transparent px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#211F1D] transition-colors hover:bg-[#F5F1EC]"
            >
              Return Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border border-[#CFC5B8] bg-[#FFFCF8] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center border border-[#CFC5B8] bg-[#F5F1EC]">
              <User className="h-6 w-6 text-[#211F1D]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6F685F]">Account</p>
              <h1 className="mt-2 truncate font-['Bodoni_Moda'] text-3xl font-light tracking-tight text-[#211F1D]">
                {profile?.name ?? user?.name ?? "NDDN Client"}
              </h1>
              <p className="mt-1 break-words text-sm text-[#6F685F]">{profile?.email ?? user?.email ?? ""}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <StatRow label="Orders" value={stats.total} />
            <StatRow label="Pending" value={stats.pending} />
            <StatRow label="Paid" value={stats.paid} />
            <StatRow label="Fulfilled" value={stats.fulfilled} />
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/shop"
              className="inline-flex items-center justify-between border border-[#CFC5B8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#211F1D] transition-colors hover:bg-[#F5F1EC]"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-between border border-[#CFC5B8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#211F1D] transition-colors hover:bg-[#F5F1EC]"
            >
              Refresh
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="border border-[#CFC5B8] bg-[#FFFCF8] p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6F685F]">Order History</p>
                <h2 className="mt-2 font-['Bodoni_Moda'] text-3xl font-light tracking-tight text-[#211F1D]">
                  Live purchases and fulfillment status
                </h2>
              </div>
              <ShoppingBag className="h-6 w-6 text-[#8B0000]" />
            </div>

            {loading ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : error ? (
              <div className="mt-8 flex items-start gap-3 border border-[#CFC5B8] bg-[#F5F1EC] p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#8B0000]" />
                <div>
                  <p className="text-sm font-semibold text-[#211F1D]">Unable to load orders</p>
                  <p className="mt-1 text-sm text-[#6F685F]">{error}</p>
                </div>
              </div>
            ) : orders?.length ? (
              <div className="mt-8 space-y-4">
                {orders.map((order) => (
                  <article key={order?.id} className="border border-[#CFC5B8] p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#211F1D]">
                            Order {order?.id?.slice?.(0, 8) ?? "—"}
                          </p>
                          <StatusPill status={order?.status ?? "pending"} />
                        </div>
                        <p className="mt-2 flex items-center gap-2 text-sm text-[#6F685F]">
                          <Clock className="h-4 w-4" />
                          {new Date(order?.createdAt ?? Date.now()).toLocaleDateString()}
                        </p>
                        <p className="mt-1 text-sm text-[#6F685F]">
                          {order?.items?.length ?? 0} item{(order?.items?.length ?? 0) === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6F685F]">Total</p>
                        <p className="mt-1 font-['Bodoni_Moda'] text-2xl font-light text-[#211F1D]">
                          ₹{Number(order?.total ?? 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 border border-dashed border-[#CFC5B8] p-8 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-[#8B0000]" />
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#211F1D]">
                  No orders yet
                </p>
                <p className="mt-2 text-sm text-[#6F685F]">Your order history will appear here after checkout.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatRow({ label = "", value = 0 }: { label?: string; value?: number }) {
  return (
    <div className="flex items-center justify-between border border-[#CFC5B8] px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6F685F]">{label}</span>
      <span className="font-['Bodoni_Moda'] text-2xl font-light text-[#211F1D]">{value}</span>
    </div>
  );
}

function StatusPill({ status = "pending" }: { status?: Order["status"] }) {
  const tone =
    status === "fulfilled"
      ? "border-[#8B0000] bg-[#8B0000] text-white"
      : status === "paid"
        ? "border-[#211F1D] bg-[#211F1D] text-white"
        : status === "cancelled"
          ? "border-[#CFC5B8] bg-[#F5F1EC] text-[#211F1D]"
          : "border-[#CFC5B8] bg-transparent text-[#211F1D]";
  return (
    <span className={cn("inline-flex items-center border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]", tone)}>
      {status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse border border-[#CFC5B8] p-4">
      <div className="h-4 w-28 bg-[#F5F1EC]" />
      <div className="mt-4 h-8 w-40 bg-[#F5F1EC]" />
      <div className="mt-3 h-4 w-24 bg-[#F5F1EC]" />
    </div>
  );
}

export default DashboardPage;