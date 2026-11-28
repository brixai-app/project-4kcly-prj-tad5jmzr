import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, Phone, RefreshCw, User } from 'lucide-react';
import { toast } from "sonner";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";

type SessionUser = { id?: string; name?: string | null; email?: string | null } | null;

declare const useSession: (() => { data?: { user?: SessionUser } | null; status?: string }) | undefined;

export function DashboardPage() {
  const navigate = useNavigate();
  const session = typeof useSession === "function" ? useSession() : { data: null, status: "unauthenticated" };
  const user = session?.data?.user ?? null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.status === "unauthenticated" && !user) {
      navigate("/login", { replace: true });
    }
  }, [navigate, session?.status, user]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const res = await fetch("/api/orders", { credentials: "include" });
        const json = (await res.json().catch(() => null)) as { data?: Order[]; message?: string } | null;
        if (!res.ok) throw new Error(json?.message ?? "Unable to load orders");
        const list = (json?.data ?? []).filter((order) => order?.email === user.email);
        setOrders(list);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load orders");
      } finally {
        setLoading(false);
      }
    };
    void loadOrders();
  }, [user?.email]);

  const stats = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + (order?.total ?? 0), 0);
    const paid = orders.filter((order) => order?.status === "paid" || order?.status === "fulfilled").length;
    return { total, paid, count: orders.length };
  }, [orders]);

  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
        <div className="border border-[#CFC4BA] bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#665F5B]">Account</p>
              <h1 className="mt-2 font-['Bodoni_Moda'] text-4xl font-light tracking-tight text-[#211E1D]">
                {user?.name ?? "Guest"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#665F5B]">
                Manage your profile and review your order history in one quiet, editorial workspace.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center border border-[#CFC4BA] bg-[#F9F7F6] text-[#8B0000]">
              <User className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Orders", value: stats.count },
              { label: "Paid", value: stats.paid },
              { label: "Spent", value: `₹${stats.total.toLocaleString("en-IN")}` },
            ].map((item) => (
              <div key={item.label} className="border border-[#CFC4BA] bg-[#F9F7F6] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#665F5B]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-[#211E1D]">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-[#CFC4BA] pt-6">
            {[
              { icon: Mail, label: "Email", value: user?.email ?? "—" },
              { icon: Phone, label: "Phone", value: "Add a contact number in your profile" },
              { icon: MapPin, label: "Location", value: "Shipping details are stored with each order" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#8B0000]" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#665F5B]">{item.label}</p>
                  <p className="mt-1 break-words text-sm text-[#211E1D]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#CFC4BA] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#665F5B]">Order timeline</p>
              <h2 className="mt-2 font-['Bodoni_Moda'] text-3xl font-light tracking-tight text-[#211E1D]">
                Recent purchases
              </h2>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 border border-[#CFC4BA] px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#211E1D] transition-colors hover:border-[#8B0000] hover:text-[#8B0000]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="border border-[#CFC4BA] bg-[#F9F7F6] p-5 text-sm text-[#665F5B]">Loading orders…</div>
            ) : orders.length === 0 ? (
              <div className="border border-[#CFC4BA] bg-[#F9F7F6] p-5">
                <p className="text-sm text-[#665F5B]">No orders yet. Your first purchase will appear here.</p>
              </div>
            ) : (
              orders.map((order) => (
                <article key={order.id} className="border border-[#CFC4BA] bg-[#F9F7F6] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#665F5B]">Order {order.id}</p>
                      <p className="mt-1 text-sm text-[#211E1D]">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                        order.status === "fulfilled"
                          ? "border-[#8B0000] text-[#8B0000]"
                          : order.status === "paid"
                            ? "border-[#211E1D] text-[#211E1D]"
                            : order.status === "cancelled"
                              ? "border-[#665F5B] text-[#665F5B]"
                              : "border-[#CFC4BA] text-[#665F5B]",
                      )}
                    >
                      {order.status === "fulfilled" ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      {order.status}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {order.items?.map((item) => (
                      <div key={`${order.id}-${item.productId}-${item.name}`} className="flex items-center justify-between gap-4 border-t border-[#CFC4BA] pt-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#211E1D]">{item.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#665F5B]">
                            Qty {item.quantity}
                            {item.size ? ` · ${item.size}` : ""}
                            {item.color ? ` · ${item.color}` : ""}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-[#211E1D]">
                          ₹{((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#CFC4BA] pt-4 text-sm">
                    <span className="text-[#665F5B]">Total</span>
                    <span className="font-semibold text-[#211E1D]">₹{(order.total ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;