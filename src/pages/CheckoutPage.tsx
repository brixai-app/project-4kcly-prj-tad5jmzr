import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Lock, MapPin, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import type { CheckoutAddressPayload, CheckoutPayload, Order } from '@/types';

type FieldErrors = Partial<Record<'name' | 'email' | 'line1' | 'city' | 'postalCode' | 'country' | 'paymentMethod', string>>;

const initialAddress = { name: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', phone: '' };
const paymentMethods: Array<{ value: 'card' | 'upi' | 'cod'; label: string }> = [
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'cod', label: 'Cash on delivery' },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart, subtotal } = useCart() as {
    items?: Array<{ productId: string; quantity: number; size?: string; color?: string; name?: string; price?: number; image?: string }>;
    clearCart?: () => void;
    subtotal?: number;
  };
  const [shipping, setShipping] = useState(initialAddress);
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState(initialAddress);
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const cartItems = items ?? [];
  const cartSubtotal = subtotal ?? cartItems.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0), 0);
  const shippingFee = cartSubtotal > 25000 ? 0 : cartSubtotal > 0 ? 499 : 0;
  const tax = Math.round(cartSubtotal * 0.05);
  const total = cartSubtotal + shippingFee + tax;

  useEffect(() => {
    if (cartItems.length === 0) navigate('/shop');
  }, [cartItems.length, navigate]);

  const validate = () => {
    const next: FieldErrors = {};
    if (!shipping.name.trim()) next.name = 'Name is required.';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email.';
    if (!shipping.line1.trim()) next.line1 = 'Address line 1 is required.';
    if (!shipping.city.trim()) next.city = 'City is required.';
    if (!shipping.postalCode.trim()) next.postalCode = 'Postal code is required.';
    if (!shipping.country.trim()) next.country = 'Country is required.';
    if (!paymentMethod) next.paymentMethod = 'Select a payment method.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const addressPayload = (a: typeof shipping): CheckoutAddressPayload => ({
    name: a.name.trim(),
    line1: a.line1.trim(),
    line2: a.line2.trim() || undefined,
    city: a.city.trim(),
    state: a.state.trim() || undefined,
    postalCode: a.postalCode.trim(),
    country: a.country.trim(),
    phone: a.phone.trim() || undefined,
  });

  const canSubmit = useMemo(() => cartItems.length > 0 && !!email.trim() && !!shipping.name.trim() && !!shipping.line1.trim() && !!shipping.city.trim() && !!shipping.postalCode.trim() && !!shipping.country.trim() && !submitting, [cartItems.length, email, shipping, submitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || cartItems.length === 0) return;
    setSubmitting(true);
    const payload: CheckoutPayload = {
      items: cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity, size: item.size, color: item.color })),
      shippingAddress: addressPayload(shipping),
      billingAddress: billingSame ? undefined : addressPayload(billing),
      email: email.trim(),
      notes: notes.trim() || undefined,
      paymentMethod,
    };
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as { data?: Order; message?: string; error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? json?.message ?? 'Unable to place order.');
      toast.success('Order placed successfully.');
      clearCart?.();
      navigate('/shop');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (label: string, value: string, onChange: (v: string) => void, error?: string, type = 'text', placeholder = '') => (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6E655E]">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder} className="w-full rounded-sm border border-[#C9BDB2] bg-white px-3 py-2 text-sm text-[#2E2E2E] outline-none transition focus:border-[#8B0000]" />
      {error ? <span className="text-xs text-[#8B0000]">{error}</span> : null}
    </label>
  );

  return (
    <div className="bg-[#F9F7F6] px-4 py-6 text-[#2E2E2E] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.4fr)_360px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6E655E] transition hover:text-[#8B0000]">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <section className="rounded-sm border border-[#C9BDB2] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#8B0000]" />
              <h1 className="font-['Playfair_Display'] text-3xl font-light tracking-tight">Checkout</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {field('Full name', shipping.name, (v) => setShipping((s) => ({ ...s, name: v })), errors.name)}
              {field('Email', email, setEmail, errors.email, 'email')}
              {field('Address line 1', shipping.line1, (v) => setShipping((s) => ({ ...s, line1: v })), errors.line1)}
              {field('Address line 2', shipping.line2, (v) => setShipping((s) => ({ ...s, line2: v })))}
              {field('City', shipping.city, (v) => setShipping((s) => ({ ...s, city: v })), errors.city)}
              {field('State', shipping.state, (v) => setShipping((s) => ({ ...s, state: v })))}
              {field('Postal code', shipping.postalCode, (v) => setShipping((s) => ({ ...s, postalCode: v })), errors.postalCode)}
              {field('Country', shipping.country, (v) => setShipping((s) => ({ ...s, country: v })), errors.country)}
              {field('Phone', shipping.phone, (v) => setShipping((s) => ({ ...s, phone: v })), undefined, 'tel')}
            </div>
          </section>

          <section className="rounded-sm border border-[#C9BDB2] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#8B0000]" />
              <h2 className="font-['Playfair_Display'] text-2xl font-light tracking-tight">Payment</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <button key={method.value} type="button" onClick={() => setPaymentMethod(method.value)} className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${paymentMethod === method.value ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#C9BDB2] bg-[#F9F7F6] text-[#2E2E2E]'}`}>
                  {method.label}
                </button>
              ))}
            </div>
            {errors.paymentMethod ? <p className="mt-2 text-xs text-[#8B0000]">{errors.paymentMethod}</p> : null}
            <div className="mt-4 rounded-sm border border-[#C9BDB2] bg-[#F9F7F6] p-4 text-sm text-[#6E655E]">
              <div className="flex items-center gap-2 text-[#2E2E2E]"><Lock className="h-4 w-4" /> Secure payment flow</div>
              <p className="mt-2">Your order will be processed after submission and confirmation.</p>
            </div>
          </section>

          <section className="rounded-sm border border-[#C9BDB2] bg-white p-5">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} className="mt-1 h-4 w-4 accent-[#8B0000]" />
              <span className="text-sm text-[#2E2E2E]">Billing address is the same as shipping</span>
            </label>
            {!billingSame ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {field('Billing name', billing.name, (v) => setBilling((s) => ({ ...s, name: v })))}
                {field('Billing line 1', billing.line1, (v) => setBilling((s) => ({ ...s, line1: v })))}
                {field('Billing city', billing.city, (v) => setBilling((s) => ({ ...s, city: v })))}
                {field('Billing postal code', billing.postalCode, (v) => setBilling((s) => ({ ...s, postalCode: v })))}
              </div>
            ) : null}
            <label className="mt-4 flex min-w-0 flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6E655E]">Order notes</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full rounded-sm border border-[#C9BDB2] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#8B0000]" />
            </label>
          </section>

          <button type="submit" disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 bg-[#8B0000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" /> Place order
          </button>
        </form>

        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-sm border border-[#C9BDB2] bg-white p-5">
            <h2 className="font-['Playfair_Display'] text-2xl font-light tracking-tight">Order summary</h2>
            <div className="mt-4 space-y-3">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.size ?? 'na'}-${item.color ?? 'na'}`} className="flex items-start justify-between gap-3 border-b border-[#EEE8E2] pb-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name ?? 'Item'}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6E655E]">Qty {item.quantity ?? 1}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">₹{((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#6E655E]">Subtotal</span><span>₹{cartSubtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-[#6E655E]">Shipping</span><span>₹{shippingFee.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-[#6E655E]">Tax</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between border-t border-[#C9BDB2] pt-2 text-base font-semibold"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#6E655E]"><Truck className="h-4 w-4" /> Delivery in 3-5 business days</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;