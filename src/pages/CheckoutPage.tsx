import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Lock, MapPin, Phone, Mail, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'better-auth/react';
import { useCart } from '@/context/CartContext';
import type { Address, CheckoutPayload, OrderItem } from '@/types';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { items, clearCart } = useCart() as {
    items?: OrderItem[];
    clearCart?: () => void;
  };

  const cartItems = items ?? [];
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const shipping = subtotal > 15000 ? 0 : subtotal > 0 ? 499 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: session?.user?.name ?? '',
    email: session?.user?.email ?? '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartItems.length) {
      toast.error('Your cart is empty.');
      navigate('/shop');
      return;
    }
    if (!form.fullName || !form.email || !form.line1 || !form.city || !form.state || !form.postalCode || !form.country) {
      toast.error('Please complete the shipping details.');
      return;
    }
    if (!form.cardName || !form.cardNumber || !form.expiry || !form.cvv) {
      toast.error('Please complete the payment details.');
      return;
    }

    const address: Address = {
      id: crypto.randomUUID(),
      fullName: form.fullName,
      line1: form.line1,
      line2: form.line2 || null,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
      phone: form.phone || null,
      isDefault: true,
    };

    const payload: CheckoutPayload = {
      items: cartItems,
      address,
      email: form.email,
      phone: form.phone || undefined,
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Order submission failed');
      clearCart?.();
      toast.success('Order placed successfully.');
      navigate('/shop');
    } catch {
      toast.error('Unable to place order right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-[#F5F1EB] text-[#2B2B2B]">
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 md:grid-cols-[1.15fr_0.85fr] md:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="border border-[#CFC6BA] bg-[#FFFDF9] p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <MapPin className="h-4 w-4" />
              <h1 className="font-['Playfair_Display'] text-3xl font-light tracking-tight">Checkout</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['fullName', 'Full name'],
                ['email', 'Email'],
                ['phone', 'Phone'],
                ['country', 'Country'],
                ['line1', 'Address line 1'],
                ['line2', 'Address line 2'],
                ['city', 'City'],
                ['state', 'State'],
                ['postalCode', 'Postal code'],
              ].map(([key, label]) => (
                <label key={key} className={key === 'line1' || key === 'line2' ? 'md:col-span-2' : ''}>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#716A63]">{label}</span>
                  <input
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full border border-[#CFC6BA] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#8B0000]"
                    type={key === 'email' ? 'email' : 'text'}
                    placeholder={label}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="border border-[#CFC6BA] bg-[#FFFDF9] p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <CreditCard className="h-4 w-4" />
              <h2 className="font-['Playfair_Display'] text-2xl font-light tracking-tight">Payment</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['cardName', 'Name on card'],
                ['cardNumber', 'Card number'],
                ['expiry', 'Expiry MM/YY'],
                ['cvv', 'CVV'],
              ].map(([key, label]) => (
                <label key={key}>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#716A63]">{label}</span>
                  <input
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full border border-[#CFC6BA] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#8B0000]"
                    type="text"
                    placeholder={label}
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-widest text-[#716A63]">
              <Lock className="h-3.5 w-3.5" />
              Secure payment details are processed through your checkout flow.
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !cartItems.length}
            className="inline-flex w-full items-center justify-center gap-2 bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Placing Order' : 'Place Order'}
            <Check className="h-4 w-4" />
          </button>
        </form>

        <aside className="space-y-4">
          <div className="border border-[#CFC6BA] bg-[#FFFDF9] p-5 md:p-6">
            <h2 className="mb-4 font-['Playfair_Display'] text-2xl font-light tracking-tight">Order Summary</h2>
            <div className="space-y-3">
              {cartItems.length ? (
                cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 border-b border-[#CFC6BA] pb-3 last:border-b-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      crossOrigin="anonymous"
                      className="h-16 w-12 shrink-0 border border-[#CFC6BA] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs uppercase tracking-widest text-[#716A63]">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#716A63]">Your cart is empty.</p>
              )}
            </div>
            <div className="mt-5 space-y-2 border-t border-[#CFC6BA] pt-4 text-sm">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex items-center justify-between"><span>Shipping</span><span>{shipping ? `₹${shipping.toLocaleString('en-IN')}` : 'Free'}</span></div>
              <div className="flex items-center justify-between"><span>Tax</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
              <div className="flex items-center justify-between border-t border-[#CFC6BA] pt-2 text-base font-semibold"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          <div className="border border-[#CFC6BA] bg-[#FFFDF9] p-5 md:p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#716A63]">
              <Truck className="h-4 w-4" />
              Delivery
            </div>
            <p className="mt-3 text-sm leading-6 text-[#2B2B2B]">
              Complimentary shipping on orders above ₹15,000. Standard delivery typically arrives within 3–5 business days.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-widest text-[#716A63]">
              <span className="inline-flex items-center gap-2 border border-[#CFC6BA] px-3 py-2"><Mail className="h-3.5 w-3.5" />{form.email || 'Email receipt'}</span>
              <span className="inline-flex items-center gap-2 border border-[#CFC6BA] px-3 py-2"><Phone className="h-3.5 w-3.5" />{form.phone || 'Phone support'}</span>
            </div>
            <Link to="/shop" className="mt-5 inline-flex text-xs font-semibold uppercase tracking-widest text-[#8B0000] hover:text-[#650000]">
              Continue shopping
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default CheckoutPage;