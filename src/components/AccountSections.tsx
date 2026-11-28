import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, CreditCard, Mail, MapPin, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import type { CheckoutPayload, Order, SessionState } from '@/types';

type AuthClient = {
  getSession?: () => Promise<{ data?: SessionState | null } | SessionState | null>;
  signIn?: (payload: { email: string; password: string }) => Promise<unknown>;
  signUp?: (payload: { email: string; password: string; name?: string }) => Promise<unknown>;
};

const authClient = (globalThis as { authClient?: AuthClient }).authClient ?? {};

type CheckoutFormProps = { className?: string };
type OrderSummaryProps = { className?: string; compact?: boolean };
type DashboardPanelProps = { className?: string };
type OrderHistoryListProps = { className?: string; email?: string };

const money = (value: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value ?? 0);

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function CheckoutForm({ className = '' }: CheckoutFormProps) {
  const navigate = useNavigate();
  const { items, clearCart, subtotal } = useCart() as {
    items?: Array<{ productId: string; quantity: number; size?: string; color?: string; product?: { name?: string; price?: number; image?: string } }>;
    clearCart?: () => void;
    subtotal?: number;
  };
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<SessionState>({ isAuthenticated: false, user: null });
  const [errors, setErrors] = useState<{ email?: string; shippingAddress?: string }>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await authClient?.getSession?.();
      const next = (result as { data?: SessionState | null } | SessionState | null)?.data ?? (result as SessionState | null);
      if (mounted && next) setSession(next);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email);
  }, [session?.user?.email]);

  const shipping = useMemo(() => (subtotal ?? 0) > 15000 ? 0 : 250, [subtotal]);
  const tax = useMemo(() => Math.round((subtotal ?? 0) * 0.18), [subtotal]);
  const total = useMemo(() => (subtotal ?? 0) + shipping + tax, [subtotal, shipping, tax]);

  const validate = () => {
    const next: { email?: string; shippingAddress?: string } = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!shippingAddress.trim() || shippingAddress.trim().length < 12) next.shippingAddress = 'Enter a complete shipping address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    if (!(items?.length ?? 0)) {
      toast.error('Your cart is empty.');
      return;
    }
    setLoading(true);
    const payload: CheckoutPayload = { email: email.trim(), items: items ?? [], shippingAddress: shippingAddress.trim(), notes: notes.trim() || undefined };
    const res = await fetchJson<{ data?: Order; error?: string; message?: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res?.data) {
      toast.error(res?.error ?? 'Unable to place order.');
      return;
    }
    clearCart?.();
    toast.success('Order placed successfully.');
    navigate('/shop');
  };

  return (
    <section className={`grid gap-6 lg:grid-cols-[1.2fr_0.8fr] ${className}`}>
      <div className="space-y-4 rounded-sm border border-[#C9BEB4] bg-white p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#6F665F]">
          <Shield className="h-4 w-4" />
          Secure checkout
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-sm border border-[#C9BEB4] bg-[#F9F7F6] px-3 py-3 text-sm text-[#2E2E2E] outline-none transition focus:border-[#8B0000]" placeholder="you@example.com" />
            {errors.email ? <span className="text-xs text-[#8B0000]">{errors.email}</span> : null}
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Shipping address</span>
            <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={4} className="w-full rounded-sm border border-[#C9BEB4] bg-[#F9F7F6] px-3 py-3 text-sm text-[#2E2E2E] outline-none transition focus:border-[#8B0000]" placeholder="Street, city, state, postal code" />
            {errors.shippingAddress ? <span className="text-xs text-[#8B0000]">{errors.shippingAddress}</span> : null}
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F665F]">Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-sm border border-[#C9BEB4] bg-[#F9F7F6] px-3 py-3 text-sm text-[#2E2E2E] outline-none transition focus:border-[#8B0000]" placeholder="Delivery instructions or gift note" />
          </label>
        </div>
        <button type="button" onClick={() => void submit()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60">
          <CreditCard className="h-4 w-4" />
          {loading ? 'Processing' : 'Place order'}
        </button>
      </div>
      <OrderSummary compact />
    </section>
  );
}

export function OrderSummary({ className = '', compact = false }: OrderSummaryProps) {
  const { items, subtotal } = useCart() as { items?: Array<{ quantity: number; product?: { name?: string; price?: number } }>; subtotal?: number };
  const shipping = (subtotal ?? 0) > 15000 ? 0 : 250;
  const tax = Math.round((subtotal ?? 0) * 0.18);
  const total = (subtotal ?? 0) + shipping + tax;
  return (
    <aside className={`rounded-sm border border-[#C9BEB4] bg-[#F1ECE7] p-5 ${className}`}>
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#6F665F]">
        <CheckCircle2 className="h-4 w-4" />
        Order summary
      </div>
      <div className="space-y-3 text-sm text-[#2E2E2E]">
        {(items?.length ?? 0) ? items?.map((item, index) => (
          <div key={`${item?.product?.name ?? 'item'}-${index}`} className="flex items-start justify-between gap-3 border-b border-[#C9BEB4] pb-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{item?.product?.name ?? 'Item'}</p>
              <p className="text-xs text-[#6F665F]">Qty {item?.quantity ?? 0}</p>
            </div>
            <p className="shrink-0 font-semibold">{money((item?.product?.price ?? 0) * (item?.quantity ?? 0))}</p>
          </div>
        )) : <p className="text-[#6F665F]">Your cart is currently empty.</p>}
        <div className="flex items-center justify-between"><span className="text-[#6F665F]">Subtotal</span><span className="font-semibold">{money(subtotal ?? 0)}</span></div>
        <div className="flex items-center justify-between"><span className="text-[#6F665F]">Shipping</span><span className="font-semibold">{money(shipping)}</span></div>
        <div className="flex items-center justify-between"><span className="text-[#6F665F]">Tax</span><span className="font-semibold">{money(tax)}</span></div>
        <div className="flex items-center justify-between border-t border-[#C9BEB4] pt-3 text-base"><span className="font-semibold">Total</span><span className="font-semibold">{money(total)}</span></div>
      </div>
      {compact ? null : <p className="mt-4 text-xs leading-5 text-[#6F665F]">Orders are confirmed instantly and stored securely in your account history.</p>}
    </aside>
  );
}

export function OrderHistoryList({ className = '', email = '' }: OrderHistoryListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!email.trim()) return;
    setLoading(true);
    (async () => {
      const res = await fetchJson<{ data?: Order[]; error?: string }>(`/api/orders?email=${encodeURIComponent(email.trim())}`);
      if (mounted) {
        setOrders(res?.data ?? []);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [email]);

  return (
    <section className={`rounded-sm border border-[#C9BEB4] bg-white p-5 ${className}`}>
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#6F665F]">
        <Clock className="h-4 w-4" />
        Order history
      </div>
      {loading ? <p className="text-sm text-[#6F665F]">Loading orders…</p> : null}
      <div className="space-y-3">
        {orders?.length ? orders.map((order) => (
          <article key={order?.id} className="rounded-sm border border-[#C9BEB4] bg-[#F9F7F6] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#2E2E2E]">{order?.id}</p>
                <p className="text-xs text-[#6F665F]">{new Date(order?.createdAt ?? '').toLocaleDateString()}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8B0000]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {order?.status ?? 'pending'}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#6F665F]">{order?.items?.length ?? 0} items</span>
              <span className="font-semibold">{money(order?.total ?? 0)}</span>
            </div>
          </article>
        )) : <p className="text-sm text-[#6F665F]">No orders found for this account.</p>}
      </div>
    </section>
  );
}

export function DashboardPanel({ className = '' }: DashboardPanelProps) {
  const [session, setSession] = useState<SessionState>({ isAuthenticated: false, user: null });
  const [email, setEmail] = useState('');
  useEffect(() => {
    (async () => {
      const result = await authClient?.getSession?.();
      const next = (result as { data?: SessionState | null } | SessionState | null)?.data ?? (result as SessionState | null);
      if (next) {
        setSession(next);
        setEmail(next?.user?.email ?? '');
      }
    })();
  }, []);
  return (
    <section className={`grid gap-6 lg:grid-cols-[0.9fr_1.1fr] ${className}`}>
      <div className="rounded-sm border border-[#C9BEB4] bg-[#F1ECE7] p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#6F665F]"><User className="h-4 w-4" />Account</div>
        <div className="mt-4 space-y-3 text-sm">
          <p className="flex items-center gap-2 text-[#2E2E2E]"><Mail className="h-4 w-4 text-[#6F665F]" />{session?.user?.email ?? 'Guest'}</p>
          <p className="flex items-center gap-2 text-[#2E2E2E]"><MapPin className="h-4 w-4 text-[#6F665F]" />{session?.isAuthenticated ? 'Signed in' : 'Sign in to view orders'}</p>
          <p className="flex items-center gap-2 text-[#2E2E2E]"><AlertCircle className="h-4 w-4 text-[#6F665F]" />{email ? 'Live order history enabled' : 'No active session detected'}</p>
        </div>
      </div>
      <OrderHistoryList email={email} />
    </section>
  );
}

export default CheckoutForm;