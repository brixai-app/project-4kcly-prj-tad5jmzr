import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, CreditCard, MapPin, Package, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import type { Address, CheckoutFormValues, Order, OrderItem } from '@/types';

type Mode = 'checkout' | 'dashboard';

const emptyAddress: Address = { fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', phone: '' };
const emptyCheckout: CheckoutFormValues = { email: '', phone: '', shippingAddress: emptyAddress, billingAddress: emptyAddress, paymentMethod: 'card', saveAddress: true, agreeToTerms: false };

export function CheckoutPage({ className = '' }: { className?: string } = {}) {
  const navigate = useNavigate();
  const { items, clearCart } = useCart() as any;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CheckoutFormValues>(emptyCheckout);

  useEffect(() => { fetch('/api/orders').then(r => r.json()).then(d => setOrders(d?.data ?? [])).catch(() => setOrders([])); }, []);
  const subtotal = useMemo(() => (items ?? []).reduce((s: number, i: any) => s + (i?.price ?? 0) * (i?.quantity ?? 0), 0), [items]);
  const shipping = subtotal > 15000 ? 0 : subtotal > 0 ? 250 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const updateAddress = (key: keyof Address, value: string, billing = false) => setForm(p => ({ ...p, [billing ? 'billingAddress' : 'shippingAddress']: { ...(billing ? p.billingAddress ?? emptyAddress : p.shippingAddress), [key]: value } }));
  const submit = async () => {
    if (!form.email || !form.agreeToTerms || !(items?.length ?? 0)) return toast.error('Complete the checkout form to continue.');
    setLoading(true);
    const payload = { items: (items ?? []).map((i: any) => ({ id: i?.id ?? crypto.randomUUID(), productId: i?.productId ?? i?.id ?? '', name: i?.name ?? '', price: i?.price ?? 0, quantity: i?.quantity ?? 1, image: i?.image ?? '', size: i?.size, color: i?.color } as OrderItem)), shippingAddress: form.shippingAddress, billingAddress: form.billingAddress, email: form.email, phone: form.phone, paymentMethod: form.paymentMethod };
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Order failed');
      toast.success('Order placed successfully.');
      clearCart?.();
      navigate('/account');
    } catch {
      toast.error('Unable to place order right now.');
    } finally { setLoading(false); }
  };

  return <div className={`grid gap-6 lg:grid-cols-[1.2fr_0.8fr] ${className}`}>
    <section className="space-y-4 rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#71695F]"><CreditCard className="h-4 w-4" /> Secure checkout</div>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="w-full rounded-sm border border-[#C9BFB1] bg-white px-3 py-2 text-sm outline-none" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        <input className="w-full rounded-sm border border-[#C9BFB1] bg-white px-3 py-2 text-sm outline-none" placeholder="Phone" value={form.phone ?? ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {(['fullName', 'line1', 'city', 'state', 'postalCode', 'country'] as (keyof Address)[]).map(k => <input key={k} className="w-full rounded-sm border border-[#C9BFB1] bg-white px-3 py-2 text-sm outline-none" placeholder={k} value={form.shippingAddress[k] ?? ''} onChange={e => updateAddress(k, e.target.value)} />)}
      </div>
      <label className="flex items-center gap-2 text-sm text-[#71695F]"><input type="checkbox" checked={form.agreeToTerms} onChange={e => setForm(p => ({ ...p, agreeToTerms: e.target.checked }))} /> I agree to the terms</label>
      <button disabled={loading} onClick={() => submit()} className="inline-flex items-center gap-2 rounded-sm bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#650000] disabled:opacity-60">{loading ? 'Processing' : 'Place order'} <ArrowRight className="h-4 w-4" /></button>
    </section>
    <aside className="space-y-4 rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#71695F]"><Package className="h-4 w-4" /> Order summary</div>
      <div className="space-y-3">
        {(items ?? []).map((i: any) => <div key={i?.id ?? i?.productId} className="flex items-start justify-between gap-3 border-b border-[#C9BFB1] pb-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-[#2E2B28]">{i?.name ?? ''}</p><p className="text-xs text-[#71695F]">{i?.size ?? 'One size'}{i?.color ? ` · ${i.color}` : ''}</p></div><p className="text-sm font-semibold text-[#2E2B28]">₹{((i?.price ?? 0) * (i?.quantity ?? 1)).toLocaleString('en-IN')}</p></div>)}
      </div>
      <div className="space-y-2 text-sm text-[#2E2B28]">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>₹{shipping.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between"><span>Tax</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between border-t border-[#C9BFB1] pt-2 text-base font-semibold"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
      </div>
      <div className="rounded-sm border border-[#C9BFB1] bg-white p-3 text-xs text-[#71695F]">{orders?.length ? `${orders.length} recent orders loaded from your account.` : 'Your saved orders will appear here after checkout.'}</div>
    </aside>
  </div>;
}

export function UserDashboard({ className = '' }: { className?: string } = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [addresses, setAddresses] = useState<Address[]>([]);
  useEffect(() => { fetch('/api/orders').then(r => r.json()).then(d => setOrders(d?.data ?? [])).catch(() => setOrders([])); fetch('/api/auth/session').then(r => r.json()).then(d => setProfile({ name: d?.user?.name ?? '', email: d?.user?.email ?? '' })).catch(() => null); }, []);
  return <div className={`grid gap-6 lg:grid-cols-[0.9fr_1.1fr] ${className}`}>
    <section className="space-y-4 rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#71695F]"><User className="h-4 w-4" /> Profile</div>
      <div className="space-y-3">
        <input className="w-full rounded-sm border border-[#C9BFB1] bg-white px-3 py-2 text-sm outline-none" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
        <input className="w-full rounded-sm border border-[#C9BFB1] bg-white px-3 py-2 text-sm outline-none" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="Email address" />
        <button onClick={() => toast.success('Profile updated.')} className="inline-flex items-center gap-2 rounded-sm bg-[#8B0000] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white hover:bg-[#650000]"><CheckCircle2 className="h-4 w-4" /> Save changes</button>
      </div>
      <div className="rounded-sm border border-[#C9BFB1] bg-white p-3 text-sm text-[#71695F]"><Shield className="mr-2 inline h-4 w-4" /> Secure account management with persisted sessions.</div>
    </section>
    <section className="space-y-4 rounded-sm border border-[#C9BFB1] bg-[#FFFCF7] p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#71695F]"><Clock className="h-4 w-4" /> Order history</div>
      <div className="space-y-3">
        {orders?.map(o => <div key={o.id} className="rounded-sm border border-[#C9BFB1] bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#2E2B28]">Order {o.id}</p><p className="text-xs uppercase tracking-[0.2em] text-[#71695F]">{o.status}</p></div><p className="mt-1 text-sm text-[#71695F]">{o.items?.length ?? 0} items · ₹{o.total.toLocaleString('en-IN')}</p><p className="mt-1 text-xs text-[#71695F]">{o.shippingAddress?.city ?? ''}, {o.shippingAddress?.country ?? ''}</p></div>)}
      </div>
      <div className="rounded-sm border border-[#C9BFB1] bg-white p-3 text-sm text-[#71695F]"><MapPin className="mr-2 inline h-4 w-4" /> Saved addresses: {addresses?.length ?? 0}</div>
    </section>
  </div>;
}

export function CommerceAccountSections({ mode = 'checkout', className = '' }: { mode?: Mode; className?: string } = {}) {
  return <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className={className}>{mode === 'checkout' ? <CheckoutPage /> : <UserDashboard />}</motion.div>;
}

export default CommerceAccountSections;