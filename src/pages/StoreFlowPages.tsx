import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CreditCard, MapPin, Package, Shield, ShoppingCart, Truck, User } from 'lucide-react';
import { toast } from 'sonner';
import { useCart, CartContents } from '@/context/CartContext';
import type { CreateOrderPayload, ShippingAddress } from '@/types';

export function CartPage() {
  const navigate = useNavigate();
  const { items = [] } = useCart() as any;
  const count = useMemo(() => items.reduce((sum: number, item: any) => sum + (item?.quantity ?? 0), 0), [items]);
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6E655F]">Cart</p>
          <h1 className="font-['Playfair_Display'] text-4xl font-light tracking-tight text-[#2B2B2B]">Your selected pieces</h1>
          <p className="max-w-2xl text-sm leading-7 text-[#6E655F]">Review your edit, adjust quantities, and continue to checkout when the composition feels complete.</p>
          <div className="rounded-sm border border-[#C9BDB2] bg-white p-4">
            <CartContents />
          </div>
        </div>
        <aside className="space-y-4 rounded-sm border border-[#C9BDB2] bg-[#EFEAE5] p-5">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-[#B11226]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6E655F]">Summary</p>
              <p className="text-sm text-[#2B2B2B]">{count} item{count === 1 ? '' : 's'}</p>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#B11226] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-[#8F0E1F]">
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>
    </section>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items = [], clearCart } = useCart() as any;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ShippingAddress>({ fullName: '', email: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' });
  const subtotal = useMemo(() => items.reduce((sum: number, item: any) => sum + (item?.price ?? 0) * (item?.quantity ?? 0), 0), [items]);
  const shippingFee = subtotal > 15000 ? 0 : 499;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingFee + tax;

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.line1 || !form.city || !form.postalCode || !form.country) return toast.error('Please complete the shipping details.');
    if (!items.length) return toast.error('Your cart is empty.');
    setLoading(true);
    const payload: CreateOrderPayload = { items, shippingAddress: form, paymentMethod: 'card' };
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Order submission failed');
      clearCart?.();
      toast.success('Order placed successfully.');
      navigate('/dashboard');
    } catch {
      toast.error('Unable to place order right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={submitOrder} className="space-y-5 rounded-sm border border-[#C9BDB2] bg-white p-5">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[#B11226]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6E655F]">Checkout</p>
              <h1 className="font-['Playfair_Display'] text-3xl font-light text-[#2B2B2B]">Shipping details</h1>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {['fullName', 'email', 'phone', 'line1', 'line2', 'city', 'state', 'postalCode', 'country'].map((key) => (
              <label key={key} className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6E655F]">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input value={(form as any)?.[key] ?? ''} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} className="w-full rounded-sm border border-[#C9BDB2] bg-[#F9F7F6] px-3 py-3 text-sm text-[#2B2B2B] outline-none transition focus:border-[#B11226]" />
              </label>
            ))}
          </div>
          <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#B11226] px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-[#8F0E1F] disabled:opacity-60">
            <CreditCard className="h-4 w-4" /> {loading ? 'Processing' : 'Place order'}
          </button>
        </form>
        <aside className="space-y-4 rounded-sm border border-[#C9BDB2] bg-[#EFEAE5] p-5">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-[#B11226]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2B2B2B]">Order summary</h2>
          </div>
          <div className="space-y-3 text-sm text-[#2B2B2B]">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shippingFee ? `₹${shippingFee.toLocaleString()}` : 'Complimentary'}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>₹{tax.toLocaleString()}</span></div>
            <div className="border-t border-[#C9BDB2] pt-3 flex justify-between font-semibold"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
          </div>
          <div className="flex items-start gap-3 text-xs leading-6 text-[#6E655F]"><Shield className="mt-0.5 h-4 w-4 text-[#B11226]" /> Secure checkout with live order persistence.</div>
          <div className="flex items-start gap-3 text-xs leading-6 text-[#6E655F]"><Truck className="mt-0.5 h-4 w-4 text-[#B11226]" /> Delivery updates will appear in your account dashboard.</div>
        </aside>
      </div>
    </section>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const orders = [] as any[];
  const profile = { name: 'Guest', email: 'guest@nddn.store' };
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-4 rounded-sm border border-[#C9BDB2] bg-[#EFEAE5] p-5">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-[#B11226]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6E655F]">Account</p>
              <h1 className="font-['Playfair_Display'] text-3xl font-light text-[#2B2B2B]">{profile?.name ?? 'Guest'}</h1>
            </div>
          </div>
          <p className="text-sm text-[#6E655F]">{profile?.email ?? ''}</p>
          <button onClick={() => navigate('/shop')} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#B11226]">
            Continue shopping <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
        <div className="space-y-4 rounded-sm border border-[#C9BDB2] bg-white p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#B11226]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2B2B2B]">Order history</h2>
          </div>
          <div className="space-y-3">
            {orders.length ? orders.map((order) => <div key={order?.id} className="flex items-center justify-between border-b border-[#C9BDB2] py-3 text-sm"><span>{order?.id}</span><span>₹{order?.total ?? 0}</span></div>) : <p className="text-sm text-[#6E655F]">No orders yet. Your first purchase will appear here.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function StoreFlowPages() {
  return <div className="min-h-screen bg-[#F9F7F6] text-[#2B2B2B]" />;
}

export default StoreFlowPages;