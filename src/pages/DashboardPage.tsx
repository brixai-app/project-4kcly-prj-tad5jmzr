import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Edit, Eye, RefreshCw, Shield, ShoppingBag, User } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, SessionUser, UserProfile } from '@/types';

type SessionShape = { user?: SessionUser | null } | null;

declare const authClient: {
  useSession?: () => { data?: SessionShape; isPending?: boolean };
};

const statusTone: Record<string, string> = {
  pending: 'bg-[#EEE8E2] text-[#2E2E2E] border-[#C9BDB2]',
  paid: 'bg-[#8B0000] text-white border-[#8B0000]',
  processing: 'bg-[#EEE8E2] text-[#2E2E2E] border-[#C9BDB2]',
  shipped: 'bg-[#EEE8E2] text-[#2E2E2E] border-[#C9BDB2]',
  delivered: 'bg-[#2E2E2E] text-white border-[#2E2E2E]',
  cancelled: 'bg-white text-[#6E655E] border-[#C9BDB2]',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const session = authClient?.useSession?.();
  const user = session?.data?.user ?? null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.isPending && !user?.id) {
      navigate('/', { replace: true });
    }
  }, [navigate, session?.isPending, user?.id]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [ordersRes, profileRes] = await Promise.all([
          fetch('/api/orders', { credentials: 'include' }),
          fetch('/api/me', { credentials: 'include' }),
        ]);
        const ordersJson = (await ordersRes.json().catch(() => ({}))) as { data?: Order[]; error?: string };
        const profileJson = (await profileRes.json().catch(() => ({}))) as { data?: UserProfile; error?: string };
        setOrders(Array.isArray(ordersJson?.data) ? ordersJson.data : []);
        setProfile(profileJson?.data ?? null);
        if (!ordersRes.ok || !profileRes.ok) toast.error('Unable to load dashboard data');
      } catch {
        toast.error('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.id]);

  const stats = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + (order?.total ?? 0), 0);
    const paid = orders.filter((order) => order?.paymentStatus === 'paid').length;
    return { total, paid, count: orders.length };
  }, [orders]);

  if (!user?.id) return <div className="min-h-[60vh] bg-[#F9F7F6]" />;

  return (
    <main className="bg-[#F9F7F6] px-4 py-8 text-[#2E2E2E] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="border border-[#C9BDB2] bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6E655E]">Account</p>
              <h1 className="mt-2 font-['Playfair_Display'] text-4xl font-light tracking-tight sm:text-5xl">Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6E655E]">
                Manage your profile and review live order history from a single editorial workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate('/shop')} className="inline-flex items-center gap-2 border border-[#C9BDB2] bg-[#EEE8E2] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#2E2E2E] transition hover:bg-white">
                <ShoppingBag className="h-4 w-4" /> Shop
              </button>
              <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#650000]">
                <Eye className="h-4 w-4" /> View Cart
              </button>
            </div>
          </div>
        </motion.section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="border border-[#C9BDB2] bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6E655E]">Profile</p>
                <h2 className="mt-2 font-['Playfair_Display'] text-2xl font-light">Session details</h2>
              </div>
              <Shield className="h-5 w-5 text-[#8B0000]" />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={profile?.name ?? user?.name ?? 'Guest'} icon={<User className="h-4 w-4" />} />
              <Field label="Email" value={profile?.email ?? user?.email ?? '—'} icon={<CheckCircle2 className="h-4 w-4" />} />
              <Field label="Role" value={profile?.role ?? user?.role ?? 'customer'} icon={<Shield className="h-4 w-4" />} />
              <Field label="Phone" value={profile?.phone ?? '—'} icon={<Clock className="h-4 w-4" />} />
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-[#C9BDB2] pt-4">
              <button onClick={() => toast.message('Profile editing is available in the account service')} className="inline-flex items-center gap-2 border border-[#8B0000] bg-[#8B0000] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#650000]">
                <Edit className="h-4 w-4" /> Edit Profile
              </button>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 border border-[#C9BDB2] bg-[#EEE8E2] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#2E2E2E] transition hover:bg-white">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="border border-[#C9BDB2] bg-[#EEE8E2] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6E655E]">Orders</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Stat label="Orders" value={stats.count} />
              <Stat label="Paid" value={stats.paid} />
              <Stat label="Spend" value={`₹${stats.total.toLocaleString('en-IN')}`} />
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                <p className="text-sm text-[#6E655E]">Loading order history…</p>
              ) : orders.length ? (
                orders.map((order) => (
                  <article key={order.id} className="border border-[#C9BDB2] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6E655E]">Order {order.id}</p>
                        <p className="mt-1 text-sm font-semibold text-[#2E2E2E]">{order.items?.length ?? 0} item(s)</p>
                      </div>
                      <span className={`inline-flex items-center border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${statusTone[order.paymentStatus ?? 'pending'] ?? statusTone.pending}`}>
                        {order.paymentStatus ?? 'unpaid'}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {(order.items ?? []).slice(0, 3).map((item) => (
                        <div key={`${order.id}-${item.productId}-${item.name}`} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate text-[#2E2E2E]">{item.name}</span>
                          <span className="shrink-0 text-[#6E655E]">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#C9BDB2] pt-3 text-sm">
                      <span className="text-[#6E655E]">{new Date(order.createdAt ?? Date.now()).toLocaleDateString()}</span>
                      <span className="font-semibold text-[#2E2E2E]">₹{(order.total ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="flex items-start gap-3 border border-[#C9BDB2] bg-white p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#8B0000]" />
                  <p className="text-sm text-[#6E655E]">No orders yet. Your purchase history will appear here once checkout is complete.</p>
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function Field({ label = '', value = '—', icon = null }: { label?: string; value?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="border border-[#C9BDB2] bg-[#F9F7F6] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#6E655E]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-[#2E2E2E]">{value}</p>
    </div>
  );
}

function Stat({ label = '', value = '' }: { label?: string; value?: React.ReactNode }) {
  return (
    <div className="border border-[#C9BDB2] bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6E655E]">{label}</p>
      <p className="mt-2 font-['Playfair_Display'] text-2xl font-light text-[#2E2E2E]">{value}</p>
    </div>
  );
}

export default DashboardPage;